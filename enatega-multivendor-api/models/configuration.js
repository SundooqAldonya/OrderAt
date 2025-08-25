const mongoose = require('mongoose')

const Schema = mongoose.Schema

const configurationSchema = new Schema(
  {
    email: {
      type: String
    },
    password: {
      type: String
    },
    emailName: {
      type: String
    },
    enableEmail: {
      type: Boolean
    },
    clientId: {
      type: String
    },
    clientSecret: {
      type: String
    },
    sandbox: {
      type: Boolean
    },
    publishableKey: {
      type: String
    },
    secretKey: {
      type: String
    },
    currency: {
      type: String
    },
    currencySymbol: {
      type: String
    },
    deliveryRate: {
      type: Number,
      default: 5
    },
    twilioAccountSid: {
      type: String
    },
    twilioAuthToken: {
      type: String
    },
    twilioPhoneNumber: {
      type: String
    },
    twilioEnabled: {
      type: Boolean
    },
    isActive: {
      type: Boolean,
      default: true
    },
    formEmail: {
      type: String
    },
    sendGridApiKey: {
      type: String
    },
    sendGridEnabled: {
      type: Boolean
    },
    sendGridEmail: {
      type: String
    },
    sendGridEmailName: {
      type: String
    },
    sendGridPassword: {
      type: String
    },
    dashboardSentryUrl: {
      type: String
    },
    webSentryUrl: {
      type: String
    },
    apiSentryUrl: {
      type: String
    },
    customerAppSentryUrl: {
      type: String
    },
    restaurantAppSentryUrl: {
      type: String
    },
    riderAppSentryUrl: {
      type: String
    },
    googleApiKey: {
      type: String
    },
    cloudinaryUploadUrl: {
      type: String
    },
    cloudinaryApiKey: {
      type: String
    },
    webAmplitudeApiKey: {
      type: String
    },
    appAmplitudeApiKey: {
      type: String
    },
    webClientID: {
      type: String
    },
    androidClientID: {
      type: String
    },
    iOSClientID: {
      type: String
    },
    expoClientID: {
      type: String
    },

    googleMapLibraries: {
      type: String
    },
    googleColor: {
      type: String
    },

    termsAndConditions: {
      type: String
    },
    privacyPolicy: {
      type: String
    },
    testOtp: {
      type: String
    },
    firebaseKey: {
      type: String
    },
    authDomain: {
      type: String
    },
    projectId: {
      type: String
    },
    storageBucket: {
      type: String
    },
    msgSenderId: {
      type: String
    },
    appId: {
      type: String
    },
    measurementId: {
      type: String
    },
    isPaidVersion: {
      type: Boolean,
      default: true
    },
    skipMobileVerification: {
      type: Boolean,
      default: true
    },
    skipEmailVerification: {
      type: Boolean,
      default: true
    },
    enableRiderDemo: {
      type: Boolean,
      default: true
    },
    enableRestaurantDemo: {
      type: Boolean,
      default: true
    },
    enableAdminDemo: {
      type: Boolean,
      default: true
    },
    costType: {
      type: String,
      default: ''
    },
    minimumDeliveryFee: {
      type: Number,
      default: 0
    },
    vapidKey: {
      type: String,
      default: ''
    },
    availabilityPeriod: {
      type: Number
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Configuration', configurationSchema)
