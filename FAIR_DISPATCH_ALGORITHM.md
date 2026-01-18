# Fair Dispatch Algorithm - Enhanced Rider Scoring System

## Overview

The enhanced rider dispatch algorithm implements a **multi-factor weighted scoring system** to fairly distribute delivery orders among available riders. The system balances competing objectives:

- **Fairness**: Equal opportunity for all riders
- **Efficiency**: Quick deliveries and optimal routing
- **Performance**: Reward reliable, responsive riders
- **Workload Balance**: Prevent rider overload

## Core Philosophy

> **Lower Score = Higher Priority**

The algorithm calculates a composite score for each rider. Riders with the lowest scores are notified first. The scoring system rewards:
- Available riders with low current workload
- Riders who haven't received many orders today
- Fast responders who open notifications quickly
- Reliable riders with high acceptance/completion rates
- Riders who have been waiting without orders

## Scoring Components

### Weight Distribution

| Component | Weight | Purpose |
|-----------|--------|---------|
| Current Workload | 4.0 | Prevent overloading busy riders |
| Daily Distribution | 3.0 | Fair distribution throughout the day |
| Responsiveness | 2.5 | Reward quick responders |
| Performance | 2.0 | Reward reliable riders |
| Proximity | 1.0 | Consider location efficiency |
| Fairness Bonus | 1.0 | Prevent rider starvation |
| **Total** | **14.0** | Combined weight |

### 1. Current Workload Score (Weight: 4.0)

**Purpose**: Prevent overloading riders who already have active deliveries.

**Calculation**:
```
workloadScore = (assignedOrders * 10) + (pickedOrders * 5)
```

**Logic**:
- Counts orders in `ASSIGNED` status (rider accepted, hasn't picked up yet) - **weight 10**
- Counts orders in `PICKED` status (rider has food, delivering) - **weight 5**
- Heavier penalty for ASSIGNED because rider is still at restaurant
- Picked orders weighted lower because rider is already in motion

**Examples**:
- Rider with 0 orders: **score = 0** ✅ (best)
- Rider with 1 PICKED order: **score = 5**
- Rider with 1 ASSIGNED order: **score = 10**
- Rider with 1 ASSIGNED + 1 PICKED: **score = 15** ❌ (unlikely to get next order)

**Impact**: This is the **most heavily weighted** factor (4.0x) because preventing overload is critical for delivery times.

---

### 2. Daily Distribution Score (Weight: 3.0)

**Purpose**: Ensure fair distribution of orders throughout the day - prevent some riders from getting all orders while others starve.

**Calculation**:
```javascript
averageOrdersToday = totalOrdersCompleted / totalRiders
deviation = rider.ordersCompletedToday - averageOrdersToday
distributionScore = deviation > 0 ? deviation * 5 : 0
```

**Logic**:
- Penalizes riders who are **above average** for the day
- Riders at or below average get **score = 0** (no penalty)
- Each order above average adds 5 points penalty
- Encourages spreading orders across all riders

**Examples** (assume avg = 8 orders/day):
- Rider with 5 orders today: **score = 0** ✅ (no penalty, below average)
- Rider with 8 orders today: **score = 0** (at average)
- Rider with 10 orders today: **score = 10** (2 * 5)
- Rider with 15 orders today: **score = 35** ❌ (7 * 5)

**Impact**: Second most important factor (3.0x) - prevents monopolization and ensures fairness.

---

### 3. Responsiveness Score (Weight: 2.5)

**Purpose**: Reward riders who quickly respond to notifications by opening orders.

**Calculation**:
```javascript
avgResponseSeconds = rider.avgResponseTimeSeconds30d || 60
responsivenessScore = Math.min(avgResponseSeconds / 60, 20)
```

**Logic**:
- Uses 30-day rolling average of time between notification and order opening
- Converted to minutes, capped at **20 points maximum**
- Default is 60 seconds (1 minute) = score of 1.0
- Faster riders get lower scores (better priority)

**Examples**:
- 15 second response time: **score = 0.25** ✅ (very responsive)
- 60 second response time: **score = 1.0** (baseline)
- 5 minute response time: **score = 5.0**
- 30 minute response time: **score = 20.0** ❌ (capped, very slow)

**Impact**: Moderately important (2.5x) - rewards engagement but doesn't dominate other factors.

**Data Source**: Calculated from `Order.riderInteractions` array:
- `seenAt`: When order appeared in rider's list
- `openedAt`: When rider tapped to view details
- Response time = `openedAt - seenAt`

---

### 4. Performance Score (Weight: 2.0)

**Purpose**: Reward riders with consistent acceptance and completion rates.

**Calculation**:
```javascript
acceptanceRate = rider.acceptanceRate30d || 0.5  // default 50%
completionRate = rider.completionRate30d || 0.95 // default 95%

performanceScore = (1 - acceptanceRate) * 10 + (1 - completionRate) * 10
```

**Logic**:
- **Acceptance Rate**: % of notified orders that rider accepts (30-day rolling)
- **Completion Rate**: % of accepted orders that rider completes (30-day rolling)
- Lower rates = higher penalty
- Both factors equally weighted in this component

**Examples**:
- 90% accept, 98% complete: **score = 1.2** ✅ (excellent)
- 50% accept, 95% complete: **score = 5.5** (average)
- 30% accept, 90% complete: **score = 8.0** ❌ (poor acceptance)

**Impact**: Important but not dominant (2.0x) - consistent performance matters but doesn't override fairness.

**Data Source**:
- Calculated from `DispatchRecipient` collection (notified → accepted)
- Calculated from `Order` collection (accepted → delivered)

---

### 5. Proximity Score (Weight: 1.0)

**Purpose**: Consider rider location relative to restaurant pickup location for efficiency.

**Calculation**:
```javascript
distanceKm = haversineDistance(rider.location, order.pickupLocation)
proximityScore = Math.min(distanceKm, 10)
```

**Logic**:
- Uses Haversine formula for accurate geographic distance
- Capped at **10km maximum** (beyond that, all equal)
- If rider location missing: default to **5** (middle score)
- Linear: 1km = 1 point, 5km = 5 points, 10km+ = 10 points

**Examples**:
- 500m away: **score = 0.5** ✅ (very close)
- 3km away: **score = 3.0** (reasonable)
- 15km away: **score = 10.0** ❌ (capped)

**Impact**: Lowest weight (1.0x) - location matters but doesn't dominate fairness or workload considerations.

**Note**: Location data comes from background geolocation tracking (only when rider is "available").

---

### 6. Fairness Bonus (Weight: 1.0)

**Purpose**: Anti-starvation mechanism - boost priority for riders who haven't received orders recently.

**Calculation**:
```javascript
hoursSinceLastOrder = (now - rider.lastOrderAt) / (1000 * 60 * 60)
fairnessScore = hoursSinceLastOrder >= 2 ? -10 : 0
```

**Logic**:
- Riders waiting **2+ hours** get a **-10 bonus** (negative = better priority)
- Riders who recently got orders: **score = 0** (no bonus)
- Binary bonus - either you get it or you don't
- Prevents riders from being completely ignored during busy periods

**Examples**:
- Last order 30 mins ago: **score = 0** (no bonus)
- Last order 1.5 hours ago: **score = 0** (no bonus)
- Last order 2+ hours ago: **score = -10** ✅ (priority boost!)

**Impact**: Equal to proximity (1.0x) - meaningful boost without overwhelming other factors.

**With the -10 bonus applied** (multiplied by 1.0 weight), it effectively reduces the total composite score by 10 points, which is:
- More than a proximity advantage (max 10)
- Equivalent to 2 orders above average in daily distribution
- Similar to having 1 active ASSIGNED order

---

## Composite Score Formula

```javascript
compositeScore = 
  (workloadScore * 4.0) +
  (distributionScore * 3.0) +
  (responsivenessScore * 2.5) +
  (performanceScore * 2.0) +
  (proximityScore * 1.0) +
  (fairnessScore * 1.0)
```

### Score Range

- **Best possible score**: ~-10 (fairness bonus with perfect metrics)
- **Typical good score**: 0-20 (available rider with no active orders)
- **Average score**: 20-50 (some workload or above-average orders)
- **Poor score**: 50+ (overloaded, poor performance, or far away)

---

## Progressive Dispatch Strategy

The scoring system works in conjunction with **progressive notification cycles**:

### Cycle Behavior

1. **First Cycle** (attempt 0):
   - Notify top 1 rider (lowest score)
   - Wait 30 seconds
   
2. **Second Cycle** (attempt 1):
   - Notify top 10 riders (excluding already notified)
   - Wait 30 seconds
   
3. **Third Cycle** (attempt 2):
   - Notify top 15 riders (excluding already notified)
   - Wait 30 seconds
   
4. **Final Cycle** (attempt 3):
   - **Notify ALL available riders** (no filtering, no scoring)
   - Ensures order is never left unassigned

### Why Progressive?

- **Efficiency**: Best riders get first chance
- **Fairness**: If top riders decline, others get opportunity
- **Reliability**: Last cycle ensures coverage

---

## Example Scenarios

### Scenario 1: New Order During Lunch Rush

**Available Riders**:
- **Alice**: 0 active, 5 orders today (avg=8), 20s response, 80% accept, 2km away, last order 10min ago
- **Bob**: 1 PICKED, 12 orders today, 45s response, 95% accept, 1km away, last order 5min ago  
- **Carlos**: 0 active, 3 orders today, 90s response, 60% accept, 4km away, last order 3h ago

**Score Calculations**:

**Alice**:
- Workload: 0 * 4.0 = 0
- Distribution: 0 * 3.0 = 0 (below average)
- Responsiveness: (20/60) * 2.5 = 0.83
- Performance: ((1-0.8)*10 + (1-0.98)*10) * 2.0 = 4.4
- Proximity: 2 * 1.0 = 2
- Fairness: 0 * 1.0 = 0
- **Total: 7.23** ✅ **WINNER**

**Bob**:
- Workload: 5 * 4.0 = 20 (1 PICKED)
- Distribution: (12-8)*5 * 3.0 = 60
- Responsiveness: (45/60) * 2.5 = 1.88
- Performance: ((1-0.95)*10 + (1-0.98)*10) * 2.0 = 1.4
- Proximity: 1 * 1.0 = 1
- Fairness: 0 * 1.0 = 0
- **Total: 84.28** ❌ (busy + too many orders)

**Carlos**:
- Workload: 0 * 4.0 = 0
- Distribution: 0 * 3.0 = 0 (below average)
- Responsiveness: (90/60) * 2.5 = 3.75
- Performance: ((1-0.6)*10 + (1-0.95)*10) * 2.0 = 9.0
- Proximity: 4 * 1.0 = 4
- Fairness: -10 * 1.0 = -10 (2+ hours!)
- **Total: 6.75** ✅✅ **ACTUALLY WINS!** (fairness bonus overcomes poor performance)

**Result**: Carlos gets notified first due to fairness bonus, despite slower response and lower acceptance rate. This is **intentional** - prevents rider starvation.

---

### Scenario 2: Evening Slow Period

**Available Riders**:
- **Diana**: 0 active, 2 orders today (avg=4), 15s response, 90% accept, 3km away, last order 20min ago
- **Erik**: 0 active, 6 orders today (avg=4), 30s response, 85% accept, 1km away, last order 15min ago

**Score Calculations**:

**Diana**:
- Workload: 0
- Distribution: 0 (below average)
- Responsiveness: (15/60) * 2.5 = 0.63
- Performance: ((1-0.9)*10 + (1-0.97)*10) * 2.0 = 2.6
- Proximity: 3
- Fairness: 0
- **Total: 6.23** ✅ **WINNER**

**Erik**:
- Workload: 0
- Distribution: (6-4)*5 * 3.0 = 30 (above average penalty)
- Responsiveness: (30/60) * 2.5 = 1.25
- Performance: ((1-0.85)*10 + (1-0.96)*10) * 2.0 = 3.8
- Proximity: 1
- Fairness: 0
- **Total: 36.05** ❌

**Result**: Diana wins despite being farther away because Erik is above average for the day. Distribution fairness takes precedence.

---

## Data Requirements

### Rider Model Fields (Added)

```javascript
{
  ordersCompletedToday: Number,      // Reset daily at midnight
  ordersAcceptedToday: Number,       // Reset daily at midnight
  ordersNotifiedToday: Number,       // Reset daily at midnight
  acceptanceRate30d: Number,         // Rolling 30-day rate (default: 0.5)
  completionRate30d: Number,         // Rolling 30-day rate (default: 0.95)
  avgResponseTimeSeconds30d: Number, // Rolling 30-day avg (default: 60)
  lastStatsUpdate: Date             // When stats were last calculated
}
```

### Data Collection Points

1. **Order Notification**: Increment `ordersNotifiedToday`
2. **Order Acceptance**: Increment `ordersAcceptedToday`
3. **Order Completion**: Increment `ordersCompletedToday`
4. **Order Viewed**: Record `openedAt` in `riderInteractions`
5. **Location Update**: Update `rider.location` (when available)

### Stats Update Schedule

- **Rolling Stats** (acceptanceRate30d, completionRate30d, avgResponseTimeSeconds30d):
  - Updated every **5-15 minutes** via scheduled job
  - Queries last 30 days of data
  - Cached in rider document to avoid expensive calculations during dispatch

- **Daily Counters** (ordersCompletedToday, etc.):
  - Reset to **0** at midnight via cron job
  - Simple increments during the day

---

## Monitoring & Tuning

### Key Metrics to Track

1. **Order Distribution**:
   - Standard deviation of orders per rider per day
   - Target: Low deviation = fair distribution
   
2. **Response Times**:
   - Average time from notification to acceptance
   - Target: < 2 minutes
   
3. **Assignment Success Rate**:
   - % of orders assigned before final cycle
   - Target: > 90% assigned in first 3 cycles
   
4. **Rider Starvation**:
   - # of riders with 0 orders during peak hours
   - Target: 0 riders with 0 orders during lunch/dinner

### Tuning the Weights

If you observe imbalances, adjust the weights:

```javascript
// Current weights
const weights = {
  workload: 4.0,       // Increase if riders getting overloaded
  distribution: 3.0,   // Increase if some riders dominating
  responsiveness: 2.5, // Increase if slow responses are issue
  performance: 2.0,    // Increase if unreliable riders problematic
  proximity: 1.0,      // Increase if delivery times too long
  fairness: 1.0        // Increase if rider starvation occurring
}
```

**Guidelines**:
- Total weight should stay around 10-15 for interpretability
- Workload should always be highest (prevent overload)
- Distribution should be second (fairness)
- Other factors can be adjusted based on business priorities

---

## Implementation Files

### Core Algorithm
- **`/helpers/rankRiders.js`**: Main scoring orchestration
- **`/helpers/riderScoringHelpers.js`**: Individual scoring functions

### Data Updates
- **`/models/rider.js`**: Enhanced schema with scoring fields
- **`/queues/dispatchRiderQueue.js`**: Progressive notification logic
- **`/graphql/resolvers/rider.js`**: Order acceptance mutations

### Documentation
- **`FAIR_DISPATCH_ALGORITHM.md`**: This file (comprehensive guide)
- **`RIDER_ORDER_VISIBILITY.md`**: Notification-based filtering
- **`IMPLEMENTATION_SUMMARY.md`**: Project overview

---

## Migration Notes

### Existing Riders

When deploying this system, existing riders will have:
- `null` values for new stats fields
- **Default values** will be used:
  - acceptanceRate30d: **0.5** (50% - neutral)
  - completionRate30d: **0.95** (95% - optimistic)
  - avgResponseTimeSeconds30d: **60** (1 min - baseline)

### Gradual Data Population

- Stats will populate over **30 days** as real data accumulates
- First few weeks: Most riders use defaults (fair starting point)
- After 30 days: Real performance data drives scoring
- No manual backfilling required

---

## Future Enhancements

### Potential Additions

1. **Peak Hour Multipliers**: Adjust weights during lunch/dinner rush
2. **Zone-Specific Tuning**: Different weights for high-density vs suburban zones
3. **Customer Rating Integration**: Factor in rider ratings from customers
4. **Weather Adjustments**: Bonus for riders working in bad weather
5. **Vehicle Type Scoring**: Bicycle vs motorcycle vs car optimization
6. **Predictive Workload**: Consider restaurant prep time in workload score

### Advanced Fairness

- **Earnings Equity**: Track and balance daily earnings instead of just order count
- **Skill-Based Routing**: Match complex orders (multiple items, special instructions) to experienced riders
- **Rider Preferences**: Let riders set preferred zones or restaurant types

---

## Conclusion

This enhanced scoring system moves beyond simple "available riders" to a sophisticated, fair, and efficient dispatch algorithm. It:

✅ **Prevents overload** through workload tracking  
✅ **Ensures fairness** through daily distribution  
✅ **Rewards performance** through acceptance/completion rates  
✅ **Values responsiveness** through response time tracking  
✅ **Considers efficiency** through proximity  
✅ **Prevents starvation** through fairness bonus  

The result is a system that keeps riders happy (fair distribution), customers happy (fast deliveries), and restaurants happy (reliable pickups).

**Last Updated**: 2025  
**Version**: 1.0  
**Status**: Production Ready
