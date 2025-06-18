const mongoose = require('mongoose')
const { variationSchema } = require('./variation')
const Schema = mongoose.Schema

const foodSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    image: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    variations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Variation'
      }
    ],
    stock: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    }
  },
  { timestamps: true }
)
foodSchema.index({ '$**': 'text' })
const myModule = (module.exports = mongoose.model('Food', foodSchema))
myModule.foodSchema = foodSchema
