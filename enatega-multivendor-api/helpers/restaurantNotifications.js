const { getAccessToken } = require('./getGoogleAccessToken')

const notifications = {
  async sendRestaurantNotifications(restaurant) {
    const accessToken = await getAccessToken()
    console.log({ accessToken })
    const messageBody = {
      message: {
        token: restaurant.notificationToken,
        notification: {
          title: `طلب جديد`,
          body: `طلب جديد`
        },
        data: {
          channelId: 'default',
          message: 'Testing',
          playSound: 'true',
          sound: restaurant.enableNotification ? 'false' : 'beep3.wav'
        },
        android: {
          notification: {
            sound: restaurant.enableNotification ? 'false' : 'beep3',
            channelId: 'default'
          }
        }
      }
    }

    const projectId = 'food-delivery-api-ab4e4'

    try {
      if (
        restaurant.isAvailable &&
        restaurant.isActive &&
        restaurant.notificationToken &&
        restaurant.enableNotification
      ) {
        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}` // 🔴 Replace with your actual Firebase server key
            },
            body: JSON.stringify(messageBody)
          }
        )

        const data = await response.json()
        console.log('FCM push notification sent:', data)
      }
    } catch (error) {
      console.error('Error sending Expo push notification:', error)
    }
  }
}

module.exports = notifications
