const { Schema, model } = require('mongoose')

const areaSchema = new Schema(
  {
    title: {
      type: String
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City'
    }
  },
  {
    timestamps: true
  }
)

module.exports = model('Area', areaSchema)
