const mongoose = require('mongoose')
const { itemSchema } = require('./item')
const {
  payment_status,
  order_status,
  payment_method
} = require('../helpers/enum')
const { pointSchema } = require('./point')
const { couponSchema } = require('./coupon')
const { messageSchema } = require('./message')
const Earning = require('./earnings')
const Rider = require('./rider')
const { v4 } = require('uuid')
const mongoosePagination = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const orderSchema = new Schema(
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
      type: String
      //required: true
    },
    resId: {
      type: String
      //required: true
    },
    deliveryAddress: {
      location: {
        type: pointSchema
      },
      deliveryAddress: { type: String },
      details: { type: String },
      label: { type: String },
      id: { type: String, default: v4() }
    },
    items: [itemSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Owner'
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
    // TODO: TBD, which status is this and what is it used for
    // i think we need only order_status(rename it to orderStatus)
    // and payment_status(paymentStatus)
    orderStatus: {
      type: String,
      enum: order_status
    },
    // TODO: TBD, we should show rider to collect cash and how much before marking order delivered?
    paidAmount: { type: Number },
    orderAmount: { type: Number, required: true },
    deliveryCharges: { type: Number },
    minimumDeliveryFee: { type: Number },
    paymentMethod: {
      enum: payment_method,
      type: String,
      required: true,
      default: payment_method[0]
    },
    reason: { type: String },
    // should we save original amount before discount also?
    // also show these details on order modal
    coupon: { type: couponSchema },
    tipping: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    isPickedUp: {
      type: Boolean,
      default: false
    },
    taxationAmount: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    // TODO: TBD, should we show rider information when order is completed?
    // do we store times at which status get updated
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    completionTime: { type: Date },
    orderDate: {
      type: Date,
      default: Date.now()
    },
    expectedTime: {
      type: Date,
      default: null
    },
    preparationTime: {
      type: Date,
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    pickedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    chat: { type: [messageSchema], default: [] },
    isActive: {
      type: Boolean,
      default: true
    },
    isRinged: {
      type: Boolean,
      default: true
    },
    isRiderRinged: {
      type: Boolean,
      default: true
    },
    instructions: {
      type: String
    },
    searchRadius: {
      type: Number,
      default: 1
    },
    pickedImage: {
      url: String,
      publicId: String
    },
    pickupLocation: {
      type: pointSchema,
      default: { type: 'Point', coordinates: [0, 0] }
    },
    pickupAddress: {
      type: String
    },
    pickupAddressFreeText: {
      type: String
    },
    pickupLabel: {
      type: String
    },
    type: {
      type: String,
      enum: ['restaurant', 'delivery_request'],
      default: 'restaurant'
    },
    mandoobSpecialInstructions: {
      type: String
    },
    riderInteractions: [
      {
        rider: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Rider'
        },
        seenAt: Date,
        openedAt: Date
      }
    ],
    originalDeliveryCharges: {
      type: Number
    },
    originalSubtotal: {
      type: Number
    },
    originalPrice: {
      type: Number
    },
    notifiedUnassigned: {
      type: Boolean,
      default: false
    },
    cancellation: {
      kind: {
        type: String,
        enum: ['User', 'Owner', 'Restaurant']
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'cancellation.kind'
      },
      reason: {
        type: String
      }
    },
    area: {
      type: Schema.Types.ObjectId,
      ref: 'Area'
    }
  },
  { timestamps: true }
)

orderSchema.plugin(mongoosePagination)

orderSchema.pre('save', async function (next) {
  const isOrderStatusUpdated = this.modifiedPaths().includes('orderStatus')
  if (
    isOrderStatusUpdated &&
    this.rider &&
    this.orderStatus === 'DELIVERED' &&
    this.paymentMethod !== payment_method[0]
  ) {
    const earning = new Earning({
      rider: this.rider,
      orderId: this.orderId,
      deliveryFee: this.deliveryCharges,
      minimumDeliveryFee: this.minimumDeliveryFee,
      orderStatus: this.orderStatus,
      paymentMethod: this.paymentMethod,
      deliveryTime: this.deliveredAt
    })
    await earning.save()
    Rider.findOneAndUpdate(
      { _id: this.rider },
      {
        $inc: {
          currentWalletAmount: this.deliveryCharges,
          totalWalletAmount: this.deliveryCharges
        }
      }
    ).catch(err => {
      console.log('catch while updating wallet', err)
    })
  }
})
module.exports = mongoose.model('Order', orderSchema)
