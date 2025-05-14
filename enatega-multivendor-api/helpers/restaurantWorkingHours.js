const isRestaurantOpenNow = openingTimes => {
  const now = new Date()

  const currentDay = now
    .toLocaleString('en-US', { weekday: 'short' })
    .toUpperCase() // e.g., "MON"
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const todaySchedule = openingTimes.find(time => time.day === currentDay)
  if (!todaySchedule || !todaySchedule.times || !todaySchedule.times.length) {
    return false // No schedule means closed
  }

  for (const slot of todaySchedule.times) {
    const [startHour, startMinute] = slot.startTime.map(Number)
    const [endHour, endMinute] = slot.endTime.map(Number)

    const start = startHour * 60 + startMinute
    const end = endHour * 60 + endMinute
    const nowMinutes = currentHour * 60 + currentMinute

    if (nowMinutes >= start && nowMinutes <= end) {
      return true
    }
  }

  return false // Outside of all time slots
}

module.exports = { isRestaurantOpenNow }
