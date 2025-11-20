const mongoose = require('mongoose')

const CityPricingSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },

    service: {
      type: String,
      enum: ['FOOD', 'GROCERY', 'PHARMACY', 'MASHAWEER'],
      required: true
    },

    model: {
      type: String,
      enum: ['FIXED', 'PER_KM', 'HYBRID'],
      required: true
    },

    params: {
      fixed: Number,
      per_km: Number,
      min_fee: Number,
      included_km: Number
    },

    surgeMultiplier: { type: Number, default: 1 },

    effective: {
      from: { type: Date, default: null },
      to: { type: Date, default: null }
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('CityPricing', CityPricingSchema)
