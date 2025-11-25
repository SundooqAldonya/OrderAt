const RequestorOverride = require('../models/RequestorOverride')
const Configuration = require('../models/configuration')
const DeliveryZone = require('../models/deliveryZone')
// const DeliveryPriceV2 = require('../models/deliveryPriceV2')
const DeliveryPrice = require('../models/DeliveryPrice')
const PrepaidDeliveryPackage = require('../models/prepaidDeliveryPackage')
const CityPricing = require('../models/CityPricing')
const CountryPricing = require('../models/CountryPricing')
const Coupon = require('../models/coupon')

// -------------------------
// HELPERS
// -------------------------

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function applyModel(model, params, distance) {
  const fixed = params?.fixed || 0
  const per_km = params?.per_km || 0
  const min_fee = params?.min_fee || 0
  const included_km = params?.included_km || 0

  switch (model) {
    case 'FIXED':
      return fixed

    case 'PER_KM':
      return Math.max(min_fee, per_km * distance)

    case 'HYBRID':
      return Math.max(
        min_fee,
        fixed + per_km * Math.max(0, distance - included_km)
      )

    default:
      return null
  }
}

async function getConfig() {
  try {
    const cfg = await Configuration.findOne().lean()
    return (
      cfg || { costType: 'PER_KM', deliveryRate: 5, minimumDeliveryFee: 10 }
    )
  } catch {
    return { costType: 'PER_KM', deliveryRate: 5, minimumDeliveryFee: 10 }
  }
}

// -------------------------
// MAIN FUNCTION
// -------------------------

async function calculateUnifiedDeliveryFee({
  originLat,
  originLong,
  destLat,
  destLong,
  serviceType = 'MASHAWEER',
  restaurantId = null,
  couponCode = null,
  clientProvidedAmount = null
}) {
  if (!originLat || !originLong || !destLat || !destLong) {
    throw new Error('origin and destination coordinates required')
  }

  const distanceKm = calculateDistanceKm(
    originLat,
    originLong,
    destLat,
    destLong
  )

  const config = await getConfig()

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
  } catch {}

  let amount = null
  let matchedRuleId = null
  let breakdown = {
    modelSource: null,
    params: {},
    distanceKm,
    couponDiscount: 0,
    surgeMultiplier: 1,
    packageApplied: false
  }

  // --------------------------------------------------
  // 1. REQUESTOR OVERRIDE (Highest Priority)
  // --------------------------------------------------
  const override = await RequestorOverride.findOne({
    requestor_id: restaurantId,
    service: serviceType,
    status: 'ACTIVE'
  }).lean()

  if (override) {
    const calc = applyModel(override.model, override.params, distanceKm)

    if (calc !== null) {
      amount = calc
      matchedRuleId = override._id
      breakdown.modelSource = 'REQUESTOR_OVERRIDE'
      breakdown.params = override.params
    }
  }

  // --------------------------------------------------
  // 2. PREPAID PACKAGE
  // --------------------------------------------------
  if (!amount && restaurantId && serviceType === 'FOOD') {
    const pkg = await PrepaidDeliveryPackage.findOne({
      business: restaurantId,
      isActive: true,
      expiresAt: { $gte: new Date() }
    }).lean()

    if (pkg) {
      const remaining = (pkg.totalDeliveries || 0) - (pkg.usedDeliveries || 0)

      if (remaining > 0) {
        amount = 0 // business pays
        matchedRuleId = pkg._id
        breakdown.modelSource = 'PREPAID_PACKAGE'
        breakdown.packageApplied = true
      }
    }
  }

  // --------------------------------------------------
  // 3. ZONE → ZONE PRICING
  // --------------------------------------------------
  // OLD model zone pricing
  if (originZone && destinationZone) {
    const zoneRule = await DeliveryPrice.findOne({
      $or: [
        { originZone: originZone._id, destinationZone: destinationZone._id },
        { originZone: destinationZone._id, destinationZone: originZone._id }
      ]
    })

    if (zoneRule) {
      amount = zoneRule.cost
      breakdown.modelSource = 'AREA_TO_AREA'
      matchedRuleId = zoneRule._id
    }
  }
  // if (!amount && originZone && destinationZone) {
  //   const zoneRule = await DeliveryPriceV2.findOne({
  //     $or: [
  //       { originZone: originZone._id, destinationZone: destinationZone._id },
  //       { originZone: destinationZone._id, destinationZone: originZone._id }
  //     ],
  //     isActive: true
  //   }).lean()

  //   if (zoneRule) {
  //     const base = zoneRule.baseFare || 0
  //     const perKm = zoneRule.perKmRate || 0
  //     const surge = zoneRule.surgeMultiplier || 1

  //     let total = (base + perKm * distanceKm) * surge
  //     if (total < zoneRule.minFare) total = zoneRule.minFare

  //     amount = total
  //     matchedRuleId = zoneRule._id

  //     breakdown.modelSource = 'AREA_TO_AREA'
  //     breakdown.params = {
  //       baseFare: base,
  //       perKmRate: perKm,
  //       surgeMultiplier: surge
  //     }
  //   }
  // }

  // --------------------------------------------------
  // 4. CITY PRICING
  // --------------------------------------------------
  if (!amount && originZone?.city) {
    const cityRule = await CityPricing.findOne({
      city: originZone.city,
      service: serviceType,
      status: 'ACTIVE'
    }).lean()

    if (cityRule) {
      amount = applyModel(cityRule.model, cityRule.params, distanceKm)
      matchedRuleId = cityRule._id
      breakdown.modelSource = 'CITY_DEFAULT'
      breakdown.params = cityRule.params
    }
  }

  // --------------------------------------------------
  // 5. COUNTRY PRICING
  // --------------------------------------------------
  if (!amount && originZone?.country) {
    const countryRule = await CountryPricing.findOne({
      country: originZone.country,
      service: serviceType,
      status: 'ACTIVE'
    }).lean()

    if (countryRule) {
      amount = applyModel(countryRule.model, countryRule.params, distanceKm)
      matchedRuleId = countryRule._id
      breakdown.modelSource = 'COUNTRY_DEFAULT'
      breakdown.params = countryRule.params
    }
  }

  // --------------------------------------------------
  // 6. GLOBAL CONFIG FALLBACK
  // --------------------------------------------------
  if (!amount) {
    amount = legacyCalculateAmount(
      config.costType,
      config.deliveryRate,
      distanceKm
    )

    breakdown.modelSource = 'GLOBAL_FALLBACK'
  }

  let originalAmountBeforeDiscounts = amount

  // --------------------------------------------------
  // 7. COUPONS
  // --------------------------------------------------
  if (couponCode && amount > 0) {
    const coupon = await Coupon.findOne({ code: couponCode }).lean()

    if (coupon?.rules?.applies_to?.includes('delivery')) {
      const { discount_type, discount_value, max_discount } = coupon.rules

      let discount = 0

      if (discount_type === 'percent') {
        discount = (discount_value / 100) * amount
      } else if (discount_type === 'flat') {
        discount = discount_value
      }

      discount = Math.min(discount, max_discount || discount)
      amount = Math.max(0, amount - discount)

      breakdown.couponDiscount = discount
    }
  }

  // --------------------------------------------------
  // 8. SYSTEM-WIDE MINIMUM FEE
  // --------------------------------------------------
  if (amount < config.minimumDeliveryFee || distanceKm <= 0.1) {
    amount = config.minimumDeliveryFee
  }

  // --------------------------------------------------
  // 9. ANTI-MANIPULATION CHECK
  // --------------------------------------------------
  const mismatch =
    typeof clientProvidedAmount === 'number' &&
    Math.abs(clientProvidedAmount - amount) > 0.01

  return {
    amount: Math.round(amount * 100) / 100,
    originalAmountBeforeDiscounts,
    isPrepaid: breakdown.packageApplied,
    mismatch,
    breakdown,
    matchedRuleId
  }
}

module.exports = { calculateUnifiedDeliveryFee }
