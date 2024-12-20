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
    addons: [String]
  },
  { timestamps: true }
)
const myModule = (module.exports = mongoose.model('Variation', variationSchema))
myModule.variationSchema = variationSchema
