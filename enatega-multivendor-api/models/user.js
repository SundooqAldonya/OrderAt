const mongoose = require('mongoose')

const { addressSchema } = require('./address')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    governate:{
      type: String,
    },
    address_free_text:{
      type : String
    },
    emailIsVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      default: ''
    },
    phoneIsVerified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      default: ''
    },
    appleId: { type: String },
    userType: { type: String },
    isActive: {
      type: Boolean,
      default: true
    },
    notificationToken: {
      type: String
    },
    notificationTokenWeb: {
      type: String
    },
    isOrderNotification: {
      type: Boolean,
      default: false
    },
    isOfferNotification: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: [],
      default: []
    },
    addresses: [
      {
        type: addressSchema,
        default: []
      }
    ],
    favourite: [
      {
        type: String,
        default: []
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
