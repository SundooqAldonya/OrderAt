const Review = require('../../models/review')
const Order = require('../../models/order')
const { transformReview, transformOrder } = require('./merge')
const Restaurant = require('../../models/restaurant')
module.exports = {
  Query: {
    reviews: async (_, args, context) => {
      console.log('reviews')
      try {
        const reviews = await Review.find({
          restaurant: args.restaurant
        }).sort({ _id: -1 })
        console.log({ reviews })
        return reviews.map(review => {
          return transformReview(review)
        })
      } catch (err) {
        throw err
      }
    },
    async userHasOrderReview(_, args) {
      try {
        const order = await Order.findById(args.orderId)
        const review = await Review.findOne({
          order: args.orderId,
          restaurant: args.restaurantId,
          user: order.user
        })
        console.log({ review: review })
        return review ? true : false
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    reviewOrder: async (_, args, { req, res }) => {
      console.log('reviewOrder')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const order = await Order.findById(args.reviewInput.order)
        const restaurant = await Restaurant.findById(order.restaurant)
        const review = new Review({
          order: args.reviewInput.order,
          rating: args.reviewInput.rating,
          restaurant: restaurant?.id,
          description: args.reviewInput.description,
          user: order.user
        })
        const result = await review.save()
        await Order.findOneAndUpdate(
          { _id: args.reviewInput.order },
          { review: result.id }
        ).setOptions({ useFindAndModify: false })
        const updatedOrder = await Order.findById(args.reviewInput.order)

        return transformOrder(updatedOrder)
      } catch (err) {
        throw err
      }
    }
  }
}
