const { Schema, model } = require('mongoose')
const pagination = require('mongoose-paginate-v2')

const notificationSchema = new Schema({
  title: String,
  body: String,
  data: Schema.Types.Mixed,
  recipients: [
    {
      kind: { type: String, enum: ['User', 'Rider', 'Restaurant'] },
      item: {
        type: Schema.Types.ObjectId,
        refPath: 'recipients.kind'
      },
      token: String,
      phone: String,
      status: {
        type: String,
        enum: [
          'pending',
          'sent',
          'acknowledged',
          'failed',
          'fallback_sms',
          'fallback_socket'
        ],
        default: 'pending'
      },
      lastAttempt: Date
    }
  ],
  createdAt: Date,
  sentAt: Date,
  acknowledgedAt: Date
})

notificationSchema.plugin(pagination)

module.exports = model('Notification', notificationSchema)
