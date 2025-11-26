const mongoose = require('mongoose')

const GlobalDeliveryPricing = new mongoose.Schema(
  {
    model: {
      type: String,
      enum: ['FIXED', 'PER_KM', 'HYBRID'],
      default: 'PER_KM'
    },

    // Unified params
    params: {
      fixed: Number,
      per_km: Number,
      min_fee: Number,
      included_km: Number,
      baseFare: Number // optional hybrid variant
    },

    minimumDeliveryFee: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('GlobalDeliveryPricing', GlobalDeliveryPricing)
