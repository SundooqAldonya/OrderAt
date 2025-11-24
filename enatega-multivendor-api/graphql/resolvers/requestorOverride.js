const RequestorOverride = require('../../models/RequestorOverride')

module.exports = {
  Query: {
    async getRestaurantRequestorOverrideList(_, args) {
      try {
        const reqOverride = await RequestorOverride.find().populate(
          'requestor_id'
        )
        return reqOverride
      } catch (err) {
        throw err
      }
    },
    async getRestaurantRequestorOverride(_, args) {
      try {
        const reqOverride = await RequestorOverride.findOne({
          requestor_id: args.id
        })
        return reqOverride
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    async createRequestorOverride(_, { input }) {
      try {
        const reqOverride = await RequestorOverride.create({
          // country: input.country,
          // city: input.city || null,
          requestor_type: input.requestor_type, // usually "Business"
          requestor_id: input.requestor_id, // restaurant ID
          service: input.service, // FOOD | GROCERY | PHARMACY | MASHAWEER
          model: input.model, // FIXED | PER_KM | HYBRID
          // params object
          params: {
            fixed: input.fixed,
            per_km: input.per_km,
            min_fee: input.min_fee,
            included_km: input.included_km
          },
          // effective date range
          effective: {
            from: input.effective_from || null,
            to: input.effective_to || null
          },
          status: input.status || 'ACTIVE',
          priority: input.priority || 100
        })
        return { message: 'request_override_created_successfully' }
      } catch (err) {
        throw err
      }
    },
    async updateRequestorOverride(_, { id, input }) {
      try {
        // const result = await RequestorOverride.findById(id)
        // console.log({ result })
        const normalizedParams = normalizeParams(input.model, input)
        const result = await RequestorOverride.updateOne(
          { _id: id },
          {
            $set: {
              requestor_type: input.requestor_type,
              // requestor_id: input.requestor_id,
              service: input.service,
              model: input.model,
              params: normalizedParams,
              'effective.from': input.effective_from
                ? new Date(input.effective_from)
                : null,
              'effective.to': input.effective_to
                ? new Date(input.effective_to)
                : null,
              status: input.status,
              priority: input.priority
            }
          }
        )

        if (result.matchedCount === 0) {
          throw new Error('No document found with this ID')
        }

        return { message: 'request_override_created_successfully' }
      } catch (err) {
        throw err
      }
    }
  }
}

// helpers
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
      throw new Error('Invalid pricing model selected.')
  }
}
