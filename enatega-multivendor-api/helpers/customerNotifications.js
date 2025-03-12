const { getAccessToken } = require('./getGoogleAccessToken')

const notifications = {
  async sendCustomerNotifications(customer, order) {
    const accessToken = await getAccessToken()
    const newChannelId = 'default_sound4'
    console.log({ accessToken })
    const messageBody = {
      message: {
        token: customer?.notificationToken,
        notification: {
          title: `طلب إلى ${customer.name}`,
          body:
            order.orderStatus === 'ACCEPTED'
              ? `الطلب ${order.orderId} من ${order.restaurant.name} ليتم توصيله إليك، تحقق من الحالة`
              : `طلبك من ${order.restaurant.name} في طريقه إليك`
        },
        data: {
          channelId: newChannelId,
          message: 'Testing',
          playSound: 'true',
          sound: 'beep1.wav',
          details: JSON.stringify(order)
        },
        android: {
          notification: {
            sound: 'beep1',
            channelId: newChannelId
          }
        }
      }
    }

    const projectId = 'food-delivery-api-ab4e4'

    try {
      if (
        customer?.isAvailable &&
        customer?.isActive &&
        customer?.notificationToken &&
        customer?.enableNotification
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
