const { Schema } = require('mongoose')

const PriceProfileSchema = new Schema(
  {
    city: { type: Types.ObjectId, ref: 'City', required: true },

    country: { type: String, default: 'EG' },

    service: {
      type: String,
      enum: ['FOOD', 'MASHAWEER', 'GROCERY', 'SCHEDULED'],
      required: true
    },

    vehicle: {
      type: String,
      enum: ['BIKE', 'SCOOTER', 'CAR'],
      default: 'SCOOTER'
    },

    business: { type: Types.ObjectId, ref: 'Business' },

    type: {
      type: String,
      enum: ['price_profile', 'payout_profile'],
      default: 'price_profile'
    },

    mode: {
      type: String,
      enum: ['DISTANCE', 'FLAT_TOTAL'],
      default: 'DISTANCE'
    },

    components: {
      base_fee: { type: Number, default: 0 },
      included_km: { type: Number, default: 0 },
      per_km: { type: Number, default: 0 },
      per_min: { type: Number, default: 0 },
      caps: {
        min_fee: { type: Number },
        max_fee: { type: Number },
        min_payout: { type: Number }
      },
      rounding: {
        mode: {
          type: String,
          enum: ['NEAREST', 'UP', 'DOWN'],
          default: 'NEAREST'
        },
        step: { type: Number, default: 1 }
      }
    },

    effective: {
      from: { type: Date, required: true },
      to: { type: Date }
    },

    priority: { type: Number, default: 50 },

    version: { type: Number, default: 1 },

    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  { timestamps: true }
)

PriceProfileSchema.index({
  city: 1,
  service: 1,
  vehicle: 1,
  status: 1,
  'effective.from': -1
})
PriceProfileSchema.index({ 'effective.from': 1, 'effective.to': 1 })

export default model('PriceProfile', PriceProfileSchema)
