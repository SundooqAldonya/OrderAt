const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderVariationSchema = new Schema(
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
      required: true
    }
  },
  { timestamps: true }
)
const myModule = (module.exports = mongoose.model(
  'OrderVariation',
  orderVariationSchema
))
myModule.orderVariationSchema = orderVariationSchema
