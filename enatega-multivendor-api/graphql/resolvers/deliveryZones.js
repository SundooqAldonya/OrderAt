const { calculateAmount } = require('../../helpers/utilities')
const Configuration = require('../../models/configuration')
const DeliveryPrice = require('../../models/DeliveryPrice')
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
    },

    async getDeliveryCalculation(_, args) {
      try {
        // get zone charges from delivery prices

        const latOrigin = args.originZone.location.coordinates[1]
        const lonOrigin = args.originZone.location.coordinates[0]

        const latDest = args.destinationZone.location.coordinates[1]
        const longDest = args.destinationZone.location.coordinates[0]

        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )

        const configuration = await Configuration.findOne()
        const costType = configuration.costType

        const originZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: args.originZone.location.coordinates
            }
          }
        })

        const destinationZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: args.destinationZone.location.coordinates
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

        console.log({ deliveryPrice })
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
