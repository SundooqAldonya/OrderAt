const { transformOrder } = require('../graphql/resolvers/merge')
const Order = require('../models/order')
const dispatchQueue = require('../queues/dispatchRiderQueue')
const { sendCustomerNotifications } = require('./customerNotifications')
const { order_status } = require('./enum')
const { sendPushNotification } = require('./findRiders')
const {
  sendNotificationToCustomerWeb
} = require('./firebase-web-notifications')
const { publishToZoneRiders, publishToUser, publishOrder } = require('./pubsub')

module.exports = {
  async acceptOrderHandler({ restaurant, user, time = 20, orderId }) {
    try {
      // const restaurant = await Restaurant.findById(req.restaurantId)
      var newDateObj = new Date(Date.now() + (parseInt(time) || 0) * 60000)
      console.log('preparation', newDateObj)
      const status = order_status[1]

      const update = {
        orderStatus: status,
        preparationTime: newDateObj,
        completionTime: new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        ),
        acceptedAt: new Date()
      }
      const result = await Order.findByIdAndUpdate(orderId, update, {
        new: true
      }).populate('restaurant')
      // const user = await User.findById(result.user)
      const transformedOrder = await transformOrder(result)
      const populatedOrder = await result.populate('user')
      console.log({ transformedOrder })
      if (!transformedOrder.isPickedUp) {
        publishToZoneRiders(result.zone.toString(), transformedOrder, 'new')
        await sendPushNotification(result.zone.toString(), result)
        // await dispatchQueue.add({ orderId: populatedOrder._id, attempt: 0 })
      }
      if (
        user &&
        user.isOnline &&
        user.isOrderNotification &&
        user.notificationToken
      ) {
        await sendCustomerNotifications(populatedOrder.user, result)
      }
      console.log('restaurant accepted order')
      // publishToUser(result.user.toString(), transformedOrder, 'update')
      // sendNotificationToCustomerWeb(
      //   user.notificationTokenWeb,
      //   `Order status: ${result.orderStatus}`,
      //   `Order ID ${result.orderId}`
      // )
      publishOrder(transformedOrder)
      // return transformedOrder
    } catch (error) {
      throw error
    }
  }
}
