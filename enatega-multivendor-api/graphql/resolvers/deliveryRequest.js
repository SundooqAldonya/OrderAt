const { calculateDistance } = require('../../helpers/findRiders')
const DeliveryRequest = require('../../models/deliveryRequest')

module.exports = {
  Mutation: {
    async createDeliveryRequest(_, { input }) {
      console.log('createDeliveryRequest', { input })
      try {
        const distanceKm = calculateDistance(
          input.pickupLat,
          input.pickupLng,
          input.dropoffLat,
          input.dropoffLng
        )
        const estimatedTime = Math.ceil(distanceKm * 5) // simple logic
        const fare = distanceKm * 2.5 // per km rate

        const deliveryRequest = await DeliveryRequest.create({
          request_id: uuidv4(),
          customer_id: user.id,
          pickup_lat: input.pickupLat,
          pickup_lng: input.pickupLng,
          pickup_address_text: input.pickupAddressText,
          dropoff_lat: input.dropoffLat,
          dropoff_lng: input.dropoffLng,
          dropoff_address_text: input.dropoffAddressText,
          item_description: input.itemDescription,
          notes: input.notes,
          fare,
          estimated_time: estimatedTime,
          distance_km: distanceKm,
          status: 'pending',
          request_channel: input.requestChannel,
          payment_method: input.paymentMethod,
          payment_status: 'pending',
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
