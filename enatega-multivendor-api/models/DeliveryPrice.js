const mongoose = require('mongoose')
const { Schema } = mongoose

const DeliveryPriceSchema = new Schema({
  originZone: {
    type: Schema.Types.ObjectId,
    ref: 'DeliveryZone',
    required: true
  },
  destinationZone: {
    type: Schema.Types.ObjectId,
    ref: 'DeliveryZone',
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  service: {
    type: String,
    enum: ['FOOD', 'GROCERY', 'PHARMACY', 'MASHAWEER'],
    required: true
  }
})

const DeliveryPrice = mongoose.model('DeliveryPrice', DeliveryPriceSchema)
module.exports = DeliveryPrice
