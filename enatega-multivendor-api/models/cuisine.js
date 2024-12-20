const mongoose = require('mongoose')
const { SHOP_TYPE } = require('../helpers/enum')
const Schema = mongoose.Schema

const cuisineSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    image: {
      type: String
    },
    shopType: { type: String, default: SHOP_TYPE.RESTAURANT },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
const myModule = (module.exports = mongoose.model('Cuisine', cuisineSchema))
myModule.cuisineSchema = cuisineSchema
