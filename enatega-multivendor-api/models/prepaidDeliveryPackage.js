const { Schema, model } = require('mongoose')

const PrepaidDeliveryPackageSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant', // Reference to the business that owns the package
      required: true,
      index: true
    },
    totalDeliveries: {
      type: Number,
      required: true, // Total number of deliveries included in the package (e.g., 100)
      min: 1
    },
    usedDeliveries: {
      type: Number, // Number of deliveries already used from the package
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      required: true // Total price for the whole package
    },
    maxDeliveryAmount: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date // Optional expiration date (e.g., valid for 30 days)
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin' // Who created or approved the package
    }
  },
  { timestamps: true }
)

// Virtual field to calculate remaining deliveries
PrepaidDeliveryPackageSchema.virtual('remainingDeliveries').get(function () {
  return this.totalDeliveries - this.usedDeliveries
})

PrepaidDeliveryPackageSchema.set('toJSON', { virtuals: true })
PrepaidDeliveryPackageSchema.set('toObject', { virtuals: true })

const PrepaidDeliveryPackage = model(
  'PrepaidDeliveryPackage',
  PrepaidDeliveryPackageSchema
)
module.exports = PrepaidDeliveryPackage
