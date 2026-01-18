/**
 * Enhanced Rider Ranking Algorithm
 * 
 * This algorithm calculates a composite score for each rider to determine dispatch
 * priority. The goal is to fairly distribute orders while rewarding performance,
 * preventing overload, and ensuring responsive riders get priority.
 * 
 * SCORING PHILOSOPHY:
 * - Lower scores = Higher priority (better)
 * - Multiple factors weighted by importance
 * - Balances fairness, efficiency, and performance
 * 
 * SCORE COMPONENTS (total weight = 14.0):
 * 1. Current Workload (4.0)    - Prevent overloading busy riders
 * 2. Daily Distribution (3.0)  - Fair distribution throughout the day
 * 3. Responsiveness (2.5)      - Reward quick responders
 * 4. Performance (2.0)         - Reward reliable riders
 * 5. Proximity (1.0)           - Consider location but don't dominate
 * 6. Fairness Bonus (1.0)      - Prevent rider starvation
 * 
 * LAST ATTEMPT BEHAVIOR:
 * - On final cycle, ALL available riders are notified (no filtering)
 * - This ensures no order goes unassigned due to scoring
 */

const {
  getCurrentWorkloadScore,
  getDailyDistributionScore,
  getResponsivenessScore,
  getPerformanceScore,
  getProximityScore,
  getFairnessScore,
  calculateAvgOrdersToday
} = require('./riderScoringHelpers')

async function rankRiders({ log, riders, alreadyNotifiedRiderIds, attempt, order }) {
  console.log('🎯 Ranking riders:', {
    totalRiders: riders.length,
    alreadyNotified: alreadyNotifiedRiderIds?.length || 0,
    attempt,
    maxCycles: log.maxCycles
  })

  // Check if this is the last attempt
  const isLastAttempt = attempt + 1 >= log.maxCycles

  // LAST ATTEMPT: Notify ALL riders (no filtering or scoring)
  if (isLastAttempt) {
    console.log('⚠️ FINAL ATTEMPT: Dispatching to ALL available riders')
    return riders
  }

  // For first attempt, filter is already done in dispatch queue
  // For subsequent attempts using cached ranking, filtering happens there too
  const candidateRiders = alreadyNotifiedRiderIds?.length > 0
    ? riders.filter(rider => !alreadyNotifiedRiderIds.includes(rider._id.toString()))
    : riders

  console.log('📊 Candidate riders:', candidateRiders.length)

  if (!candidateRiders.length) {
    console.log('⚠️ No new riders to notify')
    return []
  }

  // Calculate average orders today for fairness scoring
  const avgOrdersToday = calculateAvgOrdersToday(candidateRiders)

  // Calculate composite score for each candidate rider
  const ridersWithScores = await Promise.all(
    candidateRiders.map(async rider => {
      // 1. WORKLOAD SCORE (Weight: 4.0) - Most important
      const workloadScore = await getCurrentWorkloadScore(rider._id)

      // 2. DAILY DISTRIBUTION SCORE (Weight: 3.0) - Fairness
      const distributionScore = getDailyDistributionScore(rider, avgOrdersToday)

      // 3. RESPONSIVENESS SCORE (Weight: 2.5) - Performance
      const responsivenessScore = getResponsivenessScore(rider)

      // 4. PERFORMANCE SCORE (Weight: 2.0) - Reliability
      const performanceScore = getPerformanceScore(rider)

      // 5. PROXIMITY SCORE (Weight: 1.0) - Efficiency
      const proximityScore = order?.pickupLocation
        ? getProximityScore(rider.location, order.pickupLocation)
        : 5 // default middle score if no pickup location

      // 6. FAIRNESS BONUS (Weight: 1.0) - Anti-starvation
      const fairnessScore = getFairnessScore(rider)

      // COMPOSITE SCORE (lower = higher priority)
      const compositeScore =
        workloadScore * 4.0 +
        distributionScore * 3.0 +
        responsivenessScore * 2.5 +
        performanceScore * 2.0 +
        proximityScore * 1.0 +
        fairnessScore * 1.0

      // Log detailed scoring for debugging
      console.log(`📈 Rider ${rider.name} (${rider._id}):`, {
        workload: workloadScore.toFixed(2),
        distribution: distributionScore.toFixed(2),
        responsiveness: responsivenessScore.toFixed(2),
        performance: performanceScore.toFixed(2),
        proximity: proximityScore.toFixed(2),
        fairness: fairnessScore.toFixed(2),
        TOTAL: compositeScore.toFixed(2)
      })

      return {
        rider,
        score: compositeScore,
        breakdown: {
          workload: workloadScore,
          distribution: distributionScore,
          responsiveness: responsivenessScore,
          performance: performanceScore,
          proximity: proximityScore,
          fairness: fairnessScore
        }
      }
    })
  )

  // Sort by score (ascending - lower is better)
  // TIE-BREAKER: If scores are equal, prioritize by:
  // 1. Rider who waited longer (lastOrderAt older = higher priority)
  // 2. If still tied, use rider ID alphabetically
  const ranked = ridersWithScores.sort((a, b) => {
    // Primary sort: composite score (lower is better)
    if (a.score !== b.score) {
      return a.score - b.score
    }

    // Tie-breaker 1: Last order time (older = higher priority)
    const aLastOrder = a.rider.lastOrderAt ? new Date(a.rider.lastOrderAt).getTime() : 0
    const bLastOrder = b.rider.lastOrderAt ? new Date(b.rider.lastOrderAt).getTime() : 0
    
    if (aLastOrder !== bLastOrder) {
      return aLastOrder - bLastOrder // Earlier date wins (lower timestamp)
    }

    // Tie-breaker 2: Rider ID (stable sort)
    return a.rider._id.toString().localeCompare(b.rider._id.toString())
  })

  console.log('🏆 Top 5 ranked riders:', 
    ranked.slice(0, 5).map(r => ({
      name: r.rider.name,
      score: r.score.toFixed(2),
      lastOrder: r.rider.lastOrderAt ? new Date(r.rider.lastOrderAt).toLocaleTimeString() : 'Never'
    }))
  )

  // Return sorted riders
  return ranked.map(r => r.rider)
}

module.exports = rankRiders
