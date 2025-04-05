const mongoose = require('mongoose')
const { Schema } = mongoose

const DeliveryPriceSchema = new Schema({
  originZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  destinationZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  cost: {
    type: Number,
    required: true
  }
})

const DeliveryPrice = mongoose.model('DeliveryPrice', DeliveryPriceSchema)
module.exports = DeliveryPrice
