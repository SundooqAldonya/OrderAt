const Order = require('../models/order') // adjust path

async function rankRiders({ log, riders, alreadyNotifiedRiderIds, attempt }) {
  const now = new Date()
  console.log({ riders, alreadyNotifiedRiderIds })
  // Filter riders not already notified
  const isLastAttempt = attempt + 1 >= log.maxCycles

  const candidateRiders = isLastAttempt
    ? riders // last attempt → notify everyone
    : riders.filter(
        rider => !alreadyNotifiedRiderIds.includes(rider._id.toString())
      )

  console.log({ candidateRiders: candidateRiders?.length })

  // Resolve stats for each rider
  const ridersWithScores = await Promise.all(
    candidateRiders.map(async rider => {
      // Active orders (currently assigned)
      const activeOrders = await Order.countDocuments({
        rider: rider._id,
        orderStatus: 'ASSIGNED' // tweak to match your statuses
      })
      console.log({ activeOrders })
      // Orders in last 60 minutes (approx, could also query DB)
      const ordersLast60Min =
        rider.lastOrderAt && now - new Date(rider.lastOrderAt) <= 60 * 60 * 1000
          ? 1
          : 0
      console.log({ ordersLast60Min })
      // Last app open (recency in minutes)
      const lastActiveMinutesAgo = rider.lastActiveAt
        ? Math.floor((now - new Date(rider.lastActiveAt)) / 60000)
        : Infinity
      console.log({ lastActiveMinutesAgo })
      // Composite score (lower = better)
      const score =
        activeOrders * 3 + ordersLast60Min * 2 + lastActiveMinutesAgo / 30
      console.log({ score })
      return { rider, score }
    })
  )
  console.log({ ridersWithScores })
  // Sort by score
  const ranked = ridersWithScores.sort((a, b) => a.score - b.score)

  return ranked.map(r => r.rider)
}

// Helper: Haversine distance in km
function haversineDistance(loc1, loc2) {
  const [lng1, lat1] = Array.isArray(loc1) ? loc1 : [loc1.lng, loc1.lat]
  const [lng2, lat2] = Array.isArray(loc2) ? loc2 : [loc2.lng, loc2.lat]

  const toRad = deg => (deg * Math.PI) / 180
  const R = 6371 // km
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

module.exports = rankRiders
