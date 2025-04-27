const { calculateDistance } = require('../../helpers/findRiders')
const DeliveryRequest = require('../../models/deliveryRequest')
const Order = require('../../models/order')
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
          is_urgent: input.isUrgent || false
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

        console.log({ zone })

        const order = new Order({
          // orderId: newOrderId,
          user: req.user._id,
          // resId: null,
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
          type: 'delivery_request'
        })
        await order.save()
        console.log({ order })
        return { message: 'created_request_delivery_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
