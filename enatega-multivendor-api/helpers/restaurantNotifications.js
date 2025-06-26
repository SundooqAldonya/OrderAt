const { getAccessToken } = require('./getGoogleAccessToken')
const Notification = require('../models/notification')
const admin = require('firebase-admin')

const notifications = {
  async sendRestaurantNotifications(restaurant, order) {
    console.log('📣 Sending notification to business app', { restaurant })
    const newChannelId = 'default_sound4'
    const title = 'طلب جديد'
    const body = 'طلب جديد'

    // Save notification
    const notification = await Notification.create({
      title,
      body,
      data: {
        orderId: order.orderId,
        type: 'Restaurant'
      },
      recipients: [
        {
          kind: 'Restaurant',
          item: restaurant._id,
          token: restaurant.notificationToken,
          phone: restaurant.phone,
          status: 'pending',
          lastAttempt: new Date()
        }
      ],
      createdAt: new Date()
    })

    const message = {
      token: restaurant.notificationToken,
      notification: {
        title,
        body
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
      },
      data: {
        channelId: newChannelId,
        message: 'Testing',
        playSound: 'true',
        sound: 'beep1.wav',
        orderId: order._id.toString(),
        notificationId: notification._id.toString()
      }
    }

    try {
      if (
        restaurant.isAvailable &&
        restaurant.isActive &&
        restaurant.notificationToken &&
        restaurant.enableNotification
      ) {
        const response = await admin.messaging().send(message)
        console.log('✅ FCM notification sent to business:', response)

        await Notification.updateOne(
          { _id: notification._id, 'recipients.item': restaurant._id },
          {
            $set: {
              'recipients.$.status': 'sent',
              'recipients.$.lastAttempt': new Date()
            }
          }
        )
      } else {
        console.warn('🚫 Restaurant does not meet notification conditions:', {
          token: restaurant.notificationToken,
          isAvailable: restaurant.isAvailable,
          isActive: restaurant.isActive,
          enableNotification: restaurant.enableNotification
        })
      }
    } catch (error) {
      console.error('🔥 Failed to send restaurant notification:', error)

      await Notification.updateOne(
        { _id: notification._id, 'recipients.item': restaurant._id },
        {
          $set: {
            'recipients.$.status': 'failed',
            'recipients.$.lastAttempt': new Date()
          }
        }
      )
    }
    //   const accessToken = await getAccessToken()
    //   const newChannelId = 'default_sound4'
    //   console.log({ accessToken })
    //   const messageBody = {
    //     message: {
    //       token: restaurant.notificationToken,
    //       notification: {
    //         title: `طلب جديد`,
    //         body: `طلب جديد`
    //       },
    //       data: {
    //         channelId: newChannelId,
    //         message: 'Testing',
    //         playSound: 'true',
    //         sound: 'beep1.wav',
    //         details: JSON.stringify(order)
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
    //     if (
    //       restaurant.isAvailable &&
    //       restaurant.isActive &&
    //       restaurant.notificationToken &&
    //       restaurant.enableNotification
    //     ) {
    //       const response = await fetch(
    //         `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    //         {
    //           method: 'POST',
    //           headers: {
    //             Accept: 'application/json',
    //             'Accept-encoding': 'gzip, deflate',
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${accessToken}` // 🔴 Replace with your actual Firebase server key
    //           },
    //           body: JSON.stringify(messageBody)
    //         }
    //       )

    //       const data = await response.json()
    //       console.log('FCM push notification sent:', data)
    //     }
    //   } catch (error) {
    //     console.error('Error sending Expo push notification:', error)
    //   }
  }
}

module.exports = notifications
