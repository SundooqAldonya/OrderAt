const { getAccessToken } = require('./getGoogleAccessToken')
const admin = require('firebase-admin')

const notifications = {
  async sendNotificationCampaign(order) {
    const message = {
      notification: {
        title: `طلبك إلى ${order.restaurant.name}`,
        body:
          order.orderStatus === 'ACCEPTED'
            ? `تم الموافقة على طلبك`
            : `طلبك من ${order.restaurant.name} في طريقه إليك`
      },
      data: {
        channelId: newChannelId,
        message: 'Testing',
        playSound: 'true',
        sound: 'beep1.wav',
        orderId: order._id
      },
      android: {
        notification: {
          sound: 'beep1',
          channelId: newChannelId
        }
      }
    }

    const tokens = [customer1.notificationToken, customer2.notificationToken]

    admin
      .messaging()
      .sendMulticast({ ...message, tokens })
      .then(response => {
        console.log(`${response.successCount} messages were sent successfully`)
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`Failed to send to ${tokens[idx]}:`, resp.error)
            }
          })
        }
      })
      .catch(error => {
        console.error('Error sending multicast message:', error)
      })
  },
  async sendCustomerNotifications(customer, order) {
    console.log('Sending notification to customer app')
    const accessToken = await getAccessToken()
    const newChannelId = 'default_sound4'
    console.log({ customer })
    const messageBody = {
      message: {
        token: customer?.notificationToken,
        notification: {
          title: `طلبك إلى ${order.restaurant.name}`,
          body:
            order.orderStatus === 'ACCEPTED'
              ? `تم الموافقة على طلبك`
              : `طلبك من ${order.restaurant.name} في طريقه إليك`
        },
        data: {
          channelId: newChannelId,
          message: 'Testing',
          playSound: 'true',
          sound: 'beep1.wav',
          orderId: order._id
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
      console.log('Customer FCM push notification sent:', data)
    } catch (error) {
      console.error('Error sending Expo push notification:', error)
    }
  }
}

module.exports = notifications
