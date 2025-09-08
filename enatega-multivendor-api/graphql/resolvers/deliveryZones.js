const { calculateDeliveryFee } = require('../../helpers/calculateDeliveryFee')
const {
  calculateAmount,
  calculateDistance
} = require('../../helpers/utilities')
const Configuration = require('../../models/configuration')
const Coupon = require('../../models/coupon')
const DeliveryPrice = require('../../models/DeliveryPrice')
const DeliveryZone = require('../../models/deliveryZone')
const PrepaidDeliveryPackage = require('../../models/prepaidDeliveryPackage')

module.exports = {
  Query: {
    async getAllDeliveryZones(_, args) {
      try {
        const deliveryZones = await DeliveryZone.find()
        console.log({ deliveryZones })
        return deliveryZones
      } catch (err) {
        throw new Error(err)
      }
    },

    async getDeliveryCalculation(_, args, { req }) {
      console.log({
        getDeliveryCalculationArgs: args,
        restaurantId: req.restaurantId
      })
      try {
        const {
          originLong,
          originLat,
          destLong,
          destLat,
          code,
          restaurantId
        } = args

        // get zone charges from delivery prices
        const distance = calculateDistance(
          originLat,
          originLong,
          destLat,
          destLong
        )

        const configuration = await Configuration.findOne()
        const costType = configuration.costType

        const originZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [originLong, originLat]
              }
            }
          }
        })

        const destinationZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [destLong, destLat]
              }
            }
          }
        })

        console.log({ originZone, destinationZone })
        let deliveryPrice
        if (originZone && destinationZone) {
          deliveryPrice = await DeliveryPrice.findOne({
            $or: [
              {
                originZone: originZone._id,
                destinationZone: destinationZone._id
              },
              {
                originZone: destinationZone._id,
                destinationZone: originZone._id
              }
            ]
          })
        }

        console.log({ deliveryPrice })

        let amount
        if (deliveryPrice) {
          amount = deliveryPrice.cost
        } else {
          amount = calculateAmount(
            costType,
            configuration.deliveryRate,
            distance
          )
          console.log({ distance, amount })
        }

        if (
          parseFloat(amount) <= configuration.minimumDeliveryFee ||
          distance <= 0.1
        ) {
          amount = configuration.minimumDeliveryFee
        }

        let deliveryDiscount = 0
        let originalDiscount = amount
        const coupon = await Coupon.findOne({ code })
        console.log({ coupon })
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

        console.log({ amount, originalDiscount, deliveryDiscount })
        // ===== CHECK PREPAID DELIVERY PACKAGE =====
        let isPrepaid = false
        if (restaurantId || req.restaurantId) {
          const prepaidPackage = await PrepaidDeliveryPackage.findOne({
            business: restaurantId || req.restaurantId,
            isActive: true,
            expiresAt: { $gte: new Date() },
            $expr: { $lt: ['$usedDeliveries', '$totalDeliveries'] }
          })

          if (
            prepaidPackage?.maxDeliveryAmount &&
            amount <= prepaidPackage?.maxDeliveryAmount
          ) {
            isPrepaid = true
            console.log('✅ Prepaid package found. Delivery is free.')
            return {
              amount: 0,
              originalDiscount,
              isPrepaid: true
            }
          }
        }

        return { amount, originalDiscount }
      } catch (err) {
        throw new Error(err)
      }
    },
    async getDeliveryCalculationV2(_, args, { req }) {
      console.log({
        getDeliveryCalculationArgs: args,
        restaurantId: req.restaurantId
      })
      try {
        const {
          originLat,
          originLong,
          destLat,
          destLong,
          code,
          restaurantId
        } = args.input
        const amount = await calculateDeliveryFee({
          originLat,
          originLong,
          destLat,
          destLong,
          code,
          restaurantId
        })
        console.log({ amount })
        return amount
        //   const {
        //     originLong,
        //     originLat,
        //     destLong,
        //     destLat,
        //     code,
        //     restaurantId
        //   } = args.input
        //   console.log('args.input', { restaurantId })

        //   // get zone charges from delivery prices
        //   const distance = calculateDistance(
        //     originLat,
        //     originLong,
        //     destLat,
        //     destLong
        //   )

        //   const configuration = await Configuration.findOne()
        //   const costType = configuration.costType

        //   const originZone = await DeliveryZone.findOne({
        //     location: {
        //       $geoIntersects: {
        //         $geometry: {
        //           type: 'Point',
        //           coordinates: [originLong, originLat]
        //         }
        //       }
        //     }
        //   })

        //   const destinationZone = await DeliveryZone.findOne({
        //     location: {
        //       $geoIntersects: {
        //         $geometry: {
        //           type: 'Point',
        //           coordinates: [destLong, destLat]
        //         }
        //       }
        //     }
        //   })

        //   console.log({ originZone, destinationZone })
        //   let deliveryPrice
        //   if (originZone && destinationZone) {
        //     deliveryPrice = await DeliveryPrice.findOne({
        //       $or: [
        //         {
        //           originZone: originZone._id,
        //           destinationZone: destinationZone._id
        //         },
        //         {
        //           originZone: destinationZone._id,
        //           destinationZone: originZone._id
        //         }
        //       ]
        //     })
        //   }

        //   console.log({ deliveryPrice })

        //   let amount
        //   if (deliveryPrice) {
        //     amount = deliveryPrice.cost
        //   } else {
        //     amount = calculateAmount(
        //       costType,
        //       configuration.deliveryRate,
        //       distance
        //     )
        //     console.log({ distance, amount })
        //   }

        //   if (
        //     parseFloat(amount) <= configuration.minimumDeliveryFee ||
        //     distance <= 0.1
        //   ) {
        //     amount = configuration.minimumDeliveryFee
        //   }

        //   let deliveryDiscount = 0
        //   let originalDiscount = amount
        //   const coupon = await Coupon.findOne({ code })
        //   console.log({ coupon })
        //   if (coupon) {
        //     const { discount_type, discount_value, max_discount } = coupon.rules
        //     if (discount_type === 'percent') {
        //       const discount = (discount_value / 100) * amount
        //       deliveryDiscount = Math.min(discount, max_discount || discount)
        //     } else if (discount_type === 'flat') {
        //       deliveryDiscount = Math.min(
        //         discount_value,
        //         max_discount || discount_value
        //       )
        //     }
        //   }
        //   amount -= deliveryDiscount

        //   console.log({ amount, originalDiscount, deliveryDiscount })
        //   // ===== CHECK PREPAID DELIVERY PACKAGE =====
        //   let isPrepaid = false
        //   if (restaurantId || req.restaurantId) {
        //     const prepaidPackage = await PrepaidDeliveryPackage.findOne({
        //       business: restaurantId || req.restaurantId,
        //       isActive: true,
        //       expiresAt: { $gte: new Date() },
        //       $expr: { $lt: ['$usedDeliveries', '$totalDeliveries'] }
        //     })
        //     console.log({ prepaidPackage })
        //     if (
        //       prepaidPackage?.maxDeliveryAmount &&
        //       amount <= prepaidPackage?.maxDeliveryAmount
        //     ) {
        //       isPrepaid = true
        //       console.log('✅ Prepaid package found. Delivery is free.')
        //       return {
        //         amount: 0,
        //         originalDiscount,
        //         isPrepaid: true
        //       }
        //     }
        //   }

        //   return { amount, originalDiscount }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createDeliveryZone(_, args) {
      console.log({ args })
      try {
        const location = {
          type: 'Polygon',
          coordinates: args.deliveryZoneInput.coordinates
        }
        await DeliveryZone.create({
          title: args.deliveryZoneInput.title,
          city: args.deliveryZoneInput.city,
          description: args.deliveryZoneInput.description,
          location: location
        })
        return { message: 'delivery_zone_created' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async updateDeliveryZone(_, args) {
      try {
        const zone = await DeliveryZone.findById(args.deliveryZoneInput._id)
        const location = {
          type: 'Polygon',
          coordinates: args.deliveryZoneInput.coordinates
        }
        zone.title = args.deliveryZoneInput.title
        zone.city = args.deliveryZoneInput.city
        zone.description = args.deliveryZoneInput.description
        zone.location = location
        await zone.save()
        return { message: 'delivery_zone_updated' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async removeDeliveryZone(_, args) {
      try {
        const deliveryZone = await DeliveryZone.findById(args.id)
        await deliveryZone.deleteOne()
        return { message: 'delivery_zone_removed' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
