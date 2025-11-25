const mongoose = require('mongoose')

const CountryPricingSchema = new mongoose.Schema(
  {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    }, // e.g. "EG", "SA", "AE"

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

module.exports = mongoose.model('CountryPricing', CountryPricingSchema)
