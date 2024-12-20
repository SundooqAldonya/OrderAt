// seeders/userSeeder.js
const mongoose = require('mongoose')
const Configuration = require('../models/configuration')
const config = require('../config')

mongoose.connect(config.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async() => {
  console.log('Configuration Collection Seeding...')
  const MAX_TRIES = 3
  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      const existingConfiguration = await Configuration.findOne()
      if (existingConfiguration) break

      const newConfiguration = new Configuration()
      newConfiguration.isPaidVersion = true
      const result = await newConfiguration.save()

      console.log({ result: result })

      console.log('Configuration Seeding Completed.')

      mongoose.connection.close()
      break
    } catch (err) {
      console.log(err)
    }
  }

  mongoose.connection.close()
  console.log('Configration Seeding Completed.')
})
