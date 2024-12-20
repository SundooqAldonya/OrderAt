const mongoose = require('mongoose')
const { orderVariationSchema } = require('./orderVariation')
const { orderAddonSchema } = require('./orderAddon')

const Schema = mongoose.Schema

const itemSchema = new Schema(
  {
    food: {
      type: String,
      required: true
    },
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
    quantity: {
      type: Number,
      required: true
    },
    variation: orderVariationSchema,
    addons: [orderAddonSchema],
    specialInstructions: { type: String, default: '' },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
const myModule = (module.exports = mongoose.model('Item', itemSchema))
myModule.itemSchema = itemSchema
