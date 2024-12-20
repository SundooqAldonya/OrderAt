const mongoose = require('mongoose')
const Schema = mongoose.Schema

const withdrawRequestSchema = new Schema(
  {
    requestId: {
      type: String
    },
    requestAmount: {
      type: Number,
      required: true
    },
    requestTime: {
      type: Date,
      default: new Date()
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    status: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema)
