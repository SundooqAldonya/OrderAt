const { Schema, model } = require('mongoose')

const citySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = model('City', citySchema)
