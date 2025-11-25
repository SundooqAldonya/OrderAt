const DeliveryPriceV2 = require('../../models/deliveryPriceV2')
// const DeliveryZone = require('../../models/deliveryZone')

module.exports = {
  Query: {
    async getAllZonePricing() {
      try {
        return await DeliveryPriceV2.find()
          .populate('city')
          .populate('originZone')
          .populate('destinationZone')
          .lean()
      } catch (err) {
        throw new Error(err)
      }
    },

    async getZonePricingById(_, { id }) {
      try {
        const zone = await DeliveryPriceV2.findById(id)
          .populate('city')
          .populate('originZone')
          .populate('destinationZone')
          .lean()

        if (!zone) throw new Error('Zone pricing not found')
        return zone
      } catch (err) {
        throw new Error(err.message)
      }
    }
  },

  Mutation: {
    async upsertZonePricing(_, { input }) {
      try {
        const {
          id,
          city,
          originZone,
          destinationZone,
          baseFare,
          perKmRate,
          minFare,
          surgeMultiplier,
          isActive
        } = input

        // 🚨 Validation: Origin must not equal destination
        if (originZone === destinationZone) {
          throw new Error('Origin zone and destination zone cannot be the same')
        }

        // 🚨 Prevent duplicates unless we are editing
        const existing = await DeliveryPriceV2.findOne({
          originZone,
          destinationZone
        })

        if (existing && (!id || existing._id.toString() !== id)) {
          throw new Error(
            'A pricing rule for this origin & destination already exists'
          )
        }

        const data = {
          city,
          originZone,
          destinationZone,
          baseFare: Number(baseFare),
          perKmRate: Number(perKmRate),
          minFare: Number(minFare),
          surgeMultiplier: surgeMultiplier ? Number(surgeMultiplier) : 1,
          isActive: isActive ?? true
        }

        let doc

        if (id) {
          // Update
          doc = await DeliveryPriceV2.findByIdAndUpdate(id, data, {
            new: true
          })
            .populate('originZone')
            .populate('destinationZone')
        } else {
          // Create
          doc = await DeliveryPriceV2.create(data)
          // doc = await doc.populate('originZone')
          // doc = await doc.populate('destinationZone')
        }

        return { message: 'created_zone_pricing_successfully' }
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async deleteZonePricing(_, { id }) {
      try {
        const deleted = await DeliveryPriceV2.findByIdAndDelete(id)
        if (!deleted) throw new Error('Zone pricing not found')
        return { message: 'removed_zone_pricing_successfully' }
      } catch (err) {
        throw new Error(err.message)
      }
    }
  }
}
