const mongoose = require('mongoose')
const { orderOptionSchema } = require('./orderOption')

const Schema = mongoose.Schema

const orderAddonSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    options: [orderOptionSchema],
    quantityMinimum: {
      type: Number,
      required: true
    },
    quantityMaximum: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model(
  'OrderAddon',
  orderAddonSchema
))
myModule.orderAddonSchema = orderAddonSchema
