const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const Schema = mongoose.Schema

const ownerSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      require: true
    },
    phone: {
      type: String,
      require: true
    },
    password: {
      type: String
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
  },
  {
    timestamps: true
  }
)

ownerSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
})

module.exports = mongoose.model('Owner', ownerSchema)
