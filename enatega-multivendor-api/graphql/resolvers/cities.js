const City = require('../../models/city')
const Location = require('../../models/location')

module.exports = {
  Query: {
    async citiesAdmin(_, args) {
      console.log({ args })
      // try {
      let query = {}
      if (args.search) {
        query = {
          title: { $regex: args.search, $options: 'i' }
        }
      }
      const cities = await City.find(query).populate('location')
      console.log({ cities })
      return cities
      // } catch (err) {
      //   throw new Error('Something went wrong', err)
      // }
    },
    async cities(_, args) {
      try {
        const cities = await City.find({ isActive: true }).populate('location')
        return cities
      } catch (err) {
        throw new Error('Something went wrong', err)
      }
    }
  },
  Mutation: {
    async createCity(_, args) {
      console.log({ createCityArgs: args })

      try {
        const { title, coordinates, geometry } = args

        let locationDoc = null

        // Save POINT location only if marker is provided
        if (
          coordinates &&
          Array.isArray(coordinates) &&
          coordinates.length === 2
        ) {
          locationDoc = await Location.create({
            location: {
              type: 'Point',
              coordinates: coordinates // [lng, lat]
            }
          })
        }

        // Prepare polygon only if geometry exists
        let polygonGeometry = null

        if (geometry?.type === 'Polygon' && geometry?.coordinates?.length) {
          // Extract ring
          let ring = geometry.coordinates[0]

          // 🔥 CLOSE POLYGON (required by MongoDB)
          const first = ring[0]
          const last = ring[ring.length - 1]

          if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first)
          }

          polygonGeometry = {
            type: 'Polygon',
            coordinates: [ring]
          }
        }

        const cityPayload = {
          title,
          isActive: true
        }

        if (locationDoc) cityPayload.location = locationDoc._id
        if (polygonGeometry) cityPayload.geometry = polygonGeometry

        await City.create(cityPayload)

        return { message: 'Created the city' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    },

    async editCity(_, args) {
      console.log({ editCityArgs: args })
      try {
        let location
        if (args.locationId) {
          location = await Location.findById(args.locationId)
          location.location.coordinates = args.coordinates
          await location.save()
        } else {
          location = await Location.create({
            location: { coordinates: args.coordinates }
          })
        }
        const city = await City.findById(args.id)
        city.title = args.title

        if (
          args.geometry?.type === 'Polygon' &&
          args.geometry.coordinates?.length
        ) {
          let ring = args.geometry.coordinates[0]

          // Close polygon if required
          const first = ring[0]
          const last = ring[ring.length - 1]
          if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first)
          }

          city.geometry = {
            type: 'Polygon',
            coordinates: [ring]
          }
        }

        if (!args.locationId || !city.location) {
          city.location = location
        }
        console.log({ city })
        await city.save()
        return { message: 'Edited the city' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    },

    async toggleCityActive(_, args) {
      try {
        const city = await City.findById(args.id)
        city.isActive = !city.isActive
        await city.save()
        return { message: 'city_updated' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    },

    async removeCity(_, args) {
      console.log({ argsRemoveCity: args })
      try {
        await City.findByIdAndDelete(args.id)
        return { message: 'City is being removed successfully!' }
      } catch (err) {
        throw new Error(`Something went wrong!: ${err}`)
      }
    }
  }
}
