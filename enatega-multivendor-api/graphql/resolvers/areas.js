const Area = require('../../models/area')
const Location = require('../../models/location')
module.exports = {
  Query: {
    async areas(_, args, { req, res }) {
      try {
        const areas = await Area.find().populate('city').populate('location')
        console.log({ areas: areas[areas.length - 1].location })
        return areas
      } catch (err) {
        throw new Error('Something went wrong')
      }
    },
    async areasByCity(_, args) {
      console.log({ argsAreaByCity: args })
      try {
        const areas = await Area.find({ city: args.id })
          .populate('city')
          .populate('location')
        // console.log({ areas: areas[areas.length - 1].location })
        console.log({ areas })
        return areas
      } catch (err) {
        throw new Error('Something went wrong')
      }
    }
  },
  Mutation: {
    async createArea(_, args) {
      console.log({ createAreaArgs: args })
      try {
        const location = new Location({
          location: { coordinates: args.areaInput.coordinates }
        })
        const area = new Area({ ...args.areaInput })
        area.location = location
        await location.save()
        await area.save()
        return { message: 'Created the area' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    }
  }
}
