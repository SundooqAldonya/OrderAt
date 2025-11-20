const mongoose = require('mongoose')

const VehicleLoadingSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    city: { type: String, default: null },

    services: {
      type: Map,
      of: new mongoose.Schema(
        {
          BIKE: { type: mongoose.Schema.Types.Mixed, default: 0 },
          MOTORCYCLE: {
            type: mongoose.Schema.Types.Mixed,
            default: { per_km: 0 }
          },
          CAR: { type: mongoose.Schema.Types.Mixed, default: { per_km: 0 } }
        },
        { _id: false }
      )
    },

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

module.exports = mongoose.model('VehicleLoading', VehicleLoadingSchema)
