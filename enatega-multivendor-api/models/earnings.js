const mongoose = require('mongoose')
const Schema = mongoose.Schema

const earningsSchema = new Schema(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    orderId: {
      type: String
    },
    deliveryFee: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    orderStatus: {
      type: String
    },
    paymentMethod: {
      type: String
    },
    deliveryTime: {
      type: Date,
      default: new Date()
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Earnings', earningsSchema)
