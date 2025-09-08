const Configuration = require('../models/configuration')
const DeliveryPrice = require('../models/DeliveryPrice')
const DeliveryZone = require('../models/deliveryZone')
const Coupon = require('../models/coupon')
const { calculateAmount, calculateDistance } = require('./utilities')
const PrepaidDeliveryPackage = require('../models/prepaidDeliveryPackage')

module.exports = {
  async calculateDeliveryFee({
    originLat,
    originLong,
    destLat,
    destLong,
    code,
    restaurantId
  }) {
    const distance = calculateDistance(originLat, originLong, destLat, destLong)

    const configuration = await Configuration.findOne()
    const costType = configuration.costType

    const originZone = await DeliveryZone.findOne({
      location: {
        $geoIntersects: {
          $geometry: { type: 'Point', coordinates: [originLong, originLat] }
        }
      }
    })

    const destinationZone = await DeliveryZone.findOne({
      location: {
        $geoIntersects: {
          $geometry: { type: 'Point', coordinates: [destLong, destLat] }
        }
      }
    })

    let deliveryPrice
    if (originZone && destinationZone) {
      deliveryPrice = await DeliveryPrice.findOne({
        $or: [
          { originZone: originZone._id, destinationZone: destinationZone._id },
          { originZone: destinationZone._id, destinationZone: originZone._id }
        ]
      })
    }

    let amount
    if (deliveryPrice) {
      amount = deliveryPrice.cost
    } else {
      amount = calculateAmount(costType, configuration.deliveryRate, distance)
    }

    if (
      parseFloat(amount) <= configuration.minimumDeliveryFee ||
      distance <= 0.1
    ) {
      amount = configuration.minimumDeliveryFee
    }

    // coupon logic
    let deliveryDiscount = 0
    let originalDiscount = amount
    if (code) {
      const coupon = await Coupon.findOne({ code })
      if (coupon) {
        const { discount_type, discount_value, max_discount } = coupon.rules
        if (discount_type === 'percent') {
          const discount = (discount_value / 100) * amount
          deliveryDiscount = Math.min(discount, max_discount || discount)
        } else if (discount_type === 'flat') {
          deliveryDiscount = Math.min(
            discount_value,
            max_discount || discount_value
          )
        }
      }
      amount -= deliveryDiscount
    }

    // prepaid logic
    let isPrepaid = false
    if (restaurantId) {
      const prepaidPackage = await PrepaidDeliveryPackage.findOne({
        business: restaurantId,
        isActive: true,
        expiresAt: { $gte: new Date() },
        $expr: { $lt: ['$usedDeliveries', '$totalDeliveries'] }
      })

      if (
        prepaidPackage?.maxDeliveryAmount &&
        amount <= prepaidPackage.maxDeliveryAmount
      ) {
        isPrepaid = true
        return { amount: 0, originalDiscount, isPrepaid: true }
      }
    }

    return { amount, originalDiscount, isPrepaid }
  }
}
