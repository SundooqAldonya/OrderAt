const Rider = require('../models/rider')
const Order = require('../models/order')
const Notification = require('../models/notification')
const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')
const { getAccessToken } = require('./getGoogleAccessToken')
const axios = require('axios')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const findRiders = {
  async findOrdersWithinRadius(rider, radius) {
    return Order.find({
      orderStatus: 'ACCEPTED',
      rider: null
    })
      .populate('restaurant')
      .then(orders =>
        orders.filter(order => {
          if (!order.restaurant || !order.restaurant.location) return false

          return Rider.findOne({
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: order.restaurant.location.coordinates
                },
                $maxDistance: radius * 1000
              }
            },
            available: true
          })
        })
      )
  },

  async expandSearchRadius() {
    console.log('Expanding search radius for unassigned orders...')

    const orders = await Order.find({
      orderStatus: 'ACCEPTED',
      rider: null
    }).populate('restaurant')

    for (const order of orders) {
      if (!order.restaurant || !order.restaurant.location) continue

      const restaurantLocation = order.restaurant.location
      const currentRadius = order.searchRadius || 1 // Default to 1 km
      const newRadius = currentRadius < 10 ? currentRadius + 2 : currentRadius // Increase radius

      // Find available riders within new radius
      const riders = await Rider.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: restaurantLocation.coordinates
            },
            $maxDistance: newRadius * 1000 // Convert km to meters
          }
        },
        available: true,
        isActive: true
      })

      if (riders.length) {
        console.log(
          `Found ${riders.length} riders within ${newRadius} km for order ${order._id}`
        )
        riders.forEach(async rider => {
          await this.sendPushNotification(rider.notificationToken, order)
        })
      }

      order.searchRadius = newRadius
      await order.save()
    }
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = deg => (deg * Math.PI) / 180
    const R = 6371 // Earth radius in km

    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in km
  },

  async sendPushNotification(zoneId, order) {
    const riders = await Rider.find({
      zone: zoneId,
      available: true,
      isActive: true,
      notificationToken: { $ne: null }
    })

    const recipients = riders.map(rider => ({
      kind: 'Rider',
      item: rider._id,
      token: rider.notificationToken,
      phone: rider.phone,
      status: 'pending'
    }))

    if (recipients.length === 0) {
      console.log('🚫 No valid FCM tokens found.')
      return
    }

    const title = 'طلب جديد'
    const body =
      order.type === 'delivery_request'
        ? `طلب جديد من ${order.user.name}`
        : `طلب جديد من ${order.restaurant.name}`

    // Store notification in DB
    const notificationDoc = await Notification.create({
      title,
      body,
      data: {
        orderId: order._id.toString(),
        type: order.type
      },
      recipients,
      createdAt: new Date()
    })

    // const tokens = riders.map(rider => rider.notificationToken)
    // console.log({ tokens })

    // if (tokens.length === 0) {
    //   console.log('🚫 No valid FCM tokens found.')
    //   return
    // }
    const tokens = recipients.map(r => r.token)

    const message = {
      notification: {
        title,
        body
      },
      android: {
        notification: {
          sound: 'beep3',
          channelId: 'default'
        }
      },
      data: {
        channelId: 'default',
        message: 'Testing',
        playSound: 'true',
        notificationId: notificationDoc._id.toString()
      },
      tokens
    }

    try {
      const response = await admin.messaging().sendEachForMulticast(message)
      console.log(`✅ ${response.successCount} messages sent successfully.`)
      const updates = recipients.map((r, i) => {
        const res = response.responses[i]
        const status = res.success ? 'sent' : 'failed'
        return {
          updateOne: {
            filter: {
              _id: notificationDoc._id,
              'recipients.item': r.item
            },
            update: {
              $set: {
                'recipients.$.status': status,
                'recipients.$.lastAttempt': new Date()
              }
            }
          }
        }
      })
      await Notification.bulkWrite(updates)
      let failedTokens = []
      // Log failed tokens if needed
      response.responses.forEach((res, i) => {
        if (!res.success) {
          console.warn(
            `❌ Token for ${recipients[i].item}: ${res.error.message}`
          )
          const failedRecipient = riders[i]
          if (failedRecipient?.phone) {
            failedTokens.push({
              phone: failedRecipient.phone,
              name: failedRecipient.name,
              token: tokens[i]
            })
          }
        }
      })
      // if (failedTokens.length) {
      //   for (const failed of failedTokens) {
      //     try {
      //       const body = {
      //         username: 'w8pRT869',
      //         password: 'Oqo48lklp',
      //         sendername: 'Kayan',
      //         message: `تنبيه: لديك طلب جديد على Orderat`
      //       }
      //       const smsUrl = `https://smssmartegypt.com/sms/api/?username=${body.username}&password=${body.password}&sendername=${body.sendername}&mobiles=${failed.phone}&message=${body.message}`

      //       await axios.post(smsUrl)
      //       console.log(`✅ Fallback SMS sent to ${failed.phone}`)

      //       // Optionally, update the recipient status
      //       await Notification.updateOne(
      //         {
      //           _id: notificationDoc._id,
      //           'recipients.phone': failed.phone
      //         },
      //         {
      //           $set: {
      //             'recipients.$.status': 'fallback_sms',
      //             'recipients.$.lastAttempt': new Date()
      //           }
      //         }
      //       )
      //     } catch (error) {
      //       console.error(`❌ SMS failed for ${failed.phone}`, error)
      //     }
      //   }
      // }
      // if (response.failureCount > 0) {
      //   console.warn(`⚠️ ${response.failureCount} messages failed to send.`)
      //   response.responses.forEach((resp, idx) => {
      //     if (!resp.success) {
      //       console.error(
      //         `❌ Token ${tokens[idx]} failed: ${resp.error.message}`
      //       )
      //     }
      //   })
      // }
    } catch (error) {
      console.error('🔥 Error sending push notifications:', error)
    }
  }
}

// Run this job every 3 minutes
// setInterval(expandSearchRadius, 3 * 60 * 1000)

module.exports = findRiders
