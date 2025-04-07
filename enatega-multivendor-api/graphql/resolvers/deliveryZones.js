const DeliveryZone = require('../../models/deliveryZone')

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
