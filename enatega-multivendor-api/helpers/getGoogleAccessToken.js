const { google } = require('google-auth-library')
const path = require('path')

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../serviceAccountKey.json')

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

async function getAccessToken() {
  try {
    const key = require(SERVICE_ACCOUNT_PATH)

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES
    )

    const tokens = await jwtClient.authorize()
    return tokens.access_token // Returns the access token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

module.exports = { getAccessToken }
