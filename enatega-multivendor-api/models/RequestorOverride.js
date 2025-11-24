const mongoose = require('mongoose')

const RequestorOverrideSchema = new mongoose.Schema(
  {
    // country: { type: String }, // e.g. "EG"
    // city: { type: String, default: null }, // e.g. "KafrElSheikh"

    requestor_type: { type: String, enum: ['Business'], required: true },
    requestor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    }, // business ID

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

    effective: {
      from: { type: Date, default: null },
      to: { type: Date, default: null }
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },

    priority: { type: Number, default: 100 } // higher = applied first
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('RequestorOverride', RequestorOverrideSchema)
