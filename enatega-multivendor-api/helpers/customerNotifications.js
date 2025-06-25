const { getAccessToken } = require('./getGoogleAccessToken')
const admin = require('firebase-admin')
const Notification = require('../models/notification')

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
    console.log('📣 Sending notification to customer app', { customer })

    const newChannelId = 'default_sound4'
    let body

    if (order.orderStatus === 'ACCEPTED') {
      body = `تم الموافقة على طلبك`
    } else if (order.orderStatus === 'ASSIGNED') {
      body =
        order.type === 'delivery_request'
          ? 'السائق في طريقه إليك'
          : `طلبك من ${order.restaurant.name} في طريقه إليك`
    } else if (order.orderStatus === 'PICKED') {
      body = 'طلبك تم استلامه'
    } else if (order.orderStatus === 'DELIVERED') {
      body = 'طلبك تم تسليمه'
    } else if (order.orderStatus === 'CANCELLED') {
      body = 'تم إلغاء طلبك'
    }

    if (!customer?.notificationToken) {
      console.log('🚫 Customer has no notification token.')
      return
    }

    const message = {
      token: customer.notificationToken,
      notification: {
        title:
          order.type !== 'delivery_request'
            ? `طلبك إلى ${order.restaurant.name}`
            : 'طلبك',
        body
      },
      data: {
        channelId: newChannelId,
        message: 'Testing',
        playSound: 'true',
        sound: 'beep1.wav',
        orderId: order._id.toString()
      },
      android: {
        notification: {
          sound: 'beep1',
          channelId: newChannelId
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'beep1.wav'
          }
        }
      }
    }

    const notification = await Notification.create({
      title: message.notification.title,
      body: message.notification.body,
      data: {
        orderId: order.orderId,
        type: 'User'
      },
      recipients: [
        {
          kind: 'User',
          item: customer._id,
          token: customer.notificationToken,
          phone: customer.phone,
          status: 'pending',
          lastAttempt: new Date()
        }
      ],
      createdAt: new Date()
    })

    try {
      const response = await admin.messaging().send(message)
      console.log('✅ Customer push sent:', response)

      // Update recipient status
      await Notification.updateOne(
        { _id: notification._id, 'recipients.item': customer._id },
        {
          $set: {
            'recipients.$.status': 'sent',
            'recipients.$.lastAttempt': new Date()
          }
        }
      )
    } catch (error) {
      console.error('🔥 Error sending push:', error)

      await Notification.updateOne(
        { _id: notification._id, 'recipients.item': customer._id },
        {
          $set: {
            'recipients.$.status': 'failed',
            'recipients.$.lastAttempt': new Date()
          }
        }
      )
    }
  }
  // async sendCustomerNotifications(customer, order) {
  //   console.log('Sending notification to customer app')
  //   const accessToken = await getAccessToken()
  //   const newChannelId = 'default_sound4'
  //   console.log({ customer })
  //   let body

  //   if (order.orderStatus === 'ACCEPTED') {
  //     body = `تم الموافقة على طلبك`
  //   } else if (order.orderStatus === 'ASSIGNED') {
  //     if (order.type && order.type == 'delivery_request') {
  //       body = 'السائق في طريقه إليك'
  //     } else {
  //       body = `طلبك من ${order.restaurant.name} في طريقه إليك`
  //     }
  //   } else if (order.orderStatus === 'PICKED') {
  //     body = 'طلبك تم استلامه'
  //   } else if (order.orderStatus === 'DELIVERED') {
  //     body = 'طلبك تم تسليمه'
  //   }

  //   const messageBody = {
  //     message: {
  //       token: customer?.notificationToken,
  //       notification: {
  //         title:
  //           order.type && order.type !== 'delivery_request'
  //             ? `طلبك إلى ${order.restaurant.name}`
  //             : 'طلبك',
  //         body
  //       },
  //       data: {
  //         channelId: newChannelId,
  //         message: 'Testing',
  //         playSound: 'true',
  //         sound: 'beep1.wav',
  //         orderId: order._id
  //       },
  //       android: {
  //         notification: {
  //           sound: 'beep1',
  //           channelId: newChannelId
  //         }
  //       }
  //     }
  //   }

  //   const projectId = 'food-delivery-api-ab4e4'

  //   try {
  //     const response = await fetch(
  //       `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           Accept: 'application/json',
  //           'Accept-encoding': 'gzip, deflate',
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${accessToken}` // 🔴 Replace with your actual Firebase server key
  //         },
  //         body: JSON.stringify(messageBody)
  //       }
  //     )

  //     const data = await response.json()
  //     console.log('Customer FCM push notification sent:', data)
  //   } catch (error) {
  //     console.error('Error sending Expo push notification:', error)
  //   }
  // }
}

module.exports = notifications
