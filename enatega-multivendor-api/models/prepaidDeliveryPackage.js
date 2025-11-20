const { Schema, model } = require('mongoose')

const PrepaidDeliveryPackageSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },

    // Total allowed deliveries
    totalDeliveries: {
      type: Number,
      required: true,
      min: 1
    },

    // Deliveries already consumed
    usedDeliveries: {
      type: Number,
      default: 0,
      min: 0
    },

    // Total prepaid package price
    price: {
      type: Number,
      required: true
    },

    // Maximum amount the package can cover for a single delivery
    maxDeliveryAmount: {
      type: Number,
      required: true
    },

    // Only FOOD is supported in your system
    serviceType: {
      type: String,
      enum: ['FOOD'],
      default: 'FOOD'
    },

    // Whether the package is enabled
    isActive: {
      type: Boolean,
      default: true
    },

    // Expiration date
    expiresAt: {
      type: Date
    },

    // (Optional) City restriction
    city: {
      type: String
    },

    // (Optional) Country restriction
    country: {
      type: String
    },

    // Usage log
    usageHistory: [
      {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        usedAt: Date,
        amount: Number
      }
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  { timestamps: true }
)

// Virtual: remaining deliveries
PrepaidDeliveryPackageSchema.virtual('remainingDeliveries').get(function () {
  return Math.max(0, this.totalDeliveries - this.usedDeliveries)
})

// Virtual: expired?
PrepaidDeliveryPackageSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date()
})

PrepaidDeliveryPackageSchema.set('toJSON', { virtuals: true })
PrepaidDeliveryPackageSchema.set('toObject', { virtuals: true })

module.exports = model('PrepaidDeliveryPackage', PrepaidDeliveryPackageSchema)

// const { Schema, model } = require('mongoose')

// const PrepaidDeliveryPackageSchema = new Schema(
//   {
//     business: {
//       type: Schema.Types.ObjectId,
//       ref: 'Restaurant', // Reference to the business that owns the package
//       required: true,
//       index: true
//     },
//     totalDeliveries: {
//       type: Number,
//       required: true, // Total number of deliveries included in the package (e.g., 100)
//       min: 1
//     },
//     usedDeliveries: {
//       type: Number, // Number of deliveries already used from the package
//       default: 0,
//       min: 0
//     },
//     price: {
//       type: Number,
//       required: true // Total price for the whole package
//     },
//     maxDeliveryAmount: {
//       type: Number,
//       required: true
//     },
//     isActive: {
//       type: Boolean,
//       default: true
//     },
//     expiresAt: {
//       type: Date // Optional expiration date (e.g., valid for 30 days)
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'Admin' // Who created or approved the package
//     }
//   },
//   { timestamps: true }
// )

// // Virtual field to calculate remaining deliveries
// PrepaidDeliveryPackageSchema.virtual('remainingDeliveries').get(function () {
//   return this.totalDeliveries - this.usedDeliveries
// })

// PrepaidDeliveryPackageSchema.set('toJSON', { virtuals: true })
// PrepaidDeliveryPackageSchema.set('toObject', { virtuals: true })

// const PrepaidDeliveryPackage = model(
//   'PrepaidDeliveryPackage',
//   PrepaidDeliveryPackageSchema
// )
// module.exports = PrepaidDeliveryPackage
