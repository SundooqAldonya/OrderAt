var admin = require('firebase-admin')

var serviceAccount = require('../serviceAccountKey.json')

const firebaseWebApp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount)
  },
  'firebase-web-notifications'
)

function sendNotificationToCustomerWeb(token, title, body) {
  if (!token) return
  const message = {
    notification: {
      title,
      body
    },
    token
  }
  admin
    .messaging(firebaseWebApp)
    .send(message)
    .then(response => {
      console.log('response', response)
    })
    .catch(error => {
      console.log('error', error)
    })
}
module.exports.sendNotificationToCustomerWeb = sendNotificationToCustomerWeb
