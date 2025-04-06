const { Schema, model } = require('mongoose')

const polygonSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]],
    required: true
  }
})

const deliveryZoneSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    location: polygonSchema,
    isActive: {
      type: Boolean,
      default: true
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City'
    }
  },
  { timestamps: true }
)

const DeliveryZone = model('DeliveryZone', deliveryZoneSchema)
module.exports = DeliveryZone
