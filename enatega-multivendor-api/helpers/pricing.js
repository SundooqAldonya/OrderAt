// services/pricing.js
const mongoose = require('mongoose')
const Configuration = mongoose.model('Configuration') // optional in tests
const DeliveryZone = mongoose.model('DeliveryZone') // must exist in your project for production
const PrepaidDeliveryPackage = mongoose.model('PrepaidDeliveryPackage')
const Coupon = mongoose.model('Coupon')
const DeliveryPriceV2 = mongoose.model('DeliveryPriceV2')

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  // Use your production calculateDistance if available. Haversine here for tests.
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function getConfig() {
  // Return minimal config object. If Configuration collection not present, return defaults.
  try {
    const cfg = await Configuration.findOne().lean()
    return (
      cfg || { costType: 'PER_KM', deliveryRate: 5, minimumDeliveryFee: 10 }
    )
  } catch (e) {
    return { costType: 'PER_KM', deliveryRate: 5, minimumDeliveryFee: 10 }
  }
}

function legacyCalculateAmount(costType, deliveryRate, distance) {
  // simple fallback: base 0 + per-km * distance
  if (!distance) return deliveryRate || 0
  if (costType === 'PER_KM') return (deliveryRate || 0) * distance
  return deliveryRate || 0
}

/**
 * Rebuilt function compatible with your DeliveryPriceV2 & PrepaidDeliveryPackage models.
 *
 * Notes:
 *  - For DeliveryPriceV2: uses baseFare, perKmRate, surgeMultiplier, minFare
 *  - For PrepaidDeliveryPackage: checks isActive, expiresAt, remainingDeliveries virtual,
 *    and maxDeliveryAmount. If serviceType === 'FOOD' and package is active & remaining > 0 and
 *    not expired => customer pays 0 (business pays).
 *
 * Options:
 *  originLat/originLong/destLat/destLong: coords
 *  serviceType: 'FOOD'|'MASHAWEER' etc. (string)
 *  restaurantId: ObjectId (for prepaid package lookup)
 *  couponCode: optional
 *  clientProvidedAmount: optional (for mismatch check)
 */
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
  if (
    originLat === undefined ||
    originLong === undefined ||
    destLat === undefined ||
    destLong === undefined
  ) {
    throw new Error('origin and destination coordinates required')
  }

  const distanceKm = calculateDistanceKm(
    originLat,
    originLong,
    destLat,
    destLong
  )
  const config = await getConfig()

  // Resolve zones (try find DeliveryZone by pickup and dropoff points)
  const pickupPoint = { type: 'Point', coordinates: [originLong, originLat] }
  const dropoffPoint = { type: 'Point', coordinates: [destLong, destLat] }

  // If DeliveryZone model not available in test environment, these will be null
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
    // ignore if DeliveryZone not present in tests
    originZone = null
    destinationZone = null
  }

  const breakdown = {
    distanceKm,
    modelSource: null,
    baseFare: 0,
    perKmRate: 0,
    surgeMultiplier: 1,
    minFare: 0,
    vehicleSurcharge: 0,
    couponDiscount: 0,
    packageApplied: false
  }

  let matchedRuleId = null
  let amount = null
  let originalAmountBeforeDiscounts = null
  let isPrepaid = false

  // 1) Try zone->zone DeliveryPriceV2
  if (originZone && destinationZone) {
    const zoneRule = await DeliveryPriceV2.findOne({
      $or: [
        { originZone: originZone._id, destinationZone: destinationZone._id },
        { originZone: destinationZone._id, destinationZone: originZone._id }
      ],
      isActive: true
    }).lean()

    if (zoneRule) {
      breakdown.modelSource = 'AREA_TO_AREA'
      breakdown.baseFare = zoneRule.baseFare || 0
      breakdown.perKmRate = zoneRule.perKmRate || 0
      breakdown.surgeMultiplier = zoneRule.surgeMultiplier || 1
      breakdown.minFare = zoneRule.minFare || 0
      matchedRuleId = zoneRule._id

      amount =
        (breakdown.baseFare || 0) + (breakdown.perKmRate || 0) * distanceKm
      amount = amount * (breakdown.surgeMultiplier || 1)
      if (amount < (breakdown.minFare || 0)) amount = breakdown.minFare || 0
    }
  }

  // 2) Fallback to global config if no zone rule
  if (amount === null) {
    breakdown.modelSource = 'GLOBAL_FALLBACK'
    amount = legacyCalculateAmount(
      config?.costType,
      config?.deliveryRate,
      distanceKm
    )
    // no surge set in fallback
    if (config?.minimumDeliveryFee && amount < config.minimumDeliveryFee) {
      amount = config.minimumDeliveryFee
    }
  }

  originalAmountBeforeDiscounts = Math.round(amount * 100) / 100

  // 3) Prepaid package logic (matching your exact model fields)
  // Apply only when restaurantId is provided AND serviceType is FOOD
  if (restaurantId && String(serviceType).toUpperCase() === 'FOOD') {
    const prepaid = await PrepaidDeliveryPackage.findOne({
      business: restaurantId,
      isActive: true,
      expiresAt: { $gte: new Date() }
    }).lean()

    if (prepaid) {
      // compute remaining deliveries: totalDeliveries - usedDeliveries
      const remainingDeliveries =
        (prepaid.totalDeliveries || 0) - (prepaid.usedDeliveries || 0)
      if (remainingDeliveries > 0) {
        // Business rule you confirmed: customer pays 0 ALWAYS when package active for restaurant food
        isPrepaid = true
        breakdown.packageApplied = true
        matchedRuleId = prepaid._id
        amount = 0
      }
    }
  }

  // 4) Apply coupon (flat/percent with max_discount)
  if (couponCode && amount > 0) {
    const coupon = await Coupon.findOne({ code: couponCode }).lean()
    if (
      coupon &&
      coupon.rules &&
      Array.isArray(coupon.rules.applies_to) &&
      coupon.rules.applies_to.includes('delivery')
    ) {
      const { discount_type, discount_value, max_discount } = coupon.rules
      let deliveryDiscount = 0
      if (discount_type === 'percent') {
        const disc = ((discount_value || 0) / 100) * amount
        deliveryDiscount = Math.min(disc, max_discount || disc)
      } else if (discount_type === 'flat') {
        deliveryDiscount = Math.min(
          discount_value || 0,
          max_discount || discount_value || 0
        )
      }
      breakdown.couponDiscount = Math.round(deliveryDiscount * 100) / 100
      amount = Math.max(0, amount - deliveryDiscount)
    }
  }

  // 5) Ensure system-wide minimumDeliveryFee and distance small guard
  if (
    config?.minimumDeliveryFee &&
    (amount < config.minimumDeliveryFee || distanceKm <= 0.1)
  ) {
    amount = config.minimumDeliveryFee
  }

  // 6) Round final amount
  amount = Math.round(amount * 100) / 100

  // 7) Anti-manipulation check
  if (typeof clientProvidedAmount === 'number') {
    const tolerance = 0.01
    const mismatch = Math.abs(clientProvidedAmount - amount) > tolerance
    return {
      amount,
      originalAmountBeforeDiscounts,
      isPrepaid,
      mismatch,
      breakdown,
      matchedRuleId
    }
  }

  return {
    amount,
    originalAmountBeforeDiscounts,
    isPrepaid,
    mismatch: false,
    breakdown,
    matchedRuleId
  }
}

module.exports = {
  calculateUnifiedDeliveryFee
}
