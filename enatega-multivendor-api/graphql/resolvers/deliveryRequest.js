const { calculateDistance } = require('../../helpers/findRiders')
const DeliveryRequest = require('../../models/deliveryRequest')

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

        const deliveryRequest = await DeliveryRequest.create({
          customer_id: req.user._id,
          pickup_lat: input.pickupLat,
          pickup_lng: input.pickupLng,
          pickup_address_text: input.pickupAddressText,
          dropoff_lat: input.dropoffLat,
          dropoff_lng: input.dropoffLng,
          dropoff_address_text: input.dropoffAddressText,
          notes: input.notes,
          fare: input.deliveryFee,
          estimated_time: estimatedTime,
          distance_km: distanceKm,
          request_channel: input.requestChannel,
          priority_level: input.priorityLevel || 'standard',
          is_urgent: input.isUrgent || false
        })
        console.log({ deliveryRequest })

        return { message: 'created_request_delivery_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
