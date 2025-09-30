const {
  sendCustomerNotifications
} = require('../../helpers/customerNotifications')
const {
  calculateDistance,
  sendPushNotification
} = require('../../helpers/findRiders')
const {
  normalizeAndValidatePhoneNumber
} = require('../../helpers/normalizePhone')
const {
  publishToDispatcher,
  publishToZoneRiders
} = require('../../helpers/pubsub')
const Coupon = require('../../models/coupon')
const DeliveryRequest = require('../../models/deliveryRequest')
const Order = require('../../models/order')
const User = require('../../models/user')
const Zone = require('../../models/zone')

module.exports = {
  Mutation: {
    async createDeliveryRequest(_, { input }, { req }) {
      console.log('createDeliveryRequest', { input })
      console.log('createDeliveryUser', { user: req.user })
      if (!req.user) {
        throw new Error('User is not authenticated!')
      }
      try {
        const distanceKm = calculateDistance(
          input.pickupLat,
          input.pickupLng,
          input.dropoffLat,
          input.dropoffLng
        )
        const estimatedTime = Math.ceil(distanceKm * 5) // simple logic

        const deliveries = await DeliveryRequest.find()
          .limit(1)
          .sort({ _id: -1 })

        const lastRequestId = deliveries[0].requestId
          ? parseInt(deliveries[0].requestId.split('-')[1]) + 1
          : 1

        const delivery = await DeliveryRequest.create({
          customer_id: req.user._id,
          pickup_lat: input.pickupLat,
          pickup_lng: input.pickupLng,
          pickup_address_text: input.pickupAddressText,
          pickup_address_free_text: input.pickupAddressFreeText,
          pickup_label: input.pickupLabel ? input.pickupLabel : 'Home',
          dropoff_lat: input.dropoffLat,
          dropoff_lng: input.dropoffLng,
          dropoff_address_text: input.dropoffAddressText,
          dropoff_address_free_text: input.dropoffAddressFreeText,
          dropoff_label: input.dropoffLabel ? input.dropoffLabel : 'Home',
          notes: input.notes,
          fare: input.deliveryFee,
          estimated_time: estimatedTime,
          distance_km: distanceKm,
          request_channel: input.requestChannel,
          priority_level: input.priorityLevel || 'standard',
          is_urgent: input.isUrgent || false,
          requestId: `PRIV-${lastRequestId}`
        })

        console.log({ delivery })
        // handling address drop-off
        let address = {}
        address['deliveryAddress'] = delivery.dropoff_address_text
        address['details'] = delivery.dropoff_address_free_text
        address['label'] = delivery.dropoff_label
        address['location'] = {
          type: 'Point',
          coordinates: [delivery.dropoff_lng, delivery.dropoff_lat]
        }

        // handling pick-up
        const pickupLocation = {
          type: 'Point',
          coordinates: [delivery.pickup_lng, delivery.pickup_lat]
        }

        // getting the zone intersection
        const zone = await Zone.findOne({
          location: {
            $geoIntersects: {
              $geometry: pickupLocation
            }
          }
        })

        if (!zone) {
          throw new Error('no_zone')
        }

        console.log({ zone })

        const couponCode = await Coupon.findOne({ code: input.couponId })
        console.log({ couponCode })
        if (couponCode) {
          if (!couponCode.tracking.user_usage) {
            couponCode.tracking.user_usage = new Map()
          }

          // Convert to Map if it's a plain object (can happen when using `.lean()` or from Mongo)
          if (!(couponCode.tracking.user_usage instanceof Map)) {
            couponCode.tracking.user_usage = new Map(
              Object.entries(couponCode.tracking.user_usage)
            )
          }
        }

        const previousCount =
          couponCode?.tracking.user_usage.get(req.userId) || 0
        console.log({ previousCount })
        if (couponCode) {
          couponCode.tracking.user_usage.set(req.userId, previousCount + 1)
          couponCode.tracking.usage_count += 1
          console.log({
            nextCount: couponCode.tracking.user_usage.get(req.userId),
            usage_count: couponCode.tracking.usage_count
          })
          await couponCode.save()
        }

        const order = new Order({
          orderId: delivery.requestId,
          user: req.user._id,
          orderStatus: 'ACCEPTED',
          orderAmount: input.deliveryFee,
          deliveryAddress: { ...address },
          items: [],
          isActive: true,
          tipping: 0,
          taxationAmount: 0,
          deliveryCharges: input.deliveryFee,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          zone: zone._id,
          completionTime: new Date(Date.now() + 20 * 60 * 1000),
          preparationTime: new Date(Date.now() + 10 * 60 * 1000),
          pickupLocation,
          pickupAddress: delivery.pickup_address_text
            ? delivery.pickup_address_text
            : delivery.pickup_address_free_text,
          pickupAddressFreeText: delivery.pickup_address_free_text,
          pickupLabel: delivery.pickup_label,
          type: 'delivery_request',
          mandoobSpecialInstructions: delivery.notes
        })
        await order.save()
        let user = await User.findById(req.user._id)
        const populatedOrder = await order.populate('user')
        if (!order.isPickedUp) {
          publishToZoneRiders(
            populatedOrder.zone.toString(),
            populatedOrder,
            'new'
          )
          await sendPushNotification(
            populatedOrder.zone.toString(),
            populatedOrder
          )
        }
        if (
          (input.requestChannel === 'customer_app' ||
            input.requestChannel === 'web_portal') &&
          user &&
          user.isOrderNotification
        ) {
          sendCustomerNotifications(populatedOrder.user, populatedOrder)
        }
        console.log({ populatedOrder })
        return { message: 'created_request_delivery_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async createDeliveryRequestAdmin(_, { input }, { req }) {
      console.log('createDeliveryRequest', { input })
      console.log('createDeliveryUser', { user: req.user })
      if (!req.user) {
        throw new Error('User is not authenticated!')
      }
      try {
        const distanceKm = calculateDistance(
          input.pickupLat,
          input.pickupLng,
          input.dropoffLat,
          input.dropoffLng
        )
        const estimatedTime = Math.ceil(distanceKm * 5) // simple logic

        const deliveries = await DeliveryRequest.find()
          .limit(1)
          .sort({ _id: -1 })

        const lastRequestId = deliveries[0].requestId
          ? parseInt(deliveries[0].requestId.split('-')[1]) + 1
          : 1

        const delivery = await DeliveryRequest.create({
          customer_id: req.user._id,
          pickup_lat: input.pickupLat,
          pickup_lng: input.pickupLng,
          pickup_address_text: input.pickupAddressText,
          pickup_address_free_text: input.pickupAddressFreeText,
          dropoff_lat: input.dropoffLat,
          dropoff_lng: input.dropoffLng,
          dropoff_address_text: input.dropoffAddressText,
          dropoff_address_free_text: input.dropoffAddressFreeText,
          notes: input.notes,
          fare: input.deliveryFee,
          estimated_time: estimatedTime,
          distance_km: distanceKm,
          request_channel: input.requestChannel,
          priority_level: input.priorityLevel || 'standard',
          is_urgent: input.isUrgent || false,
          requestId: `mandoob-${lastRequestId}`
        })

        console.log({ delivery })
        // handling address drop-off
        let address = {}
        address['deliveryAddress'] = delivery.dropoff_address_text
        address['details'] = delivery.dropoff_address_free_text
        address['label'] = 'Home'
        address['location'] = {
          type: 'Point',
          coordinates: [delivery.dropoff_lng, delivery.dropoff_lat]
        }

        // handling pick-up
        const pickupLocation = {
          type: 'Point',
          coordinates: [delivery.pickup_lng, delivery.pickup_lat]
        }

        // getting the zone intersection
        const zone = await Zone.findOne({
          location: {
            $geoIntersects: {
              $geometry: pickupLocation
            }
          }
        })

        if (!zone) {
          throw new Error('no_zone')
        }

        console.log({ zone })
        const phone = normalizeAndValidatePhoneNumber(input.phone)
        let user = await User.findOne({
          phone
        })
        if (!user) {
          user = await User.create({
            name: input.name,
            phone
          })
        }
        const order = new Order({
          orderId: delivery.requestId,
          user,
          orderStatus: 'ACCEPTED',
          orderAmount: input.deliveryFee,
          deliveryAddress: { ...address },
          items: [],
          isActive: true,
          tipping: 0,
          taxationAmount: 0,
          deliveryCharges: input.deliveryFee,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          zone: zone._id,
          completionTime: new Date(Date.now() + 20 * 60 * 1000),
          preparationTime: new Date(Date.now() + 20 * 60 * 1000),
          pickupLocation,
          pickupAddress: delivery.pickup_address_text
            ? delivery.pickup_address_text
            : delivery.pickup_address_free_text,
          pickupAddressFreeText: delivery.pickup_address_free_text,
          // pickupLabel:
          type: 'delivery_request',
          mandoobSpecialInstructions: delivery.notes
        })
        await order.save()

        const populatedOrder = await order.populate('user')
        if (!order.isPickedUp) {
          publishToZoneRiders(
            populatedOrder.zone.toString(),
            populatedOrder,
            'new'
          )
          await sendPushNotification(
            populatedOrder.zone.toString(),
            populatedOrder
          )
        }
        if (
          (input.requestChannel === 'customer_app' ||
            input.requestChannel === 'web_portal') &&
          user &&
          user.isOrderNotification
        ) {
          sendCustomerNotifications(populatedOrder.user, populatedOrder)
        }
        console.log({ populatedOrder })
        return { message: 'created_request_delivery_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
