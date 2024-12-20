const mongoose = require('mongoose')
const Schema = mongoose.Schema
const offerSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      required: true
    },
    restaurants: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },

  { timestamps: true }
)
module.exports = mongoose.model('Offer', offerSchema)
