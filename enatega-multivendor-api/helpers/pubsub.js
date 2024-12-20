const { PubSub } = require('graphql-subscriptions')

const PLACE_ORDER = 'PLACE_ORDER'
const ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED'
const ASSIGN_RIDER = 'ASSIGN_RIDER'
const UNASSIGNED_ORDER = 'UNASSIGNED_ORDER'
const RIDER_LOCATION = 'RIDER_LOCATION'
const ZONE_ORDER = 'ZONE_ORDER'
const SUBSCRIPTION_ORDER = 'SUBSCRIPTION_ORDER'
const DISPATCH_ORDER = 'DISPATCH_ORDER'
const SUBSCRIPTION_MESSAGE = 'SUBSCRIPTION_MESSAGE'
const pubsub = new PubSub()

const publishToUser = (userId, order, origin) => {
  const orderStatusChanged = {
    userId,
    order,
    origin
  }
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
