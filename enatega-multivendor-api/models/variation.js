const mongoose = require('mongoose')
const Schema = mongoose.Schema

const variationSchema = new Schema(
  {
    title: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    discounted: {
      type: Number,
      default: 0
    },
    // addons: [String],
    addons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Addon'
      }
    ],
    food: {
      type: Schema.Types.ObjectId,
      ref: 'Food'
    },
    stock: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    }
  },
  { timestamps: true }
)

variationSchema.index({ title: 1, food: 1 })
const myModule = (module.exports = mongoose.model('Variation', variationSchema))
myModule.variationSchema = variationSchema
