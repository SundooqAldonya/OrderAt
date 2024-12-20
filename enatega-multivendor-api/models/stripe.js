const mongoose = require('mongoose')
const {
  payment_status,
  order_status,
  payment_method
} = require('../helpers/enum')
const { itemSchema } = require('./item')
const { pointSchema } = require('./point')
const { couponSchema } = require('./coupon')

const Schema = mongoose.Schema
const stripeSchema = new Schema(
  {
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone'
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    orderId: {
      type: String,
      required: true
    },
    deliveryCharges: { type: Number },
    deliveryAddress: {
      location: {
        type: pointSchema
      },
      deliveryAddress: { type: String, required: true },
      details: { type: String },
      label: { type: String, required: true }
    },
    items: [itemSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentStatus: {
      type: String,
      enum: payment_status,
      default: payment_status[0]
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    },
    orderStatus: {
      type: String,
      enum: order_status
    },
    orderAmount: { type: Number, required: true },
    paymentMethod: {
      enum: payment_method,
      type: String,
      required: true,
      default: payment_method[0]
    },
    isPickedUp: {
      type: Boolean,
      default: false
    },
    stripeCreatePayment: {
      type: Object,
      default: null
    },
    stripePaymentResponse: {
      type: Object,
      default: null
    },
    paymentId: {
      type: String
    },
    coupon: { type: couponSchema },
    completionTime: { type: Date },
    tipping: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    taxationAmount: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    orderDate: {
      type: Date,
      default: Date.now()
    },
    expectedTime: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    stripeSessionId: { type: String, default: null },
    instructions: {
      type: String
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Stripe', stripeSchema)
