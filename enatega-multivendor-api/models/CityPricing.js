const mongoose = require('mongoose')

const CityPricingSchema = new mongoose.Schema(
  {
    city: {
      // e.g. Cairo, Alexandria, Kafr
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true
    },

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
