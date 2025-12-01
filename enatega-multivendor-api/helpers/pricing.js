// services/pricing.js
const RequestorOverride = require('../models/RequestorOverride')
const PrepaidDeliveryPackage = require('../models/prepaidDeliveryPackage')
const DeliveryPrice = require('../models/DeliveryPrice') // old fixed cost area->area
const CityPricing = require('../models/CityPricing')
const CountryPricing = require('../models/CountryPricing')
const GlobalDeliveryPricing = require('../models/globalDeliveryPricing')
const Coupon = require('../models/coupon')
const DeliveryZone = require('../models/deliveryZone')
const Restaurant = require('../models/restaurant')
const User = require('../models/user')

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  // Haversine (digit-by-digit arithmetic style)
  const R = 6371
  const toRad = deg => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

function applyModel(model, params = {}, distanceKm) {
  // params: fixed, per_km, min_fee, included_km, baseFare (hybrid base)
  const fixed = Number(params.fixed || 0)
  const per_km = Number(params.per_km || 0)
  const min_fee = Number(params.min_fee || 0)
  const included_km = Number(params.included_km || 0)
  const baseFare = Number(
    params.baseFare || params.base_fare || params.fixed || 0
  )

  switch ((model || '').toUpperCase()) {
    case 'FIXED':
      return fixed
    case 'PER_KM': {
      const raw = per_km * distanceKm
      return Math.max(min_fee || 0, raw)
    }
    case 'HYBRID': {
      // baseFare + per_km * max(0, distance - included_km)
      const extraKm = Math.max(0, distanceKm - included_km)
      const raw = baseFare + per_km * extraKm
      return Math.max(min_fee || 0, raw)
    }
    default:
      return null
  }
}

/**
 * Main unified pricing function following the confirmed priority:
 * 1. Requestor Override
 * 2. Prepaid Package (FOOD)
 * 3. Zone -> Zone (old DeliveryPrice.cost)
 * 4. City Pricing (originZone.city)
 * 5. Country Pricing (originZone.country or originZone.country._id)
 * 6. Global Delivery Pricing
 * 7. Coupons
 * 8. Minimum delivery fee guard (applies for non-FIXED models)
 * 9. Anti-manipulation mismatch
 *
 * Returns:
 * { amount, originalAmountBeforeDiscounts, isPrepaid, mismatch, breakdown, matchedRuleId }
 */
async function calculateUnifiedDeliveryFee({
  originLat,
  originLong,
  destLat,
  destLong,
  serviceType = 'FOOD',
  requestorId = null, // business id for overrides or prepaid (restaurant)
  couponCode = null,
  clientProvidedAmount = null,
  city = null
}) {
  if (
    originLat === undefined ||
    originLong === undefined ||
    destLat === undefined ||
    destLong === undefined
  ) {
    throw new Error('origin and destination coordinates required')
  }

  // 0. compute distance
  const distanceKm = calculateDistanceKm(
    originLat,
    originLong,
    destLat,
    destLong
  )

  // breakdown object
  const breakdown = {
    distanceKm,
    modelSource: null,
    params: {},
    couponDiscount: 0,
    packageApplied: false,
    surgeMultiplier: 1
  }

  let amount = null
  let matchedRuleId = null
  let isPrepaid = false
  let originalAmountBeforeDiscounts = null

  // 1. resolve origin & destination zones if possible
  const pickupPoint = { type: 'Point', coordinates: [originLong, originLat] }
  const dropoffPoint = { type: 'Point', coordinates: [destLong, destLat] }

  let originZone = null
  let destinationZone = null
  try {
    originZone = await DeliveryZone.findOne({
      location: { $geoIntersects: { $geometry: pickupPoint } }
    }).lean()
    destinationZone = await DeliveryZone.findOne({
      location: { $geoIntersects: { $geometry: dropoffPoint } }
    }).lean()
  } catch (e) {
    // ignore - tests may not have geo; caller may stub DeliveryZone.findOne
    originZone = originZone || null
    destinationZone = destinationZone || null
  }

  console.log({ dropoffPoint, originZone, destinationZone })

  // find restaurant if exists can get the city -> works with food delivery only
  const restaurant = await Restaurant.findById(requestorId)

  // -------------------------
  // 1) Requestor Override (highest priority)
  // -------------------------
  console.log({ requestorId })
  // const no = false // for testing the flow
  if (requestorId) {
    try {
      console.log('Checking business delivery config')
      const override = await RequestorOverride.findOne({
        requestor_id: requestorId,
        service: serviceType,
        status: 'ACTIVE'
      }).lean()
      console.log({ override })
      if (override) {
        const computed = applyModel(
          override.model,
          override.params || {},
          distanceKm
        )
        console.log({ computed })
        if (computed !== null) {
          console.log('Business has delivery config')
          amount = computed
          matchedRuleId = override._id
          breakdown.modelSource = 'REQUESTOR_OVERRIDE'
          breakdown.params = override.params || {}
        }
      }
    } catch (e) {
      // swallow and continue
    }
  }

  // -------------------------
  // 2) Prepaid package (only for FOOD)
  // -------------------------
  if (
    (amount === null || amount === undefined) &&
    requestorId &&
    String(serviceType).toUpperCase() === 'FOOD'
  ) {
    try {
      console.log('Checking prepaid package')
      const pkg = await PrepaidDeliveryPackage.findOne({
        business: requestorId,
        isActive: true,
        expiresAt: { $gte: new Date() }
      }).lean()
      if (pkg) {
        const remaining = (pkg.totalDeliveries || 0) - (pkg.usedDeliveries || 0)
        if (remaining > 0) {
          console.log('Business has a prepaid package config ... applied!')
          isPrepaid = true
          amount = 0 // business covers
          matchedRuleId = pkg._id
          breakdown.modelSource = 'PREPAID_PACKAGE'
          breakdown.packageApplied = true
        }
      }
    } catch (e) {}
  }

  // -------------------------
  // 3) Zone -> Zone (old DeliveryPrice.cost)
  // -------------------------
  if (
    (amount === null || amount === undefined) &&
    originZone &&
    destinationZone
  ) {
    try {
      console.log('Checking delivery zones...')
      const zoneRule = await DeliveryPrice.findOne({
        $or: [
          { originZone: originZone._id, destinationZone: destinationZone._id },
          { originZone: destinationZone._id, destinationZone: originZone._id }
        ]
      }).lean()
      console.log({ zoneRule })
      if (zoneRule) {
        console.log('Delivery zones pricing applied')
        amount = Number(zoneRule.cost || 0)
        matchedRuleId = zoneRule._id
        breakdown.modelSource = 'AREA_TO_AREA'
        breakdown.params = { cost: amount }
      }
    } catch (e) {}
  }

  // -------------------------
  // 4) City Pricing (originZone.city)
  // -------------------------
  const cityId = restaurant?.city || city
  if ((amount === null || amount === undefined) && cityId) {
    try {
      const cityRule = await CityPricing.findOne({
        city: cityId,
        service: serviceType,
        status: 'ACTIVE'
      }).lean()
      console.log('Checking city delivery config')
      if (cityRule) {
        const computed = applyModel(
          cityRule.model,
          cityRule.params || {},
          distanceKm
        )
        console.log('Checking city delivery config applied')
        amount = computed
        matchedRuleId = cityRule._id
        breakdown.modelSource = 'CITY_DEFAULT'
        breakdown.params = cityRule.params || {}
      }
    } catch (e) {}
  }

  // -------------------------
  // 5) Country Pricing (originZone.country)
  // -------------------------

  // console.log({ user: req.user })
  // const user = await User.findById(req.user._id)
  // const countryId = restaurant?.country || user.country
  const countryId = restaurant?.country
  if ((amount === null || amount === undefined) && countryId) {
    try {
      // originZone.country may be ObjectId or string; search accordingly
      const countryFilter = {}
      // If originZone.country is an object or id-like, allow both
      if (typeof countryId === 'string') {
        countryFilter.country = countryId
      } else if (countryId && countryId) {
        countryFilter.country = countryId
      } else {
        countryFilter.country = countryId
      }
      console.log('Checking country delivery pricing')
      const countryRule = await CountryPricing.findOne({
        ...countryFilter,
        service: serviceType,
        status: 'ACTIVE'
      }).lean()
      if (countryRule) {
        const computed = applyModel(
          countryRule.model,
          countryRule.params || {},
          distanceKm
        )
        console.log('Country delivery pricing applied')
        amount = computed
        matchedRuleId = countryRule._id
        breakdown.modelSource = 'COUNTRY_DEFAULT'
        breakdown.params = countryRule.params || {}
      }
    } catch (e) {}
  }

  // -------------------------
  // 6) Global Delivery Pricing (final structured fallback)
  // -------------------------
  if (amount === null || amount === undefined) {
    try {
      console.log('Checking global delivery pricing config')
      const global = await GlobalDeliveryPricing.findOne().lean()
      // if not present, fallback to simple default
      const globalDoc = global || {
        model: 'PER_KM',
        params: { per_km: 5 },
        minimumDeliveryFee: 10
      }
      const computed = applyModel(
        globalDoc.model,
        globalDoc.params || {},
        distanceKm
      )
      amount = computed
      matchedRuleId = globalDoc._id || null
      breakdown.modelSource = 'GLOBAL_DELIVERY_PRICING'
      breakdown.params = globalDoc.params || {}
      // store minimum for later guard
      breakdown.minimumDeliveryFee = globalDoc.minimumDeliveryFee || 0
      // for FIXED don't apply minimumDeliveryFee
      console.log('Global delivery pricing applied')
      if ((globalDoc.model || '').toUpperCase() !== 'FIXED') {
        if (
          breakdown.minimumDeliveryFee &&
          amount < breakdown.minimumDeliveryFee
        ) {
          amount = breakdown.minimumDeliveryFee
        }
      }
    } catch (e) {
      // default fallback
      amount = 0
    }
  }

  // Save original pre-discount
  originalAmountBeforeDiscounts = Math.round(Number(amount || 0) * 100) / 100

  // -------------------------
  // 7) Coupon logic
  // -------------------------
  let discountApplied = 0

  if (couponCode && amount > 0) {
    // defensive: ensure collection exists / model present
    let coupon
    try {
      coupon = await Coupon.findOne({ code: couponCode }).lean()
    } catch (e) {
      // if coupon lookup failure, explicitly set coupon to null
      coupon = null
    }

    console.log('Applying coupon delivery pricing config')

    if (coupon && coupon.rules) {
      // normalize applies_to to array of lowercase strings (defensive)
      const applies = Array.isArray(coupon.rules.applies_to)
        ? coupon.rules.applies_to.map(s =>
            typeof s === 'string' ? s.toLowerCase() : s
          )
        : []

      // check membership
      if (applies.includes('delivery')) {
        console.log('Coupon delivery pricing config applied')
        const discount_type = coupon.rules.discount_type
        const discount_value = Number(coupon.rules.discount_value || 0)
        const max_discount = coupon.rules.max_discount

        let discount = 0
        if (discount_type === 'percent') {
          discount = (discount_value / 100) * amount
        } else if (discount_type === 'flat') {
          discount = discount_value
        }

        if (typeof max_discount === 'number') {
          discount = Math.min(discount, max_discount)
        }

        // round discount to cents
        discount = Math.round(discount * 100) / 100

        discountApplied = discount
        amount = Math.max(0, amount - discount)

        // always record couponDiscount as a number (0 if discount 0)
        breakdown.couponDiscount = discount
      } else {
        // coupon exists but not applicable to delivery
        breakdown.couponDiscount = 0
      }
    } else {
      // no coupon found or malformed rules
      breakdown.couponDiscount = 0
    }
  } else {
    // no couponCode or amount <= 0
    breakdown.couponDiscount = 0
  }

  // -------------------------
  // 8) final minimum guard (distance tiny => use minimum)
  // Only apply minimum guard when model is NOT FIXED (we handled global above)
  // -------------------------
  try {
    // if matchedRuleId refers to a GlobalDeliveryPricing, we already applied its min above.
    // But ensure system-wide safe minimum: if distance <= 0.1 set to minimumDeliveryFee if configured.
    const sysMin = breakdown.minimumDeliveryFee || 0
    if (distanceKm <= 0.1 && sysMin) {
      amount = sysMin
    }
  } catch (e) {}

  // Round final
  amount = Math.round(Number(amount || 0) * 100) / 100

  // -------------------------
  // 9) Anti-manipulation mismatch
  // -------------------------
  let mismatch = false
  if (typeof clientProvidedAmount === 'number') {
    const tolerance = 0.01
    mismatch = Math.abs(clientProvidedAmount - amount) > tolerance
  }

  return {
    amount,
    originalAmountBeforeDiscounts,
    isPrepaid,
    mismatch,
    breakdown,
    matchedRuleId
  }
}

module.exports = {
  calculateUnifiedDeliveryFee
}
