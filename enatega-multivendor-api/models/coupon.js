const mongoose = require('mongoose')

const Schema = mongoose.Schema
const couponSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    // TODO: TBD, adding discountPercent and flatDiscount to the coupons in future
    discount: {
      type: Number,
      required: true
    },
    // TODO: TBD, adding an expiry date to coupons in future, maybe start date too?
    enabled: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Coupon', couponSchema))
myModule.couponSchema = couponSchema
