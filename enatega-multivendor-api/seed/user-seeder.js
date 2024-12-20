// seeders/userSeeder.js
const mongoose = require('mongoose')
const Owner = require('../models/owner')
const bcrypt = require('bcryptjs')
const config = require('../config')

mongoose.connect(config.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async() => {
  console.log('Owner Collecting Seeding with Admin.')
  const MAX_TRIES = 3
  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      // Owner
      const ownerData = {
        email: 'admin@gmail.com',
        password: await bcrypt.hash('123123', 12),
        userType: 'ADMIN'
      }
      const existing = await Owner.findOne({ email: ownerData.email })
      if (existing) break
      const owner = Owner({ ...ownerData })
      await owner.save()

      console.log('User Seeding Completed.')

      mongoose.connection.close()
      break
    } catch (err) {
      console.log(err)
    }
  }

  mongoose.connection.close()
  console.log('Seeding Completed.')
})
