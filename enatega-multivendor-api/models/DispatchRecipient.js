const mongoose = require('mongoose')
const { Schema } = mongoose

const dispatchRecipientSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider', required: true },
    cycle: { type: Number, default: 1 }, // cycle this rider was notified in
    status: {
      type: String,
      enum: ['pending', 'sent', 'accepted', 'rejected', 'timeout', 'failed'],
      default: 'pending'
    },
    notifiedAt: { type: Date },
    respondedAt: { type: Date },
    notification: { type: Schema.Types.ObjectId, ref: 'Notification' }
  },
  { timestamps: true }
)

dispatchRecipientSchema.index({ rider: 1, order: 1 }, { unique: true })

module.exports = mongoose.model('DispatchRecipient', dispatchRecipientSchema)
