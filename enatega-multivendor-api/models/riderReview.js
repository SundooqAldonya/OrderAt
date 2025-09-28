const { Schema, model } = require('mongoose')

const riderReviewSchema = new Schema(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = model('RiderReview', riderReviewSchema)
