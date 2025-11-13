// models/VehicleLoading.js
const mongoose = require('mongoose')
const { Schema } = mongoose

const VehicleLoadingSchema = new Schema(
  {
    service: { type: String, required: true },
    vehicle_type: {
      type: String,
      enum: ['BIKE', 'MOTORCYCLE', 'CAR'],
      required: true
    },
    per_km: { type: Number, default: 0 },
    country: { type: Schema.Types.ObjectId, ref: 'Country' },
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    source_level: { type: String, enum: ['COUNTRY', 'CITY'], required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('VehicleLoading', VehicleLoadingSchema)
