const mongoose = require('mongoose')

const citySchema = new mongoose.Schema({
  id: Number,
  name: String,
  latitude: String,
  longitude: String
})

const countrySchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    index: true // Adding an index to the 'name' field
  },
  latitude: String,
  longitude: String,
  iso2: String,
  cities: [citySchema]
})

const Country = mongoose.model('Country', countrySchema)

module.exports = Country
