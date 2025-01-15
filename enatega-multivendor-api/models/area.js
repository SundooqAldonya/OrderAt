const { Schema, model } = require('mongoose')

const areaSchema = new Schema(
  {
    title: {
      type: String
    },
    address: {
      type: String
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City'
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    }
  },
  {
    timestamps: true
  }
)

module.exports = model('Area', areaSchema)
