const moment = require('moment')

const order_status = [
  'PENDING', // 0
  'ACCEPTED', // 1
  'PICKED', // 2
  'DELIVERED', // 3
  'CANCELLED', // 4
  'COMPLETED', // 5
  'ASSIGNED' // 6
]

/**
 * Check if an order has not been picked after (preparation time + 10 minutes)
 * @param {Object} order - The order object
 * @param {string} order.createdAt - The timestamp when the order was created
 * @param {number} order.preparationTime - Time in minutes for order preparation
 * @param {string} order.status - Current order status
 * @returns {boolean} - True if the order is not picked after the allowed time
 */
export const isOrderNotPicked = order => {
  const { createdAt, preparationTime, status } = order
  const now = moment()
  const orderCreatedAt = moment(createdAt)

  // Calculate the time when the order should have been picked
  const pickUpDeadline = orderCreatedAt.add(preparationTime + 10, 'minutes')

  // If order is NOT PICKED and the deadline has passed
  return status !== 'PICKED' && now.isAfter(pickUpDeadline)
}

// Example Usage:
const orders = [
  {
    createdAt: moment().subtract(40, 'minutes').toISOString(), // Order created 40 minutes ago
    preparationTime: 20, // Preparation time is 20 minutes
    status: 'ACCEPTED' // Still not picked
  },
  {
    createdAt: moment().subtract(25, 'minutes').toISOString(), // Order created 25 minutes ago
    preparationTime: 15, // Preparation time is 15 minutes
    status: 'PICKED' // Already picked
  }
]

// Find all orders that are not picked in time
export const notPickedOrders = orders.filter(isOrderNotPicked)

console.log(notPickedOrders)
