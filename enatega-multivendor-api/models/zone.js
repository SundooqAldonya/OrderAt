const mongoose = require('mongoose')

const Schema = mongoose.Schema

const polygonSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers
    required: true
  }
})

const zoneSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    location: polygonSchema,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Zone', zoneSchema)
module.exports.polygonSchema = polygonSchema
