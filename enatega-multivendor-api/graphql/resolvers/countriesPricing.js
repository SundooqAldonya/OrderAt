const CountryPricing = require('../models/CountryPricing')

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

module.exports = {
  Query: {
    async getAllCountryPricing(_, { country }) {
      try {
        const filter = country ? { country } : {}
        return await CountryPricing.find(filter).sort({ country: 1 }).lean()
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async getCountryPricingById(_, { id }) {
      try {
        const rule = await CountryPricing.findById(id).lean()
        if (!rule) throw new Error('country_pricing_not_found')
        return rule
      } catch (err) {
        throw new Error(err.message)
      }
    }
  },

  Mutation: {
    async upsertCountryPricing(_, { id, input }) {
      try {
        const params = normalizeParams(input.model, input)

        const data = {
          country: input.country,
          service: input.service,
          model: input.model,
          params,
          status: input.status || 'ACTIVE'
        }

        if (id) {
          await CountryPricing.updateOne({ _id: id }, { $set: data })
          return { message: 'country_pricing_updated_successfully' }
        }

        await CountryPricing.create(data)
        return { message: 'country_pricing_created_successfully' }
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async deleteCountryPricing(_, { id }) {
      try {
        const deleted = await CountryPricing.findByIdAndDelete(id)
        if (!deleted) throw new Error('country_pricing_not_found')
        return true
      } catch (err) {
        throw new Error(err.message)
      }
    }
  }
}
