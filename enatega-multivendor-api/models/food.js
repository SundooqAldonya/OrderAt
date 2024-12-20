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
    variations: [variationSchema],
    // can we store base64 image in mongodb, research,
    // if so can we use it here and how would it affect apollo server schema
    image: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
foodSchema.index({ '$**': 'text' })
const myModule = (module.exports = mongoose.model('Food', foodSchema))
myModule.foodSchema = foodSchema
