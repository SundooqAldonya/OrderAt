/* eslint-disable no-tabs */
//   SyntaxError,
//   ValidationError,
//   AuthenticationError,
//   ForbiddenError,
//   UserInputError,
const { AuthenticationError } = require('apollo-server-express')
const Order = require('../../models/order')
const Rider = require('../../models/rider')
const Restaurant = require('../../models/restaurant')
const {
  pubsub,
  DISPATCH_ORDER,
  publishOrder,
  publishToAssignedRider,
  publishToZoneRiders,
  publishToUser
} = require('../../helpers/pubsub')
const { transformOrder, transformRider } = require('./merge')
const {
  sendNotificationToUser,
  sendNotificationToZoneRiders,
  sendNotificationToRider
} = require('../../helpers/notifications')
const { order_status } = require('../../helpers/enum')

module.exports = {
  Subscription: {
    subscriptionDispatcher: {
      subscribe: () => pubsub.asyncIterator(DISPATCH_ORDER)
    }
  },
  Query: {
    getActiveOrders: async(_, args, { req, res }) => {
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated')
        }
        const filters = {
          orderStatus: { $in: ['PENDING', 'ACCEPTED', 'PICKED', 'ASSIGNED'] }
        }
        if (args.restaurantId) {
          filters.restaurant = args.restaurantId
        }
        const orders = await Order.find(filters).sort({ createdAt: -1 })
        return orders.map(transformOrder)
      } catch (err) {
        throw err
      }
    },
    orderDetails: async(_, args, { req, res }) => {
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated')
        }
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },
    ridersByZone: async(_, args, { req, res }) => {
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated')
        }
        const riders = await Rider.find({
          zone: args.id,
          isActive: true,
          available: true
        })
        return riders.map(transformRider)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    updateStatus: async(_, args, { req }) => {
      console.log('updateStatuss', args.id, args.orderStatus)
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated')
        }
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order not found')
        const restaurant = await Restaurant.findById(order.restaurant)
        if (args.orderStatus === 'ACCEPTED') {
          order.completionTime = new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          )
          order.acceptedAt = new Date()
        }
        if (args.orderStatus === 'PICKED') {
          order.completionTime = new Date(Date.now() + 15 * 60 * 1000)
          order.pickedAt = new Date()
        }
        if (args.orderStatus === 'CANCELLED') {
          order.cancelledAt = new Date()
        }
        if (args.orderStatus === 'DELIVERED') {
          order.deliveredAt = new Date()
        }
        order.orderStatus = args.orderStatus
        const result = await order.save()
        sendNotificationToUser(result.user, result)
        const transformedOrder = await transformOrder(result)
        publishOrder(transformedOrder)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        if (!order.isPickedUp) {
          if (args.orderStatus === 'ACCEPTED' && order.rider) {
            publishToAssignedRider(order.rider, transformedOrder, 'new')
            sendNotificationToRider(result.rider.toString(), transformedOrder)
          }
          if (args.orderStatus === 'ACCEPTED' && !order.rider) {
            publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
            sendNotificationToZoneRiders(
              order.zone.toString(),
              transformedOrder
            )
          }
          if (args.orderStatus === 'CANCELLED' && order.rider) {
            publishToAssignedRider(order.rider, transformedOrder, 'remove')
            sendNotificationToRider(result.rider.toString(), transformedOrder)
          }
        }
        return transformedOrder
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    assignRider: async(_, args, { req }) => {
      console.log('assignRider', args.id, args.riderId)
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated')
        }
        const order = await Order.findById(args.id)
        const rider = await Rider.findById(args.riderId)
        if (!order) throw new Error('Order does not exist')
        if (!rider) throw new Error('Rider does not exist')
        const currentTransformedOrder = await transformOrder(order)
        if (order.rider) {
          publishToAssignedRider(
            order.rider.toString(),
            currentTransformedOrder,
            'remove'
          )
          sendNotificationToRider(
            order.rider.toString(),
            currentTransformedOrder,
            `You were removed from Order ${currentTransformedOrder.orderId}`
          )
        }
        order.rider = args.riderId
        order.orderStatus = order_status[6]
        order.assignedAt = new Date()
        const result = await order.save()
        const transformedOrder = await transformOrder(result)
        sendNotificationToUser(order.user.toString(), transformedOrder)
        publishToAssignedRider(args.riderId, transformedOrder, 'new')
        sendNotificationToRider(
          args.riderId,
          transformedOrder,
          `New order was assigned. ${transformedOrder.orderId}`
        )
        publishOrder(transformedOrder)

        return transformedOrder
      } catch (error) {
        throw error
      }
    },
    notifyRiders: async(_, args, { req }) => {
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated')
        }
        const order = await Order.findById(args.id)
        const transformedOrder = await transformOrder(order)
        publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
        sendNotificationToZoneRiders(order.zone.toString(), transformedOrder)
        publishOrder(transformedOrder)
        sendNotificationToUser(order.user.toString(), transformedOrder)
        return true
      } catch (err) {
        throw err
      }
    }
    // remove rider
  }
}
