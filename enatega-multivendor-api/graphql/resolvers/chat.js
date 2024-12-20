const Order = require('../../models/order')
const Message = require('../../models/message')
const User = require('../../models/user')
const { transformMessage, transformOrder } = require('./merge')
const {
  sendNotificationToRider,
  sendNotificationToUser
} = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const { withFilter } = require('graphql-subscriptions')
const {
  pubsub,
  SUBSCRIPTION_MESSAGE,
  publishNewMessage
} = require('../../helpers/pubsub')
const MessagingResolver = {
  Subscription: {
    subscriptionNewMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_MESSAGE),
        (payload, args, context) => {
          const orderId = payload.subscriptionNewMessage.order
          return orderId === args.order
        }
      )
    }
  },
  Query: {
    chat: async(_, { order: orderID }, { req }) => {
      console.log('chat', orderID)
      try {
        if (!req.userId) throw new Error('Unauthenticated')
        const order = await Order.findById(orderID)
        return order.chat.reverse().map(transformMessage)
      } catch (error) {
        console.log('error chat', orderID, error)
      }
    }
  },
  Mutation: {
    sendChatMessage: async(_, { message, orderId }, { req }) => {
      console.log('sendChatMessage', message, orderId)
      try {
        if (!req.userId) throw new Error('Unauthenticated')
        const order = await Order.findById(orderId)
        const messageObj = new Message({
          ...message
        })
        const transformedOrder = transformOrder(order)
        await Order.updateOne(
          { _id: order._id },
          { $push: { chat: messageObj } }
        )
        if (order.user.toString() === req.userId) {
          // send notification to rider
          sendNotificationToRider(
            order.rider,
            transformedOrder,
            message.message,
            'chat'
          )
        }
        if (order.rider.toString() === req.userId) {
          // send notification to user
          sendNotificationToUser(
            order.user,
            transformedOrder,
            message.message,
            'chat'
          )
          const findUser = await User.findById(order.user)
          sendNotificationToCustomerWeb(
            findUser.notificationTokenWeb,
            'New message: ',
            message.message
          )
        }
        // call subscription publish chat
        const transformedMessage = transformMessage(messageObj)
        publishNewMessage({ ...transformedMessage, order: order.id })
        return { success: true, data: transformedMessage }
      } catch (error) {
        console.log(error)
        return {
          success: false,
          message: error.message
        }
      }
    }
    // recieves message object along with order id, add new message object in array, send notification to customer/rider, publish order subscription
  }
}

module.exports = MessagingResolver
