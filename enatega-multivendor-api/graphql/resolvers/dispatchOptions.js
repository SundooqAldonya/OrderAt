const DispatchOptions = require('../../models/DispatchOptions')

module.exports = {
  Query: {
    async getDispatchOptions(_, args) {
      try {
        const dispatchOptions = await DispatchOptions.findOne({})
        console.log({ dispatchOptions })
        return dispatchOptions
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    async updateDispatchOptions(_, { input }, { req }) {
      console.log('updateDispatchOptions', { input })
      if (!req.user) throw new Error('unauthenticated!')
      try {
        let dispatchOptions = await DispatchOptions.findOneAndUpdate(
          {},
          {
            $set: {
              delayDispatch: input.delayDispatch,
              firstAttemptRiders: input.firstAttemptRiders,
              secondAttemptRiders: input.secondAttemptRiders,
              thirdAttemptRiders: input.thirdAttemptRiders
            }
          },
          {
            new: true,
            upsert: true // create it if it doesn't exist
          }
        )
        console.log({ dispatchOptions })
        return { message: 'dispatch_options_updated' }
      } catch (err) {
        throw err
      }
    }
  }
}
