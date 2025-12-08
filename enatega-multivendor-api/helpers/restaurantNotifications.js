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
  },

  async notifyRestaurantOnApproval(order) {
    try {
      // Populate once if needed
      await order.populate([
        { path: 'restaurant', select: 'name notificationToken' },
        { path: 'user', select: 'name phone' }
      ])

      const restaurant = order.restaurant
      if (!restaurant) {
        console.warn('⚠️ No restaurant found for order', order._id)
        return
      }

      const payload = {
        type: 'ORDER_EDIT_APPROVED',
        orderId: order._id.toString(),
        orderNumber: order.orderId,
        approvedAt: new Date().toISOString(),
        finalAmount: order.orderAmount,
        customer: {
          name: order.user?.name,
          phone: order.user?.phone
        }
      }

      /**
       * ✅ 1) Save notification record (for dashboard / audit)
       */
      await Notification.create({
        title: 'تمت الموافقة على تعديل الطلب',
        body: `وافق العميل على التعديلات الخاصة بالطلب ${order.orderId}`,
        data: payload,
        recipients: [
          {
            kind: 'Restaurant',
            item: restaurant._id,
            token: restaurant.notificationToken || null,
            status: 'pending',
            lastAttempt: new Date()
          }
        ],
        createdAt: new Date()
      })

      /**
       * ✅ 2) Push notification (if token exists)
       */
      if (restaurant.notificationToken) {
        const message = {
          token: restaurant.notificationToken,
          notification: {
            title: 'تمت الموافقة على الطلب',
            body: `وافق العميل على التعديلات في الطلب ${order.orderId}`
          },
          data: {
            type: payload.type,
            orderId: payload.orderId
          }
        }

        await admin.messaging().send(message)
      }

      /**
       * ✅ 3) Future hooks (NO-OP for now)
       */
      // emitSocketEvent(restaurant._id, payload)
      // sendDashboardBadge(restaurant._id)

      console.log(`✅ Restaurant notified: order ${order.orderId} approved`)
    } catch (error) {
      // Important: never break order approval if notification fails
      console.error('🔥 Failed to notify restaurant on approval', error)
    }
  },

  async notifyRestaurantOnRejection(order) {
    try {
      // Ensure we have restaurant info
      await order.populate([
        { path: 'restaurant', select: 'name notificationToken' },
        { path: 'user', select: 'name phone' }
      ])

      const restaurant = order.restaurant
      if (!restaurant) return

      const payload = {
        type: 'ORDER_EDIT_REJECTED',
        orderId: order._id.toString(),
        orderNumber: order.orderId,
        rejectedAt: new Date().toISOString(),
        reason: order.businessEdits?.rejectReason || null,
        customer: {
          name: order.user?.name,
          phone: order.user?.phone
        }
      }

      // ✅ Save notification (dashboard / audit)
      await Notification.create({
        title: 'تم رفض تعديل الطلب',
        body: `قام العميل برفض التعديلات على الطلب ${order.orderId}`,
        data: payload,
        recipients: [
          {
            kind: 'Restaurant',
            item: restaurant._id,
            token: restaurant.notificationToken || null,
            status: 'pending',
            lastAttempt: new Date()
          }
        ],
        createdAt: new Date()
      })

      // ✅ Push notification (if token exists)
      if (restaurant.notificationToken) {
        const message = {
          token: restaurant.notificationToken,
          notification: {
            title: 'تم رفض التعديلات',
            body: `العميل لم يوافق على تعديلات الطلب ${order.orderId}`
          },
          data: {
            type: payload.type,
            orderId: payload.orderId
          }
        }

        await admin.messaging().send(message)
      }

      // ✅ Future hooks (NO-OP for now)
      // emitRestaurantSocketEvent(restaurant._id, payload)

      console.log(
        `✅ Restaurant notified: edits rejected for order ${order.orderId}`
      )
    } catch (err) {
      // ❗ Never break main flow
      console.error('🔥 Failed to notify restaurant on rejection', err)
    }
  }
}

module.exports = notifications
