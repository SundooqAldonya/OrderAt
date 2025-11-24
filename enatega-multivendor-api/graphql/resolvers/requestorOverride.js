const RequestorOverride = require('../../models/RequestorOverride')

module.exports = {
  Query: {
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
    async updateRequestorOverride(_, { input }) {
      try {
        await RequestorOverride.updateOne(
          { _id: args.id },
          {
            // country: input.country,
            // city: input.city,
            requestor_type: input.requestor_type,
            requestor_id: input.requestor_id,
            service: input.service,
            model: input.model,
            params: {
              fixed: input.fixed,
              per_km: input.per_km,
              min_fee: input.min_fee,
              included_km: input.included_km
            },
            effective: {
              from: input.effective_from,
              to: input.effective_to
            },
            status: input.status,
            priority: input.priority
          }
        )

        return { message: 'request_override_created_successfully' }
      } catch (err) {
        throw err
      }
    }
  }
}
