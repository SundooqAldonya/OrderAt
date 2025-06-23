const { Schema, model } = require('mongoose')
const pagination = require('mongoose-paginate-v2')

const contactUsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    responded: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

contactUsSchema.plugin(pagination)

module.exports = model('ContactUs', contactUsSchema)
