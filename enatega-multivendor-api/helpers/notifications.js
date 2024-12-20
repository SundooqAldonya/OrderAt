const { Expo } = require('expo-server-sdk')
const User = require('../models/user')
const Rider = require('../models/rider')
const Restaurant = require('../models/restaurant')
const { sendNotificationMobile } = require('./utilities')

const sendNotificationToUser = async(
  userId,
  order,
  message,
  type = 'order'
) => {
  try {
    const user = await User.findById(userId)
    if (user.notificationToken && user.isOrderNotification) {
      const messages = []
      if (Expo.isExpoPushToken(user.notificationToken)) {
        messages.push({
          to: user.notificationToken,
          sound: 'default',
          body:
            message || 'Order-ID ' + order.orderId + ' ' + order.orderStatus,
          channelId: 'default',
          data: {
            type,
            _id: order._id,
            order: order.orderId,
            status: order.orderStatus
          }
        })
        sendNotificationMobile(messages)
      }
    }
  } catch (error) {
    console.log('error: ', error.message)
  }
}

const sendNotificationToZoneRiders = async(zoneId, order, type = 'order') => {
  const riders = await Rider.find({ zone: zoneId })
  const messages = []
  riders.map(rider => {
    if (rider.notificationToken) {
      if (Expo.isExpoPushToken(rider.notificationToken)) {
        if (rider.isActive === true) {
          messages.push({
            to: rider.notificationToken, // pass array of notificationToken here
            sound: 'default',
            body: 'Order-ID ' + order.orderId + ' ' + order.orderStatus,
            channelId: 'default',
            data: {
              type,
              _id: order._id,
              order: order.orderId,
              status: order.orderStatus
            }
          })
        }
      }
    }
  })
  if (messages.length > 0) sendNotificationMobile(messages)
}

const sendNotificationToRider = async(
  riderId,
  order,
  message,
  type = 'order'
) => {
  try {
    const rider = await Rider.findById(riderId)
    if (rider.notificationToken) {
      const messages = []
      if (Expo.isExpoPushToken(rider.notificationToken)) {
        messages.push({
          to: rider.notificationToken,
          sound: 'default',
          body:
            message || 'Order-ID ' + order.orderId + ' ' + order.orderStatus,
          channelId: 'default',
          data: {
            type,
            _id: order._id,
            order: order.orderId,
            status: order.orderStatus
          }
        })
        sendNotificationMobile(messages)
      }
    }
  } catch (error) {
    console.log('error: ', error.message)
  }
}

const sendNotificationToRestaurant = async(
  restaurantId,
  order,
  type = 'order'
) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId)
    if (restaurant.notificationToken && restaurant.enableNotification) {
      const messages = []
      if (Expo.isExpoPushToken(restaurant.notificationToken)) {
        messages.push({
          to: restaurant.notificationToken,
          sound: 'default',
          body: 'Order-ID ' + order.orderId + ' ' + order.orderStatus,
          channelId: 'default',
          data: {
            type,
            _id: order._id,
            order: order.orderId,
            status: order.orderStatus
          }
        })
        sendNotificationMobile(messages)
      }
    }
  } catch (error) {
    console.log('error: ', error.message)
  }
}
exports.sendNotificationToUser = sendNotificationToUser
exports.sendNotificationToZoneRiders = sendNotificationToZoneRiders
exports.sendNotificationToRider = sendNotificationToRider
exports.sendNotificationToRestaurant = sendNotificationToRestaurant
