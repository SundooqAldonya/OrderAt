const mongoose = require('mongoose')
const { pointSchema } = require('./point')

const Schema = mongoose.Schema

const riderSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      default: '123'
    },
    phone: {
      type: String,
      default: '',
      required: false
    },
    location: {
      type: pointSchema
    },
    available: {
      type: Boolean,
      default: false
    },
    assigned: [String],
    // delivered: [String],
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    notificationToken: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    accountNumber: {
      type: String
    },
    currentWalletAmount: { type: Number, default: 0 },
    totalWalletAmount: { type: Number, default: 0 },
    withdrawnWalletAmount: { type: Number, default: 0 },
    isOnline: {
      type: Boolean,
      default: false
    },
    startAvailabilityDate: {
      type: Date
    },
    endAvailabilityDate: {
      type: Date
    },
    lastUpdatedLocationDate: {
      type: Date
    },
    token: {
      type: String
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City'
    },
    profileImage: {
      url: String,
      publicId: String
    },
    nationalIdImage: {
      url: String,
      publicId: String
    },
    lastOrderAt: {
      type: Date,
      default: null // updated whenever rider is assigned an order
    },
    lastActiveAt: {
      type: Date,
      default: null // updated whenever rider is assigned an order
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Rider', riderSchema)
