const Rider = require('../models/rider')
const Order = require('../models/order')
const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

module.exports = {
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
          await sendPushNotification(rider.notificationToken, order)
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
    const riders = await Rider.find({ zone: zoneId })
    console.log({ rider: riders[0].notificationToken })
    // riders.forEach(async rider => {
    const message = {
      to: riders[0].notificationToken,
      sound: 'default',
      title: `New Order ${order.orderId}`,
      body: order.searchRadius
        ? `New order available ${order.searchRadius} KM`
        : 'New order available',
      data: { orderId: order.orderId }
    }

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const data = await response.json()
      console.log('Expo push notification sent:', data)
    } catch (error) {
      console.error('Error sending Expo push notification:', error)
    }
    // })
  }
}

const sendPushNotification = async (zoneId, expoPushToken, order) => {
  const riders = await Rider.find({ zone: zoneId })
  riders.forEach(async rider => {
    const message = {
      to: rider.notificationToken,
      sound: 'default',
      title: `New Order ${order.orderId}`,
      body: order.searchRadius
        ? `${order.searchRadius} KM`
        : 'New order available',
      data: { orderId: order.orderId }
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const data = await response.json()
      console.log('Expo push notification sent:', data)
    } catch (error) {
      console.error('Error sending Expo push notification:', error)
    }
  })
}

// Run this job every 3 minutes
// setInterval(expandSearchRadius, 3 * 60 * 1000)
