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

const timeRangeSchema = new Schema(
  {
    from: { type: String, required: true }, // "09:00"
    to: { type: String, required: true }, // "17:00"
    allowAcrossMidnight: { type: Boolean, default: true }
  },
  { _id: false }
)

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
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country'
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City'
    },
    timeRange: timeRangeSchema
  },
  { timestamps: true }
)

const DeliveryZone = model('DeliveryZone', deliveryZoneSchema)
module.exports = DeliveryZone
