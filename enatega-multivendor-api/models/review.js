const mongoose = require('mongoose')
const Restaurant = require('./restaurant')

const Schema = mongoose.Schema
const reviewSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    rating: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
reviewSchema.post('save', async doc => {
  try {
    let average = 0
    const ReviewModel = mongoose.model('Review', reviewSchema)
    const result = await ReviewModel.aggregate([
      {
        $group: {
          _id: doc.restaurant,
          reviewsAverage: { $avg: '$rating' }
        }
      }
    ]).exec()
    if (result && result.length > 0) average = result[0].reviewsAverage || 0
    await Restaurant.findByIdAndUpdate(doc.restaurant.toString(), {
      $set: { reviewAverage: Number(average.toFixed(2)) },
      $inc: { reviewCount: 1 }
    })
  } catch (error) {
    console.log('post save review error', error)
  }
})
const myModule = (module.exports = mongoose.model('Review', reviewSchema))
myModule.reviewSchema = reviewSchema
