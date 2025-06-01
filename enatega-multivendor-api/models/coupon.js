const mongoose = require('mongoose')

const Schema = mongoose.Schema
const couponSchema = new Schema(
  {
    title: {
      type: String
      // required: true
    },
    // TODO: TBD, adding discountPercent and flatDiscount to the coupons in future
    discount: {
      type: Number
      // required: true
    },
    // TODO: TBD, adding an expiry date to coupons in future, maybe start date too?
    enabled: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    code: {
      type: String,
      // required: true,
      unique: true
    },
    description: {
      type: String
    },
    target: {
      cities: [
        {
          type: Schema.Types.ObjectId,
          ref: 'City'
        }
      ],
      businesses: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Restaurant'
        }
      ],
      customers: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      ],
      categories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'BusinessCategory'
        }
      ],
      foods: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Food'
        }
      ]
    },
    rules: {
      discount_type: {
        type: String,
        enum: ['percent', 'flat'],
        default: 'percent'
      },
      discount_value: {
        type: Number
      },
      applies_to: {
        type: [String],
        enum: ['subtotal', 'delivery', 'items'],
        default: ['subtotal']
      },
      min_order_value: {
        type: Number,
        default: 0
      },
      max_discount: {
        type: Number
      },
      start_date: {
        type: Date
      },
      end_date: {
        type: Date
      },
      limit_total: {
        type: Number
      },
      limit_per_user: {
        type: Number
      }
    },
    tracking: {
      usage_count: {
        type: Number,
        default: 0
      },
      user_usage: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'disabled'],
      default: 'active'
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Coupon', couponSchema))
myModule.couponSchema = couponSchema
