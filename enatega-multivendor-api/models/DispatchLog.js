const mongoose = require('mongoose')
const { Schema } = mongoose

const dispatchLogSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    currentCycle: { type: Number, default: 1 },
    maxCycles: { type: Number, default: 3 },
    status: {
      type: String,
      enum: ['in_progress', 'assigned', 'expired', 'failed'],
      default: 'in_progress'
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DispatchRecipient'
      }
    ],
    assignedRider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    completedAt: { type: Date }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('DispatchLog', dispatchLogSchema)
