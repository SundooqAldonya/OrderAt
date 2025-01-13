const City = require('../../models/city')
const Zone = require('../../models/zone')
const { transformZone } = require('./merge')
module.exports = {
  Query: {
    async cities(_, args, { req, res }) {
      try {
        const cities = await City.find()
        return cities
      } catch (err) {
        throw new Error('Something went wrong')
      }
    },
    deliveryZones: async (_, args, { req, res }) => {
      const zones = await Zone.find({ isActive: true })
      return zones.map(transformZone)
    },
    singleDeliveryZone: async (_, args, { req, res }) => {
      console.log('Zones')
      const zone = await Zone.findById(args.id)
      if (!zone) throw new Error('Zone does not exist')

      return transformZone(zone)
    }
  },
  Mutation: {
    async createCity(_, args) {
      console.log({ createCityArgs: args })
      try {
        await City.create({ ...args })
        return { message: 'Created the city' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    },

    createDeliveryZone: async (_, args, { req, res }) => {
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
    editDeliveryZone: async (_, args, { req, res }) => {
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
    deleteDeliveryZone: async (_, args, { req, res }) => {
      const deletedZone = await Zone.findByIdAndUpdate(
        args.id,
        { isActive: false },
        { new: true }
      )
      return transformZone(deletedZone)
    }
  }
}
