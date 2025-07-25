const Zone = require('../../models/zone')
const { transformZone } = require('./merge')
module.exports = {
  Query: {
    zones: async (_, args, { req, res }) => {
      const zones = await Zone.find()
      return zones.map(transformZone)
    },
    zone: async (_, args, { req, res }) => {
      console.log('Zones')
      const zone = await Zone.findById(args.id)
      if (!zone) throw new Error('Zone does not exist')

      return transformZone(zone)
    },
    async checkDeliveryZone(_, args) {
      console.log('checkDeliveryZone', { args })
      try {
        const location = {
          type: 'Point',
          coordinates: [args.longitude, args.latitude]
        }
        console.log('Location: ', location)
        const zone = await Zone.findOne({
          location: { $geoIntersects: { $geometry: location } },
          isActive: true
        })
        console.log('Zone: ', zone)
        if (!zone) {
          throw new Error('city_location_no_deliveryzone')
        }
        return { message: 'within_true_delivery_zone' }
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createZone: async (_, args, { req, res }) => {
      // polygon schema can be found in models/zone.js
      // coordinates: [[
      //     [72.9744366, 33.6857303],
      //     [72.9845601, 33.6718977],
      //     [73.0020695, 33.6811117],
      //     [72.9919728, 33.6949683],
      //     [72.9744366, 33.6857303]
      // ]]

      const location = {
        type: 'Polygon',
        coordinates: args.zone.coordinates
      }

      const zone = new Zone({
        title: args.zone.title,
        description: args.zone.description,
        location
      })
      console.log('Zone', zone)
      console.log('Zone location', zone.location.coordinates)
      const result = await zone.save()
      console.log('Zone saved: ', result)
      return transformZone(result)
    },
    editZone: async (_, args, { req, res }) => {
      const zone = await Zone.findById(args.zone._id)
      if (!zone) throw new Error('Zone does not exist')
      const location = {
        type: 'Polygon',
        coordinates: args.zone.coordinates
      }

      zone.title = args.zone.title
      zone.description = args.zone.description
      zone.location = location

      const result = await zone.save()
      return transformZone(result)
    },
    deleteZone: async (_, args, { req, res }) => {
      console.log('deleteZone', { args })
      const zone = await Zone.findById(args.id)
      console.log({ zone })
      await zone.deleteOne()
      return { message: 'zone_deleted' }
      // const deletedZone = await Zone.findByIdAndUpdate(
      //   args.id,
      //   { isActive: false },
      //   { new: true }
      // )
      // return transformZone(deletedZone)
    }
  }
}
