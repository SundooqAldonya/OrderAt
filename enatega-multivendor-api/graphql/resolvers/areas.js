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
        throw new Error(`Something went wrong!: ${err}`)
      }
    },

    async editArea(_, args) {
      console.log({ editAreaArgs: args })
      try {
        // here
        const location = await Location.findById(args.locationId)
        location.location.coordinates = args.areaInput.coordinates
        await location.save()
        const area = await Area.findById(args.id)
        area.address = args.areaInput.address
        area.title = args.areaInput.title
        area.city = args.areaInput.city
        await area.save()
        return { message: 'Edited an area successfully!' }
      } catch (err) {
        throw new Error(`Something went wrong!: ${err}`)
      }
    },

    async removeArea(_, args) {
      try {
        await Area.findByIdAndDelete(args.id)
        return { message: 'Removed an area successfully!' }
      } catch (err) {
        throw new Error(`Something went wrong!: ${err}`)
      }
    }
  }
}
