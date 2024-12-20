const Earnings = require('../../models/earnings')
const Rider = require('../../models/rider')
const { transformEarnings } = require('../resolvers/merge')
module.exports = {
  Query: {
    earnings: async(_, __, { req }) => {
      console.log('Earnings')
      if (!req.isAuth) throw new Error('Unauthenticated!')
      try {
        const earnings = await Earnings.find({})
        return earnings.map(transformEarnings)
      } catch (err) {
        throw err
      }
    },
    riderEarnings: async(_, args, { req }) => {
      console.log('riderEarnings', args)
      const riderId = args.id || req.userId
      if (!riderId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderEarnings = await Earnings.find({ rider: riderId })
          .sort({
            createdAt: -1
          })
          .skip(args.offset || 0)
          .limit(10)
        return riderEarnings.map(transformEarnings)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createEarning: async(_, args, { req }) => {
      console.log('createEarning')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const rider = await Rider.findById(args.earningsInput.rider)
        const earning = new Earnings({
          rider: rider,
          orderId: args.earningsInput.orderId,
          deliveryFee: args.earningsInput.deliveryFee,
          orderStatus: args.earningsInput.orderStatus,
          paymentMethod: args.earningsInput.paymentMethod,
          deliveryTime: new Date()
        })
        const result = await earning.save()
        return result
      } catch (err) {
        throw err
      }
    }
  }
}
