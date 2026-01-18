/**
 * Rider Dispatch Scoring Simulator
 * 
 * This script simulates different rider scenarios to test the fair dispatch algorithm
 * without affecting real data. Run with: node test/simulate-dispatch-scoring.js
 */

const mongoose = require('mongoose')
require('dotenv').config()

// Import scoring helpers
const {
  getDailyDistributionScore,
  getResponsivenessScore,
  getPerformanceScore,
  getProximityScore,
  getFairnessScore,
  calculateAvgOrdersToday
} = require('../helpers/riderScoringHelpers')

// Mock rider scenarios
const scenarios = {
  lunchRush: {
    name: 'Lunch Rush - Busy Period',
    description: 'Multiple riders with varying workloads during peak hours',
    riders: [
      {
        _id: 'alice',
        name: 'Alice',
        ordersCompletedToday: 5,
        avgResponseTimeSeconds30d: 20,
        acceptanceRate30d: 0.85,
        completionRate30d: 0.98,
        lastOrderAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
        location: { coordinates: [-122.4194, 37.7749] }, // 2km from restaurant
        activeOrders: { assigned: 0, picked: 0 }
      },
      {
        _id: 'bob',
        name: 'Bob',
        ordersCompletedToday: 12,
        avgResponseTimeSeconds30d: 45,
        acceptanceRate30d: 0.95,
        completionRate30d: 0.98,
        lastOrderAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        location: { coordinates: [-122.4094, 37.7749] }, // 1km from restaurant
        activeOrders: { assigned: 0, picked: 1 }
      },
      {
        _id: 'carlos',
        name: 'Carlos',
        ordersCompletedToday: 3,
        avgResponseTimeSeconds30d: 90,
        acceptanceRate30d: 0.60,
        completionRate30d: 0.95,
        lastOrderAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        location: { coordinates: [-122.4294, 37.7849] }, // 4km from restaurant
        activeOrders: { assigned: 0, picked: 0 }
      },
      {
        _id: 'diana',
        name: 'Diana',
        ordersCompletedToday: 8,
        avgResponseTimeSeconds30d: 15,
        acceptanceRate30d: 0.90,
        completionRate30d: 0.97,
        lastOrderAt: new Date(Date.now() - 20 * 60 * 1000), // 20 min ago
        location: { coordinates: [-122.4144, 37.7799] }, // 1.5km from restaurant
        activeOrders: { assigned: 0, picked: 0 }
      }
    ],
    restaurantLocation: { coordinates: [-122.4094, 37.7699] }
  },

  eveningSlow: {
    name: 'Evening Slow Period',
    description: 'Fewer riders, some above daily average',
    riders: [
      {
        _id: 'diana',
        name: 'Diana',
        ordersCompletedToday: 2,
        avgResponseTimeSeconds30d: 15,
        acceptanceRate30d: 0.90,
        completionRate30d: 0.97,
        lastOrderAt: new Date(Date.now() - 20 * 60 * 1000),
        location: { coordinates: [-122.4244, 37.7799] }, // 3km
        activeOrders: { assigned: 0, picked: 0 }
      },
      {
        _id: 'erik',
        name: 'Erik',
        ordersCompletedToday: 6,
        avgResponseTimeSeconds30d: 30,
        acceptanceRate30d: 0.85,
        completionRate30d: 0.96,
        lastOrderAt: new Date(Date.now() - 15 * 60 * 1000),
        location: { coordinates: [-122.4094, 37.7749] }, // 1km
        activeOrders: { assigned: 0, picked: 0 }
      }
    ],
    restaurantLocation: { coordinates: [-122.4094, 37.7699] }
  },

  starvationTest: {
    name: 'Rider Starvation Scenario',
    description: 'One rider waiting for hours while others recently got orders',
    riders: [
      {
        _id: 'frank',
        name: 'Frank (Starving)',
        ordersCompletedToday: 0,
        avgResponseTimeSeconds30d: 120,
        acceptanceRate30d: 0.50,
        completionRate30d: 0.90,
        lastOrderAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago!
        location: { coordinates: [-122.4394, 37.7849] }, // 8km away
        activeOrders: { assigned: 0, picked: 0 }
      },
      {
        _id: 'grace',
        name: 'Grace (Recently Active)',
        ordersCompletedToday: 10,
        avgResponseTimeSeconds30d: 20,
        acceptanceRate30d: 0.95,
        completionRate30d: 0.98,
        lastOrderAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
        location: { coordinates: [-122.4094, 37.7720] }, // 0.5km away
        activeOrders: { assigned: 0, picked: 0 }
      }
    ],
    restaurantLocation: { coordinates: [-122.4094, 37.7699] }
  },

  tiedScores: {
    name: 'Tied Scores - Tie-breaker Test',
    description: 'Multiple riders with identical composite scores',
    riders: [
      {
        _id: 'rider_001',
        name: 'Jack (Waited 3h)',
        ordersCompletedToday: 5,
        avgResponseTimeSeconds30d: 30,
        acceptanceRate30d: 0.80,
        completionRate30d: 0.95,
        lastOrderAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        location: { coordinates: [-122.4194, 37.7749] },
        activeOrders: { assigned: 0, picked: 0 }
      },
      {
        _id: 'rider_002',
        name: 'Kelly (Waited 1h)',
        ordersCompletedToday: 5,
        avgResponseTimeSeconds30d: 30,
        acceptanceRate30d: 0.80,
        completionRate30d: 0.95,
        lastOrderAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        location: { coordinates: [-122.4194, 37.7749] }, // Same location
        activeOrders: { assigned: 0, picked: 0 }
      },
      {
        _id: 'rider_003',
        name: 'Leo (Waited 2h)',
        ordersCompletedToday: 5,
        avgResponseTimeSeconds30d: 30,
        acceptanceRate30d: 0.80,
        completionRate30d: 0.95,
        lastOrderAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: { coordinates: [-122.4194, 37.7749] }, // Same location
        activeOrders: { assigned: 0, picked: 0 }
      }
    ],
    restaurantLocation: { coordinates: [-122.4094, 37.7699] }
  },

  overloadedRider: {
    name: 'Overloaded Rider',
    description: 'One rider with multiple active orders',
    riders: [
      {
        _id: 'henry',
        name: 'Henry (Overloaded)',
        ordersCompletedToday: 15,
        avgResponseTimeSeconds30d: 25,
        acceptanceRate30d: 0.95,
        completionRate30d: 0.98,
        lastOrderAt: new Date(Date.now() - 1 * 60 * 1000),
        location: { coordinates: [-122.4094, 37.7710] }, // Very close
        activeOrders: { assigned: 1, picked: 1 } // 2 active orders!
      },
      {
        _id: 'iris',
        name: 'Iris (Available)',
        ordersCompletedToday: 4,
        avgResponseTimeSeconds30d: 40,
        acceptanceRate30d: 0.75,
        completionRate30d: 0.95,
        lastOrderAt: new Date(Date.now() - 30 * 60 * 1000),
        location: { coordinates: [-122.4244, 37.7799] }, // Farther
        activeOrders: { assigned: 0, picked: 0 }
      }
    ],
    restaurantLocation: { coordinates: [-122.4094, 37.7699] }
  }
}

/**
 * Calculate workload score (simulated - no DB query)
 */
function simulateWorkloadScore(rider) {
  const { assigned, picked } = rider.activeOrders
  return assigned * 10 + picked * 5
}

/**
 * Haversine distance calculation
 */
function haversineDistance(coord1, coord2) {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2

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

/**
 * Simulate proximity score
 */
function simulateProximityScore(riderLocation, restaurantLocation) {
  if (!riderLocation?.coordinates || !restaurantLocation?.coordinates) {
    return 5
  }

  const distance = haversineDistance(
    riderLocation.coordinates,
    restaurantLocation.coordinates
  )

  return Math.min(distance, 10)
}

/**
 * Run simulation for a scenario
 */
function simulateScenario(scenario) {
  console.log('\n' + '='.repeat(80))
  console.log(`📊 SCENARIO: ${scenario.name}`)
  console.log(`📝 ${scenario.description}`)
  console.log('='.repeat(80))

  const riders = scenario.riders
  const avgOrdersToday = calculateAvgOrdersToday(riders)

  console.log(`\n📈 Zone Stats:`)
  console.log(`   Average orders/rider today: ${avgOrdersToday.toFixed(1)}`)
  console.log(`   Total riders: ${riders.length}`)
  console.log(`   Restaurant location: [${scenario.restaurantLocation.coordinates}]`)

  const ridersWithScores = riders.map(rider => {
    // Calculate each component
    const workloadScore = simulateWorkloadScore(rider)
    const distributionScore = getDailyDistributionScore(rider, avgOrdersToday)
    const responsivenessScore = getResponsivenessScore(rider)
    const performanceScore = getPerformanceScore(rider)
    const proximityScore = simulateProximityScore(
      rider.location,
      scenario.restaurantLocation
    )
    const fairnessScore = getFairnessScore(rider)

    // Composite score
    const compositeScore =
      workloadScore * 4.0 +
      distributionScore * 3.0 +
      responsivenessScore * 2.5 +
      performanceScore * 2.0 +
      proximityScore * 1.0 +
      fairnessScore * 1.0

    return {
      rider,
      scores: {
        workload: workloadScore,
        distribution: distributionScore,
        responsiveness: responsivenessScore,
        performance: performanceScore,
        proximity: proximityScore,
        fairness: fairnessScore,
        composite: compositeScore
      }
    }
  })

  // Sort by composite score (ascending - lower is better)
  // TIE-BREAKER: Same logic as production code
  const ranked = ridersWithScores.sort((a, b) => {
    // Primary sort: composite score
    if (a.scores.composite !== b.scores.composite) {
      return a.scores.composite - b.scores.composite
    }

    // Tie-breaker 1: Last order time (earlier = higher priority)
    const aLastOrder = a.rider.lastOrderAt ? a.rider.lastOrderAt.getTime() : 0
    const bLastOrder = b.rider.lastOrderAt ? b.rider.lastOrderAt.getTime() : 0
    
    if (aLastOrder !== bLastOrder) {
      return aLastOrder - bLastOrder
    }

    // Tie-breaker 2: Rider ID
    return a.rider._id.localeCompare(b.rider._id)
  })

  console.log('\n🏆 RANKING RESULTS (Lower Score = Higher Priority):')
  console.log('-'.repeat(80))

  ranked.forEach((item, index) => {
    const { rider, scores } = item
    const rank = index + 1
    const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  '

    console.log(`\n${emoji} Rank #${rank}: ${rider.name}`)
    console.log(`   📍 Distance: ${scores.proximity.toFixed(2)}km`)
    console.log(`   📦 Active Orders: ${rider.activeOrders.assigned} ASSIGNED, ${rider.activeOrders.picked} PICKED`)
    console.log(`   📊 Orders Today: ${rider.ordersCompletedToday} (avg: ${avgOrdersToday.toFixed(1)})`)
    console.log(`   ⚡ Response Time: ${rider.avgResponseTimeSeconds30d}s`)
    console.log(`   ✅ Acceptance: ${(rider.acceptanceRate30d * 100).toFixed(0)}% | Completion: ${(rider.completionRate30d * 100).toFixed(0)}%`)
    
    const hoursSinceOrder = rider.lastOrderAt 
      ? ((Date.now() - rider.lastOrderAt) / (1000 * 60 * 60)).toFixed(1)
      : 'Never'
    console.log(`   ⏰ Last Order: ${hoursSinceOrder}h ago`)
    
    console.log(`   ━━━ SCORE BREAKDOWN ━━━`)
    console.log(`   Workload:       ${scores.workload.toFixed(2).padStart(6)} × 4.0 = ${(scores.workload * 4.0).toFixed(2).padStart(7)}`)
    console.log(`   Distribution:   ${scores.distribution.toFixed(2).padStart(6)} × 3.0 = ${(scores.distribution * 3.0).toFixed(2).padStart(7)}`)
    console.log(`   Responsiveness: ${scores.responsiveness.toFixed(2).padStart(6)} × 2.5 = ${(scores.responsiveness * 2.5).toFixed(2).padStart(7)}`)
    console.log(`   Performance:    ${scores.performance.toFixed(2).padStart(6)} × 2.0 = ${(scores.performance * 2.0).toFixed(2).padStart(7)}`)
    console.log(`   Proximity:      ${scores.proximity.toFixed(2).padStart(6)} × 1.0 = ${(scores.proximity * 1.0).toFixed(2).padStart(7)}`)
    console.log(`   Fairness:       ${scores.fairness.toFixed(2).padStart(6)} × 1.0 = ${(scores.fairness * 1.0).toFixed(2).padStart(7)}`)
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`   🎯 TOTAL SCORE: ${scores.composite.toFixed(2)} ${rank === 1 ? '← WINNER!' : ''}`)
  })

  console.log('\n' + '='.repeat(80))
  console.log(`✅ Winner: ${ranked[0].rider.name} (Score: ${ranked[0].scores.composite.toFixed(2)})`)
  console.log('='.repeat(80))
}

/**
 * Main simulation runner
 */
function runSimulations() {
  console.log('\n� TIE-BREAKER RULES (when scores are equal):')
  console.log('   1. Rider who waited longer (earlier lastOrderAt) wins')
  console.log('   2. If still tied, alphabetical by rider ID')
  console.log('\n�🧪 RIDER DISPATCH SCORING SIMULATOR')
  console.log('Testing fair dispatch algorithm with various scenarios\n')

  // Run all scenarios
  Object.values(scenarios).forEach(scenario => {
    simulateScenario(scenario)
  })

  console.log('\n\n📊 SIMULATION COMPLETE')
  console.log('\nKey Takeaways:')
  console.log('✅ Lower composite score = Higher dispatch priority')
  console.log('✅ Workload prevention (weight 4.0) - Most important factor')
  console.log('✅ Fair distribution (weight 3.0) - Prevents monopolization')
  console.log('✅ Responsiveness (weight 2.5) - Rewards fast responders')
  console.log('✅ Performance (weight 2.0) - Rewards reliable riders')
  console.log('✅ Proximity (weight 1.0) - Location matters but doesn\'t dominate')
  console.log('✅ Fairness bonus (weight 1.0) - -10 for riders waiting 2+ hours')
  console.log('\n💡 Adjust weights in rankRiders.js if you observe imbalances in production')
}

// Run simulations
runSimulations()
