const RiderRegister = require('../../models/riderRegister')

module.exports = {
  Query: {
    async getRidersRegistered(_, args) {
      try {
        const riders = await RiderRegister.find()
        return riders
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createRiderRegister(_, args) {
      console.log({ args })
      try {
        const rider = new RiderRegister({ ...args.riderRegisterInput })
        await rider.save()
        return { message: 'register_successful' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async removeRiderRegistered(_, args) {
      console.log({ args })
      try {
        const riderRegister = await RiderRegister.findById(args.id)
        await riderRegister.deleteOne()
        return { message: 'removed_riderRegister' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
