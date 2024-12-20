const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ownerSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  ],
  userType: {
    type: String,
    required: true
  },
  pushToken: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

module.exports = mongoose.model('Owner', ownerSchema)
