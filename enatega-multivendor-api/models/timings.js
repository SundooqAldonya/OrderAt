const mongoose = require('mongoose')

const { days } = require('../helpers/enum')

const Schema = mongoose.Schema

const timingsSchema = new Schema({
  day: { type: String, enum: days },
  times: [{ startTime: [], endTime: [] }] // startTime:[hh,mm] endTime:[hh,mm]
})

const myModule = (module.exports = mongoose.model('Timings', timingsSchema))
myModule.timingsSchema = timingsSchema
