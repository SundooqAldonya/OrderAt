const CityPricing = require('../../models/CityPricing')

module.exports = {
  Query: {
    async getAllCityPricing(_, { city }) {
      try {
        const filter = city ? { city } : {}
        return await CityPricing.find(filter)
          .populate('city')
          .sort({ city: 1 })
          .lean()
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async getCityPricingById(_, { id }) {
      try {
        const rule = await CityPricing.findById(id).lean()
        if (!rule) throw new Error('city_pricing_not_found')
        return rule
      } catch (err) {
        throw new Error(err.message)
      }
    }
  },

  Mutation: {
    async upsertCityPricing(_, { id, input }) {
      try {
        const params = normalizeParams(input.model, input)

        const data = {
          city: input.city,
          service: input.service,
          model: input.model,
          params,
          status: input.status || 'ACTIVE'
        }

        // UPDATE
        if (id) {
          await CityPricing.updateOne({ _id: id }, { $set: data })

          return { message: 'city_pricing_updated_successfully' }
        }

        // CREATE
        await CityPricing.create(data)

        return { message: 'city_pricing_created_successfully' }
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async deleteCityPricing(_, { id }) {
      try {
        const deleted = await CityPricing.findByIdAndDelete(id)
        if (!deleted) throw new Error('city_pricing_not_found')
        return true
      } catch (err) {
        throw new Error(err.message)
      }
    }
  }
}

/**
 * Normalize params based on model:
 * - FIXED → only fixed
 * - PER_KM → per_km + min_fee
 * - HYBRID → fixed + per_km + min_fee + included_km
 */
function normalizeParams(model, input) {
  switch (model) {
    case 'FIXED':
      return {
        fixed: input.fixed ?? null,
        per_km: null,
        min_fee: null,
        included_km: null
      }

    case 'PER_KM':
      return {
        fixed: null,
        per_km: input.per_km ?? null,
        min_fee: input.min_fee ?? null,
        included_km: null
      }

    case 'HYBRID':
      return {
        fixed: input.fixed ?? null,
        per_km: input.per_km ?? null,
        min_fee: input.min_fee ?? null,
        included_km: input.included_km ?? null
      }

    default:
      throw new Error('Invalid pricing model')
  }
}
