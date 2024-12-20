const twilio = require('twilio')
const Configuration = require('../models/configuration')

let isInitialized = false
let client
let twilioConfig

const initializeTwilio = async() => {
  try {
    twilioConfig = await Configuration.findOne()

    if (!twilioConfig) {
      console.error('Twilio configuration not found.')
      return
    }

    client = twilio(twilioConfig.twilioAccountSid, twilioConfig.twilioAuthToken)
    isInitialized = true
  } catch (error) {
    console.error('Error initializing Twilio:', error)
  }
}

const sendOtpToPhone = async(to, body) => {
  try {
    if (!to) {
      return
    }

    await initializeTwilio()

    if (!isInitialized) {
      return
    }

    const options = {
      from: twilioConfig.twilioPhoneNumber,
      to,
      body
    }

    client.messages.create(options, (error, res) => {
      if (error) {
        console.error('Error:', error)
      } else {
        console.log('Message has been Sent', res.to)
      }
    })
  } catch (err) {
    console.error('Error:', err)
  }
}

module.exports = { sendOtpToPhone }
