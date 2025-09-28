const RiderReview = require('../../models/riderReview')

module.exports = {
  Query: {
    async getRiderOrderReview(_, { orderId, riderId }, { req }) {
      if (!req.user) {
        throw new Error('Authentication required')
      }
      try {
        const review = await RiderReview.findOne({
          order: orderId,
          rider: riderId,
          user: req.user._id
        })
        if (review) {
          return true
        } else {
          return false
        }
      } catch (err) {
        console.error('Error fetching rider review:', err)
        throw err
      }
    }
  },
  Mutation: {
    createRiderReview: async (_, { input }, { req }) => {
      try {
        const { order, rating, description, rider } = input
        if (!req.user) {
          throw new Error('Authentication required')
        }
        // Check if the user has already reviewed this order
        const existingReview = await RiderReview.findOne({
          order,
          user: req.user._id
        })
        if (existingReview) {
          throw new Error('You have already reviewed this order')
        }
        const newReview = await RiderReview.create({
          rider,
          order,
          user: req.user._id,
          rating,
          description
        })

        return { message: 'Rider review created successfully' }
      } catch (err) {
        console.error('Error creating rider review:', err)
        throw err
      }
    }
  }
}
