const mongoose = require('mongoose')
const Schema = mongoose.Schema

const stockSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    unit: {
      type: String,
      enum: ['piece', 'kg', 'g', 'litre', 'ml'],
      default: 'piece'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    food: {
      type: Schema.Types.ObjectId,
      ref: 'Food',
      default: null
    },
    variation: {
      type: Schema.Types.ObjectId,
      ref: 'Variation',
      default: null
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Stock', stockSchema)
