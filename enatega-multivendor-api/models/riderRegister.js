const { Schema, model } = require('mongoose')

const riderRegisterSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    city: {
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

module.exports = model('RiderRegister', riderRegisterSchema)
