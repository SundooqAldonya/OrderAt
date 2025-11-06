module.exports = {
  async deliveryTimeRangeExceeds({ timeRange }) {
    try {
      if (!timeRange) {
        console.log(
          'No time detected for the given Delivery Zone. Proceeding...'
        )
        return false // no time restriction → allow
      }

      const { from, to, allowAcrossMidnight } = timeRange

      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const [fromH, fromM] = from.split(':').map(Number)
      const [toH, toM] = to.split(':').map(Number)

      const fromMinutes = fromH * 60 + fromM
      const toMinutes = toH * 60 + toM

      let isInRange = false

      if (allowAcrossMidnight) {
        // Example: 22:00 → 03:00
        if (fromMinutes <= toMinutes) {
          // Normal case even if allowAcrossMidnight = true
          isInRange =
            currentMinutes >= fromMinutes && currentMinutes <= toMinutes
        } else {
          // Crosses midnight
          isInRange =
            currentMinutes >= fromMinutes || currentMinutes <= toMinutes
        }
      } else {
        // Normal case (same day only)
        isInRange = currentMinutes >= fromMinutes && currentMinutes <= toMinutes
      }

      return !isInRange // ❗ return true if exceeds range
    } catch (err) {
      console.log('deliveryTimeRangeExceeds error:', err)
      return false
    }
  }
}
