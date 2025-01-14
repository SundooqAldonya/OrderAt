const { Schema, model } = require('mongoose')

const locationSchema = new Schema({
  name: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  }
})

locationSchema.index({ location: '2dsphere' })

module.exports = model('Location', locationSchema)
