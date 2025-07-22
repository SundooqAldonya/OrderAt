const { calculateDistance } = require('../../helpers/findRiders')
const { calculateAmount } = require('../../helpers/utilities')
const Area = require('../../models/area')
const Configuration = require('../../models/configuration')
const DeliveryPrice = require('../../models/DeliveryPrice')
const DeliveryZone = require('../../models/deliveryZone')
const Location = require('../../models/location')
const Restaurant = require('../../models/restaurant')

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
    },

    async areasCalculatedList(_, args) {
      try {
        const { restaurantId } = args
        // get the restaurant
        const restaurant = await Restaurant.findById(restaurantId)
        // get the origin point
        const configuration = await Configuration.findOne()
        const costType = configuration.costType
        // get the areas
        const areas = await Area.find({ city: restaurant?.city })
          .populate('city')
          .populate('location')
        // loop on areas
        const list = await Promise.all(
          areas.map(async area => {
            // calculate the distance of each area from the origin point
            const distance = calculateDistance(
              restaurant.location.coordinates[1],
              restaurant.location.coordinates[0],
              area.location.location.coordinates[1],
              area.location.location.coordinates[0]
            )
            const originZone = await DeliveryZone.findOne({
              location: {
                $geoIntersects: {
                  $geometry: [
                    restaurant.location.coordinates[0],
                    restaurant.location.coordinates[1]
                  ]
                }
              }
            })

            const destinationZone = await DeliveryZone.findOne({
              location: {
                $geoIntersects: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [
                      area.location.location.coordinates[0],
                      area.location.location.coordinates[1]
                    ]
                  }
                }
              }
            })

            console.log({ originZone, destinationZone })
            let deliveryPrice
            if (originZone && destinationZone) {
              deliveryPrice = await DeliveryPrice.findOne({
                $or: [
                  {
                    originZone: originZone._id,
                    destinationZone: destinationZone._id
                  },
                  {
                    originZone: destinationZone._id,
                    destinationZone: originZone._id
                  }
                ]
              })
            }
            // calculate the amount of delivery fee
            let amount
            if (deliveryPrice) {
              amount = deliveryPrice.cost
            } else {
              amount = calculateAmount(
                costType,
                configuration.deliveryRate,
                distance
              )
            }

            if (
              parseFloat(amount) <= configuration.minimumDeliveryFee ||
              distance <= 0.25 + Number.EPSILON
            ) {
              amount = configuration.minimumDeliveryFee
            }

            const obj = {
              ...area._doc,
              distance,
              cost: amount
            }
            return obj
          })
        )

        console.log({ list })
        return list
      } catch (err) {
        throw new Error(err)
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
