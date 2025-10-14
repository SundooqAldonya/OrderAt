// const { PubSub } = require('graphql-subscriptions')
const { RedisPubSub } = require('graphql-redis-subscriptions')

const PLACE_ORDER = 'PLACE_ORDER'
const ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED'
const ASSIGN_RIDER = 'ASSIGN_RIDER'
const UNASSIGNED_ORDER = 'UNASSIGNED_ORDER'
const RIDER_LOCATION = 'RIDER_LOCATION'
const ZONE_ORDER = 'ZONE_ORDER'
const SUBSCRIPTION_ORDER = 'SUBSCRIPTION_ORDER'
const DISPATCH_ORDER = 'DISPATCH_ORDER'
const SUBSCRIPTION_MESSAGE = 'SUBSCRIPTION_MESSAGE'
// const pubsub = new PubSub()

// pubsub.asyncIterator

const Redis = require('ioredis')

const options = {
  host: '127.0.0.1', // or your Redis host
  port: 6379,
  retryStrategy: times => Math.min(times * 50, 2000)
}

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
})

// // optional: increase listener cap
// if (pubsub.setMaxListeners) pubsub.setMaxListeners(100)

// class SafePubSub extends PubSub {
//   asyncIterator(triggers) {
//     const baseIterator = super.asyncIterator(triggers)

//     let isClosed = false

//     const safeIterator = {
//       next: async () => {
//         if (isClosed) return { value: undefined, done: true }
//         try {
//           return await baseIterator.next()
//         } catch (err) {
//           console.error('SafePubSub.next() error:', err)
//           return { value: undefined, done: true }
//         }
//       },

//       return: async () => {
//         if (isClosed) return { value: undefined, done: true }
//         isClosed = true
//         try {
//           if (baseIterator.return) await baseIterator.return()
//         } catch (err) {
//           console.warn('SafePubSub.return() cleanup failed:', err)
//         }
//         return { value: undefined, done: true }
//       },

//       throw: async error => {
//         console.error('SafePubSub.throw() called with:', error)
//         return { value: undefined, done: true }
//       },

//       [Symbol.asyncIterator]() {
//         return this
//       }
//     }

//     return safeIterator
//   }
// }
// const pubsub = new SafePubSub()
// pubsub.ee.setMaxListeners(100)

const publishToUser = (order, origin) => {
  const orderStatusChanged = {
    // userId,
    orderId: order._id,
    order,
    origin
  }
  console.log({ orderStatusChanged })
  pubsub.publish(ORDER_STATUS_CHANGED, { orderStatusChanged })
}

const publishToAssignedRider = (userId, order, origin) => {
  const subscriptionAssignRider = {
    userId,
    order,
    origin
  }
  pubsub.publish(ASSIGN_RIDER, { subscriptionAssignRider })
}

const publishToDashboard = (restaurantId, order, origin) => {
  const subscribePlaceOrder = {
    restaurantId,
    order,
    origin
  }
  console.log('Publishing PLACE_ORDER:', subscribePlaceOrder)
  pubsub.publish(PLACE_ORDER, { subscribePlaceOrder })
}

const publishRiderLocation = rider => {
  pubsub.publish(RIDER_LOCATION, { subscriptionRiderLocation: rider })
}

const publishToZoneRiders = (zoneId, order, origin) => {
  const subscriptionZoneOrders = {
    order,
    zoneId,
    origin
  }
  pubsub.publish(ZONE_ORDER, { subscriptionZoneOrders })
}

const publishOrder = order => {
  pubsub.publish(SUBSCRIPTION_ORDER, { subscriptionOrder: order })
}

const publishToDispatcher = order => {
  pubsub.publish(DISPATCH_ORDER, { subscriptionDispatcher: order })
}

const publishNewMessage = message => {
  pubsub.publish(SUBSCRIPTION_MESSAGE, { subscriptionNewMessage: message })
}

module.exports = {
  pubsub,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  UNASSIGNED_ORDER,
  RIDER_LOCATION,
  ZONE_ORDER,
  SUBSCRIPTION_ORDER,
  DISPATCH_ORDER,
  SUBSCRIPTION_MESSAGE,
  publishToUser,
  publishToAssignedRider,
  publishToDashboard,
  publishRiderLocation,
  publishToZoneRiders,
  publishOrder,
  publishToDispatcher,
  publishNewMessage
}
