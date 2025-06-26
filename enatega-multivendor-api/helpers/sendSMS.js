const axios = require('axios')

module.exports = {
  async sendSMS({ body }) {
    try {
      const smsUrl = `https://smssmartegypt.com/sms/api/?username=${body.username}&password=${body.password}&sendername=${body.sendername}&mobiles=${body.phone}&message=${body.message}`

      const res = await axios.post(smsUrl)
      console.log(`✅ Fallback SMS sent to ${res.data}`)

      // // Optionally, update the recipient status
      // await Notification.updateOne(
      //   {
      //     _id: notificationDoc._id,
      //     'recipients.phone': failed.phone
      //   },
      //   {
      //     $set: {
      //       'recipients.$.status': 'fallback_sms',
      //       'recipients.$.lastAttempt': new Date()
      //     }
      //   }
      // )
    } catch (error) {
      console.error(`❌ SMS failed for ${failed.phone}`, error)
    }
  }
}
