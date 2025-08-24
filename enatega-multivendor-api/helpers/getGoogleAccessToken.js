const { GoogleAuth } = require('google-auth-library')
const path = require('path')
const fs = require('fs')

const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  '../serviceAccountKey.json'
)

async function getAccessToken() {
  try {
    console.log('🔍 Checking service account file...')

    const keyFileContent = JSON.parse(
      fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8')
    )

    // Ensure correct private key formatting
    if (keyFileContent.private_key.includes('\\n')) {
      keyFileContent.private_key = keyFileContent.private_key.replace(
        /\\n/g,
        '\n'
      )
    }

    const auth = new GoogleAuth({
      credentials: keyFileContent,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    })

    console.log('🚀 Requesting access token...')
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    // console.log('✅ Google Access Token:', accessToken.token)

    return accessToken.token
  } catch (error) {
    console.error('🚨 Error getting Google Access Token:', error)
    throw error
  }
}

// Test the function
getAccessToken()
  .then(token => {
    console.log('🎉 Token received successfully!')
    console.log('Waiting for database connection...')
  })
  .catch(err => console.error('❌ Failed to get token:', err))

module.exports = { getAccessToken }
