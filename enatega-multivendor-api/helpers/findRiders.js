const Rider = require('../models/rider')
const Order = require('../models/order')
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
    console.log({ zoneId })
    const accessToken = await getAccessToken()
    console.log({ accessToken })
    const riders = await Rider.find({ zone: zoneId })
    console.log({ riderNotification: riders[0].notificationToken })
    const messageBody = {
      message: {
        token: riders[0].notificationToken, // Ensure this is a valid FCM token
        notification: {
          title: `New Order ${order.orderId}`,
          body: order.searchRadius
            ? `New order available ${order.searchRadius} KM`
            : 'New order available'
        },
        data: {
          channelId: 'default', // For Android channel support
          message: 'Testing',
          playSound: 'true',
          sound: riders[0].muted ? 'false' : 'beep1.wav'
        },
        android: {
          notification: {
            sound: riders[0].muted ? 'false' : 'beep1',
            channelId: 'default'
          }
        }
      }
    }

    const projectId = 'food-delivery-api-ab4e4'

    try {
      if (riders[0].available && riders[0].isActive) {
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

// Run this job every 3 minutes
// setInterval(expandSearchRadius, 3 * 60 * 1000)

module.exports = findRiders
