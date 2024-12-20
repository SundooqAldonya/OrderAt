const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema(
  {
    message: {
      type: String,
      required: true
    },
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true }
    },
    images: {
      type: [String],
      default: []
    },
    // TODO: markAsRead
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Message', messageSchema)
module.exports.messageSchema = messageSchema
