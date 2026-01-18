/**
 * Rider Scoring Helpers
 * 
 * Helper functions for calculating individual components of the rider dispatch score.
 * Each function calculates a specific metric that contributes to the overall fairness
 * and efficiency of order distribution.
 */

const Order = require('../models/order')

/**
 * Calculate current workload score
 * 
 * Priority: HIGHEST (weight 4.0)
 * Logic: Riders with fewer active orders get priority to prevent overloading
 * 
 * @param {String} riderId - Rider's MongoDB ID
 * @returns {Promise<Number>} Workload score (lower = less busy = higher priority)
 */
async function getCurrentWorkloadScore(riderId) {
  // Count orders in ASSIGNED status (accepted but not picked up yet)
  const assignedOrders = await Order.countDocuments({
    rider: riderId,
    orderStatus: 'ASSIGNED'
  })

  // Count orders in PICKED status (on the way to deliver)
  const pickedOrders = await Order.countDocuments({
    rider: riderId,
    orderStatus: 'PICKED'
  })

  // ASSIGNED orders are weighted more heavily (10) because they represent
  // immediate workload. PICKED orders (5) are in-progress but less blocking.
  const workloadScore = assignedOrders * 10 + pickedOrders * 5

  return workloadScore
}

/**
 * Calculate daily distribution fairness score
 * 
 * Priority: HIGH (weight 3.0)
 * Logic: Riders who already got many orders today are deprioritized to ensure
 *        fair distribution throughout the day
 * 
 * @param {Object} rider - Rider document with ordersCompletedToday field
 * @param {Number} avgOrdersPerRider - Average orders per rider today in this zone
 * @returns {Number} Distribution score (lower = fewer orders today = higher priority)
 */
function getDailyDistributionScore(rider, avgOrdersPerRider) {
  const ordersToday = rider.ordersCompletedToday || 0
  const deviation = ordersToday - avgOrdersPerRider

  // Only penalize if above average (deviation > 0)
  // Riders below average get 0 score (high priority)
  // Each order above average adds 5 points penalty
  return deviation > 0 ? deviation * 5 : 0
}

/**
 * Calculate responsiveness score based on historical response times
 * 
 * Priority: MEDIUM-HIGH (weight 2.5)
 * Logic: Faster responders get priority as they're more likely to accept quickly
 * 
 * @param {Object} rider - Rider document with avgResponseTimeSeconds30d field
 * @returns {Number} Responsiveness score (lower = faster = higher priority)
 */
function getResponsivenessScore(rider) {
  const avgResponseSeconds = rider.avgResponseTimeSeconds30d || 60

  // Convert seconds to points, cap at 20 to prevent extreme outliers
  // 30 seconds = 0.5 points (excellent)
  // 2 minutes = 2 points (good)
  // 10 minutes = 10 points (slow)
  // 30+ minutes = 20 points (very slow, capped)
  const score = Math.min(avgResponseSeconds / 60, 20)

  return score
}

/**
 * Calculate performance score based on acceptance and completion rates
 * 
 * Priority: MEDIUM (weight 2.0)
 * Logic: Reliable riders who accept and complete orders get priority
 * 
 * @param {Object} rider - Rider document with acceptanceRate30d and completionRate30d
 * @returns {Number} Performance score (lower = more reliable = higher priority)
 */
function getPerformanceScore(rider) {
  const acceptanceRate = rider.acceptanceRate30d || 0.5 // default 50%
  const completionRate = rider.completionRate30d || 0.95 // default 95%

  // Invert rates so lower is better
  // High acceptance & completion = low score (good)
  // Low acceptance or completion = high score (penalized)
  const acceptanceScore = (1 - acceptanceRate) * 10
  const completionScore = (1 - completionRate) * 10

  return acceptanceScore + completionScore
}

/**
 * Calculate proximity score based on distance to pickup location
 * 
 * Priority: MEDIUM-LOW (weight 1.0)
 * Logic: Closer riders can pick up faster, but we don't want to monopolize
 *        nearby riders (hence lower weight than fairness factors)
 * 
 * @param {Object} riderLocation - Rider's current location {coordinates: [lng, lat]}
 * @param {Object} pickupLocation - Order pickup location {coordinates: [lng, lat]}
 * @returns {Number} Proximity score (lower = closer = higher priority)
 */
function getProximityScore(riderLocation, pickupLocation) {
  if (!riderLocation?.coordinates || !pickupLocation?.coordinates) {
    return 5 // default middle score if location data missing
  }

  const distance = haversineDistance(
    riderLocation.coordinates,
    pickupLocation.coordinates
  )

  // Cap at 10km to prevent extreme outliers
  return Math.min(distance, 10)
}

/**
 * Calculate fairness/anti-starvation bonus
 * 
 * Priority: MEDIUM-LOW (weight 1.0)
 * Logic: Riders who haven't received orders in a while get a bonus to prevent
 *        starvation (being perpetually skipped)
 * 
 * @param {Object} rider - Rider document with lastOrderAt field
 * @returns {Number} Fairness score (negative = bonus for waiting riders)
 */
function getFairnessScore(rider) {
  if (!rider.lastOrderAt) {
    // Never received an order, give medium bonus
    return -5
  }

  const now = new Date()
  const minutesSinceLastOrder = Math.floor(
    (now - new Date(rider.lastOrderAt)) / 60000
  )

  // Riders waiting 2+ hours get -10 bonus (significant priority boost)
  // Riders with recent orders get 0 (no bonus)
  return minutesSinceLastOrder > 120 ? -10 : 0
}

/**
 * Haversine distance calculation
 * 
 * @param {Array} coord1 - [longitude, latitude]
 * @param {Array} coord2 - [longitude, latitude]
 * @returns {Number} Distance in kilometers
 */
function haversineDistance(coord1, coord2) {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2

  const toRad = deg => (deg * Math.PI) / 180
  const R = 6371 // Earth radius in km

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

/**
 * Calculate average orders per rider today (for fairness calculation)
 * 
 * @param {Array} riders - Array of rider documents
 * @returns {Number} Average orders completed today across all riders
 */
function calculateAvgOrdersToday(riders) {
  if (!riders.length) return 0

  const totalOrders = riders.reduce(
    (sum, rider) => sum + (rider.ordersCompletedToday || 0),
    0
  )

  return totalOrders / riders.length
}

module.exports = {
  getCurrentWorkloadScore,
  getDailyDistributionScore,
  getResponsivenessScore,
  getPerformanceScore,
  getProximityScore,
  getFairnessScore,
  calculateAvgOrdersToday
}
