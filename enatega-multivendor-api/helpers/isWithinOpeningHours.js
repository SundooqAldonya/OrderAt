module.exports = {
  isRestaurantAvailable(restaurant) {
    const now = new Date()

    // 1. Manual toggle
    if (!restaurant.isAvailable) return false

    // 2. Working hours
    if (!isWithinOpeningHours(restaurant.openingTimes)) return false

    // 3. Keep-alive (last ping max 2 mins ago)
    const threshold = 2 * 60 * 1000
    if (!restaurant.lastPingAt || now - restaurant.lastPingAt > threshold) {
      return false
    }

    return true
  }
}

const isWithinOpeningHours = openingTimes => {
  const now = new Date()
  const currentDay = now
    .toLocaleString('en-GB', { weekday: 'short' })
    .toUpperCase() // e.g. "MON"

  // Find today's timings
  const today = openingTimes.find(t => t.day === currentDay)
  if (!today || !today.times || today.times.length === 0) return false

  // Current time in minutes
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Check each interval
  return today.times.some(({ startTime, endTime }) => {
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1])
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1])
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  })
}
