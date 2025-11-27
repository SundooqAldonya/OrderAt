const GlobalDeliveryPricing = require('../../models/globalDeliveryPricing')

function normalizeGlobalParams(model, input) {
  switch (model) {
    case 'FIXED':
      return {
        fixed: input.fixed ?? null,
        per_km: null,
        min_fee: null,
        included_km: null,
        baseFare: null
      }

    case 'PER_KM':
      return {
        fixed: null,
        per_km: input.per_km ?? null,
        min_fee: input.min_fee ?? null,
        included_km: null,
        baseFare: null
      }

    case 'HYBRID':
      return {
        fixed: input.fixed ?? null,
        per_km: input.per_km ?? null,
        min_fee: input.min_fee ?? null,
        included_km: input.included_km ?? null,
        baseFare: input.baseFare ?? null
      }

    default:
      throw new Error('Invalid pricing model')
  }
}

module.exports = {
  Query: {
    async getGlobalDeliveryPricing() {
      try {
        let doc = await GlobalDeliveryPricing.findOne().lean()
        if (!doc) {
          // If no document exists, create default config
          doc = await GlobalDeliveryPricing.create({})
        }
        return doc
      } catch (err) {
        throw new Error(err.message)
      }
    }
  },

  Mutation: {
    async updateGlobalDeliveryPricing(_, { input }) {
      try {
        const params = normalizeGlobalParams(input.model, input)

        await GlobalDeliveryPricing.updateOne(
          {},
          {
            $set: {
              model: input.model,
              params,
              minimumDeliveryFee: input.minimumDeliveryFee
            }
          },
          { upsert: true }
        )

        return { message: 'global_delivery_pricing_updated_successfully' }
      } catch (err) {
        throw new Error(err.message)
      }
    }
  }
}
