const { Schema, model } = require('mongoose')

const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    businessName: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = model('Business', businessSchema)
