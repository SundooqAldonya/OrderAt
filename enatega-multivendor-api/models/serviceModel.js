// models/ServiceModel.js
const mongoose = require('mongoose')
const { Schema } = mongoose

const ServiceModelSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., FOOD, GROCERY
    model: {
      type: String,
      enum: ['FIXED', 'PER_KM', 'HYBRID'],
      required: true
    },
    fixed: Number,
    per_km: Number,
    min_fee: Number,
    included_km: Number,
    country: { type: Schema.Types.ObjectId, ref: 'Country' },
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    source_level: { type: String, enum: ['COUNTRY', 'CITY'], required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ServiceModel', ServiceModelSchema)
