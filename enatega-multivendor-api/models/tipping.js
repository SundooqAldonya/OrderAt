const mongoose = require('mongoose')

function arrayLimit(val) {
  return val.length <= 3
}

const Schema = mongoose.Schema
const tippingSchema = new Schema(
  {
    tipVariations: {
      type: [Number],
      default: [1, 2, 3],
      validate: [arrayLimit, '{PATH} exceeds the limit of 3']
    },
    enabled: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Tipping', tippingSchema))
myModule.tippingSchema = tippingSchema
