const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const Schema = mongoose.Schema

const ownerSchema = new Schema(
  {
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
  },
  {
    timestamps: true
  }
)

ownerSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
})

module.exports = mongoose.model('Owner', ownerSchema)
