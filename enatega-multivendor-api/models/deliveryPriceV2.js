const { Schema, model } = require('mongoose')

const deliveryPriceSchema = new Schema(
  {
    originZone: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryZone',
      required: true
    },

    destinationZone: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryZone',
      required: true
    },

    // The base starting fee
    baseFare: {
      type: Number,
      required: true,
      min: 0
    },

    // Cost per km (variable)
    perKmRate: {
      type: Number,
      required: true,
      min: 0
    },

    // Surge multiplier, default 1, must be >= 1
    surgeMultiplier: {
      type: Number,
      default: 1,
      min: 1
    },

    // Minimum payable fare after calculation
    minFare: {
      type: Number,
      required: true,
      min: 0
    },

    // If false: this route is disabled
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// Prevent duplicate origin/destination pairs
deliveryPriceSchema.index(
  { originZone: 1, destinationZone: 1 },
  { unique: true }
)

module.exports = model('DeliveryPriceV2', deliveryPriceSchema)
