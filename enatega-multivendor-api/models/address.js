const mongoose = require('mongoose')
const { pointSchema } = require('./point')

const Schema = mongoose.Schema
const addressSchema = new Schema(
  {
    location: {
      type: pointSchema
    },
    deliveryAddress: { type: String, required: false },
    details: { type: String },
    label: { type: String, required: false },
    selected: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Address', addressSchema))
myModule.addressSchema = addressSchema
