const mongoose = require('mongoose')
const { Schema } = mongoose

const businessCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    image: {
      url: String,
      publicId: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('BusinessCategory', businessCategorySchema)
