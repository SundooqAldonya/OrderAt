const { transformOrder } = require('../graphql/resolvers/merge')
const Order = require('../models/order')
const dispatchQueue = require('../queues/dispatchRiderQueue')
const { sendCustomerNotifications } = require('./customerNotifications')
const { order_status } = require('./enum')
const {
  sendPushNotification,
  sendPushNotificationSingleRider
} = require('./findRiders')
const {
  sendNotificationToCustomerWeb
} = require('./firebase-web-notifications')
const { publishToZoneRiders, publishToUser, publishOrder } = require('./pubsub')

module.exports = {
  async acceptOrderHandler({ restaurant, user, time = 20, orderId, rider }) {
    try {
      var newDateObj = new Date(Date.now() + (parseInt(time) || 0) * 60000)
      console.log('preparation', newDateObj)

      const status = rider ? order_status[6] : order_status[1] // 'ASSIGNED' : 'ACCEPTED'

      const update = {
        orderStatus: status,
        preparationTime: newDateObj,
        completionTime: new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        ),
        acceptedAt: new Date(),
        assignedAt: rider ? new Date() : null
      }
      const result = await Order.findByIdAndUpdate(orderId, update, {
        new: true
      })
        .populate('restaurant')
        .populate('rider')
      // const user = await User.findById(result.user)
      const transformedOrder = await transformOrder(result)
      const populatedOrder = await result.populate('user')
      console.log({ transformedOrder })
      if (!transformedOrder.isPickedUp) {
        publishToZoneRiders(result.zone.toString(), transformedOrder, 'new')
        if (transformedOrder.rider) {
          await sendPushNotificationSingleRider(result.rider, result)
        } else {
          await sendPushNotification(result.zone.toString(), result)
        }
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
