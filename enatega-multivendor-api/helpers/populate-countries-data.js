const fs = require('fs')
const Country = require('../models/country')
const path = require('path')

const hasCountriesInserted = async() => Boolean(await Country.countDocuments())

const populateCountries = async() => {
  // countries data already inserted.
  if (await hasCountriesInserted()) return
  const directoryPath = path.join(__dirname, '../seed/countries+cities.json')
  const rawData = fs.readFileSync(directoryPath)
  const countriesData = JSON.parse(rawData)
  try {
    await Country.insertMany(countriesData)
    console.log('Countries inserted successfully')
  } catch (error) {
    console.error('Error inserting countries into database:', error)
  }
}

module.exports = populateCountries
