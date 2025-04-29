const { transformOrder } = require('../graphql/resolvers/merge')
const { sendCustomerNotifications } = require('./customerNotifications')
const { sendPushNotification } = require('./findRiders')
const {
  sendNotificationToCustomerWeb
} = require('./firebase-web-notifications')
const { publishOrder, publishToUser, publishToZoneRiders } = require('./pubsub')

const Order = require('../models/order')
const Restaurant = require('../models/restaurant')
const User = require('../models/user')
const { order_status } = require('./enum')

module.exports = {
  async acceptOrder({ orderId, restaurantId, time }) {
    var newDateObj = new Date(Date.now() + (parseInt(time) || 0) * 60000)
    console.log('preparation', newDateObj)

    try {
      const order = await Order.findById(orderId).populate('restaurant')
      const status = order_status[1]
      order.orderStatus = status
      const restaurant = await Restaurant.findById(restaurantId)
      order.preparationTime = newDateObj
      order.completionTime = new Date(
        Date.now() + restaurant.deliveryTime * 60 * 1000
      )
      order.acceptedAt = new Date()
      const result = await order.save()
      const user = await User.findById(result.user)
      const transformedOrder = await transformOrder(result)

      console.log({ transformedOrder })
      if (!transformedOrder.isPickedUp) {
        publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
        await sendPushNotification(order.zone.toString(), order)
      }
      if (user && user.isOrderNotification) {
        sendCustomerNotifications(transformedOrder.user, transformedOrder)
      }
      console.log('restaurant accepted order')
      publishToUser(result.user.toString(), transformedOrder, 'update')
      sendNotificationToCustomerWeb(
        user.notificationTokenWeb,
        `Order status: ${result.orderStatus}`,
        `Order ID ${result.orderId}`
      )
      publishOrder(transformedOrder)
      // sendNotificationToUser(result.user.toString(), transformedOrder)
      return transformedOrder
    } catch (err) {
      console.log('acceptOrder', err)
      throw err
    }
  }
}
