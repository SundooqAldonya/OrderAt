const mongoose = require('mongoose')

const Schema = mongoose.Schema
const taxationSchema = new Schema(
  {
    taxationCharges: {
      type: Number,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Taxation', taxationSchema))
myModule.taxationSchema = taxationSchema
