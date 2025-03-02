const { Schema, model } = require('mongoose')

const citySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

module.exports = model('City', citySchema)
