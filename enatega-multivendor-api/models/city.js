const { Schema, model } = require('mongoose')

const citySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    isActive: { type: Boolean, default: true },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    }
  },
  { timestamps: true }
)

module.exports = model('City', citySchema)
