const { Schema, model } = require('mongoose')

const citySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    isActive: { type: Boolean, default: true },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'], // ONLY Polygon
        required: false
      },
      coordinates: {
        type: Array, // [[[lon, lat], [lon, lat], ...]]
        required: false
      }
    }
  },
  { timestamps: true }
)

module.exports = model('City', citySchema)
