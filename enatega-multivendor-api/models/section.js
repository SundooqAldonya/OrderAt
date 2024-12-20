const mongoose = require('mongoose')
const Schema = mongoose.Schema
const offerSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
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
module.exports = mongoose.model('Section', offerSchema)
