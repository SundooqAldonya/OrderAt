# Rider Interaction Tracking - Comprehensive Analysis

## Executive Summary

This document provides a comprehensive analysis of rider interaction tracking within the OrderAt system, covering location tracking, order engagement metrics, and activity monitoring used for rider ranking and dispatch optimization.

---

## 1. Location Tracking Implementation

### 1.1 Technology Stack
- **Service**: Transistor Software's `react-native-background-geolocation`
- **Implementation File**: `enatega-multivendor-rider/src/utilities/transistorBackgroundTracking.js`
- **Backend Endpoint**: `updateRiderLocation` mutation

### 1.2 Current Implementation ✅

#### Rider App (Background Tracking)
```javascript
// File: transistorBackgroundTracking.js

BackgroundGeolocation.ready({
  reset: true,
  debug: false,
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  distanceFilter: 5, // meters
  stopOnTerminate: true,
  startOnBoot: false,
  foregroundService: true,
  notification: {
    title: 'Tracking location',
    text: 'Your location is being used',
    priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_MIN
  }
})
```

**Features Implemented:**
- ✅ Background location tracking with high accuracy
- ✅ 5-meter distance filter (updates every 5m movement)
- ✅ Persistent foreground notification (Android)
- ✅ Automatic stop on app termination
- ✅ Location sent to backend via GraphQL mutation
- ✅ Token-based authentication

**Location Update Flow:**
1. Transistor detects location change (5m+ movement)
2. Retrieves rider token from AsyncStorage
3. Sends `updateRiderLocation` mutation to backend
4. Backend updates `rider.location` and `rider.lastUpdatedLocationDate`
5. Publishes location to WebSocket subscribers

#### Backend (Location Processing)
```javascript
// File: graphql/resolvers/rider.js

updateRiderLocation: async (_, args, { req }) => {
  const rider = await Rider.findById(req.userId)
  const location = new Point({
    coordinates: [args.longitude, args.latitude]
  })
  rider.location = location
  rider.lastUpdatedLocationDate = new Date()
  await rider.save()
  
  publishRiderLocation({ // WebSocket broadcast
    ...result._doc,
    _id: result.id,
    location: location
  })
}
```

**Database Fields:**
- `rider.location` (GeoJSON Point) - Current GPS coordinates
- `rider.lastUpdatedLocationDate` (Date) - Last location update timestamp

### 1.3 Location Permission Enforcement

#### Current Status: ⚠️ **PARTIAL IMPLEMENTATION**

**What's Implemented:**
- ✅ Location permission check on app launch
- ✅ Dedicated permission screen (`LocationPermissions.js`)
- ✅ Permission gating (app won't proceed without location access)
- ✅ Foreground location permission required
- ✅ Auto-redirect to settings if permission denied

**Implementation:**
```javascript
// File: context/location.js
const getLocationPermission = async() => {
  const { status } = await Location.getForegroundPermissionsAsync()
  if (status === 'granted') {
    setLocationPermission(true)
  }
}

// App routing prevents access without permission
return locationPermission ? (
  <AuthStack /> 
) : (
  <LocationPermissionScreen />
)
```

**What's Missing:**
- ❌ **No background location permission enforcement** (only foreground)
- ❌ **No runtime permission monitoring** (rider can revoke while app running)
- ❌ **No "Always Allow" enforcement** (should require "Always" not just "While Using")
- ❌ **No periodic permission re-checks**
- ❌ **No backend-side location freshness validation**

---

## 2. Order Notification Receipt Tracking

### 2.1 Current Implementation ✅

**Model: DispatchRecipient**
```javascript
// File: models/DispatchRecipient.js
{
  order: ObjectId,
  rider: ObjectId,
  cycle: Number,              // Which dispatch cycle
  status: String,             // 'pending', 'sent', 'accepted', 'rejected', 'timeout', 'failed'
  notifiedAt: Date,           // ✅ When notification was sent
  respondedAt: Date,          // When rider accepted/rejected
  notification: ObjectId      // Reference to Notification document
}
```

**Notification Flow:**
1. **Dispatch Queue**: `queues/dispatchRiderQueue.js` selects riders
2. **Send Notifications**: `helpers/findRiders.js::sendNotificationToRiders()`
3. **Create DispatchRecipient Records**: Uses `bulkWrite` with `upsert`
4. **Track Status**: Updates status based on FCM response

```javascript
// When notifications sent
const ops = selected.map(r => ({
  updateOne: {
    filter: { rider: r._id, order: orderId },
    update: { 
      $setOnInsert: { 
        status: 'pending', 
        cycle: attempt + 1,
        notifiedAt: new Date() // ✅ Timestamp recorded
      } 
    },
    upsert: true
  }
}))
await DispatchRecipient.bulkWrite(ops)
```

**What's Tracked:**
- ✅ Which riders were notified for each order
- ✅ When they were notified (`notifiedAt`)
- ✅ Which dispatch cycle they were included in
- ✅ Notification delivery status (pending/sent/failed)
- ✅ FCM token used for notification

**What's NOT Tracked:**
- ❌ **Client-side notification receipt confirmation** (no acknowledgment from rider app)
- ❌ **Notification tap events** (when rider taps notification)
- ❌ **Notification dismiss events**
- ❌ **Time between notification sent and rider opened order**

---

## 3. Order Open/View Tracking

### 3.1 Current Implementation ✅

**Model: Order.riderInteractions**
```javascript
// File: models/order.js
riderInteractions: [
  {
    rider: ObjectId,
    seenAt: Date,        // ❌ NOT USED (placeholder)
    openedAt: Date       // ✅ IMPLEMENTED
  }
]
```

**Rider App Tracking:**
```javascript
// File: components/Order/Order.js

const [mutateOpened] = useMutation(orderOpenedByRider)

const handlePress = async id => {
  mutateOpened({
    variables: {
      id,
      riderId: dataProfile?.rider?._id
    }
  })
  navigation.navigate('OrderDetail', { order })
}
```

**Backend Mutation:**
```javascript
// File: graphql/resolvers/order.js

orderOpenedByRider: async (_, args) => {
  await Order.updateOne(
    { _id: args.id, 'riderInteractions.rider': args.riderId },
    { $set: { 'riderInteractions.$.openedAt': new Date() } }
  )
}
```

**What's Tracked:**
- ✅ Which riders opened each order
- ✅ Exact timestamp when order was opened
- ✅ Multiple riders can open the same order (array of interactions)

**What's NOT Tracked:**
- ❌ **`seenAt` field is defined but never populated** (should track when order appeared in list)
- ❌ **Time spent viewing order details**
- ❌ **Number of times rider viewed the order**
- ❌ **Whether rider scrolled to see full order details**

**Usage in Ranking:**
- ❌ **NOT currently used in rider ranking algorithm**
- ⚠️ This data is collected but not leveraged for dispatch optimization

---

## 4. Rider Activity & App State Tracking

### 4.1 Rider Activity Tracking ✅

**Model Fields (Rider):**
```javascript
// File: models/rider.js
{
  lastOrderAt: Date,     // ✅ Updated when rider assigned order
  lastActiveAt: Date,    // ✅ Updated on app state changes
  available: Boolean,    // Manual toggle by rider
  isActive: Boolean,     // Account active status
  isOnline: Boolean      // Currently logged in
}
```

**Activity Tracking Implementation:**
```javascript
// File: utilities/useRiderAppState.js

useEffect(() => {
  const subscription = AppState.addEventListener('change', nextState => {
    if (nextState === 'active') {
      mutateAvailable({ variables: { available: true } })
    }
  })
}, [])
```

**Backend Update:**
```javascript
// File: graphql/resolvers/rider.js

updateRiderStatus: async (_, args, { req }) => {
  await Rider.findByIdAndUpdate(req.userId, { 
    lastActiveAt: new Date() 
  })
}
```

**What's Tracked:**
- ✅ **App foreground events** (`lastActiveAt` updated when app becomes active)
- ✅ **Last order assignment time** (`lastOrderAt`)
- ✅ **Rider availability status** (manual toggle)

**What's NOT Tracked:**
- ❌ **App background events** (when app goes to background)
- ❌ **Session duration** (how long rider stays in app)
- ❌ **App opens per day**
- ❌ **Time spent in background between sessions**
- ❌ **Idle time detection** (rider has app open but not interacting)

### 4.2 Main App State Monitoring

**Implementation:**
```javascript
// File: App.js

useEffect(() => {
  const handleAppStateChange = nextAppState => {
    if (appState.current.match(/inactive|background/) && 
        nextAppState === 'active') {
      console.log('🔄 App resumed. Listening to network changes...')
      
      NetInfo.addEventListener(state => {
        if (state.isConnected) {
          client.reFetchObservableQueries() // Refresh data
        }
      })
    }
    appState.current = nextAppState
  }

  const subscription = AppState.addEventListener('change', handleAppStateChange)
  return () => subscription.remove()
}, [])
```

**What's Tracked:**
- ✅ App foreground/background transitions
- ✅ Network connectivity changes on resume
- ✅ GraphQL query refetch on app resume

**What's NOT Tracked:**
- ❌ **Background duration** (not sent to backend)
- ❌ **Kill/restart detection**
- ❌ **Battery optimization interference**

---

## 5. Rider Ranking Algorithm

### 5.1 Current Implementation ✅

**File:** `helpers/rankRiders.js`

**Algorithm:**
```javascript
async function rankRiders({ log, riders, alreadyNotifiedRiderIds, attempt }) {
  const ridersWithScores = await Promise.all(
    candidateRiders.map(async rider => {
      // 1. Active orders (currently assigned)
      const activeOrders = await Order.countDocuments({
        rider: rider._id,
        orderStatus: 'ASSIGNED'
      })
      
      // 2. Recent order activity (last 60 min)
      const ordersLast60Min = 
        rider.lastOrderAt && (now - rider.lastOrderAt) <= 60*60*1000 ? 1 : 0
      
      // 3. App activity recency (minutes since last active)
      const lastActiveMinutesAgo = rider.lastActiveAt
        ? Math.floor((now - rider.lastActiveAt) / 60000)
        : Infinity
      
      // COMPOSITE SCORE (lower = better)
      const score = 
        (activeOrders * 3) + 
        (ordersLast60Min * 2) + 
        (lastActiveMinutesAgo / 30)
      
      return { rider, score }
    })
  )
  
  return ridersWithScores.sort((a, b) => a.score - b.score)
}
```

**Ranking Factors (Weighted):**
1. **Active Orders** (weight: 3) - Lower workload = higher priority
2. **Recent Orders** (weight: 2) - Recent activity = lower priority (let them rest)
3. **App Activity Recency** (weight: 1/30) - Recently active = higher priority

**What's Used:**
- ✅ `lastOrderAt` - Recent order assignments
- ✅ `lastActiveAt` - App foreground activity
- ✅ Active order count (live query)

**What's NOT Used:**
- ❌ `openedAt` from riderInteractions (order view tracking)
- ❌ Notification receipt timestamps
- ❌ Order acceptance rate
- ❌ Average response time
- ❌ Location proximity to pickup
- ❌ Rider rating/performance metrics
- ❌ Historical acceptance patterns

---

## 6. Summary: What's Implemented vs What's Missing

### ✅ Fully Implemented

1. **Location Tracking**
   - Background GPS tracking via Transistor
   - Real-time location updates to backend
   - Location timestamp tracking
   - WebSocket location broadcasting

2. **Notification Tracking**
   - DispatchRecipient records for all notifications
   - Notification timestamp (`notifiedAt`)
   - Dispatch cycle tracking
   - FCM delivery status

3. **Order Open Tracking**
   - `openedAt` timestamp when rider views order
   - Multiple rider interactions per order
   - GraphQL mutation in place

4. **Basic Activity Tracking**
   - `lastActiveAt` on app foreground
   - `lastOrderAt` on order assignment
   - Rider ranking uses these timestamps

### ⚠️ Partially Implemented

1. **Location Permission Enforcement**
   - ✅ Foreground permission required
   - ❌ Background "Always Allow" not enforced
   - ❌ No runtime permission monitoring
   - ❌ No backend validation of location freshness

2. **App State Tracking**
   - ✅ Foreground events tracked
   - ❌ Background events not tracked
   - ❌ Session duration not measured
   - ❌ No idle detection

3. **Order Engagement**
   - ✅ Order open timestamp
   - ❌ `seenAt` field unused
   - ❌ View duration not tracked
   - ❌ Not used in ranking algorithm

### ❌ Not Implemented

1. **Client-Side Notification Acknowledgment**
   - No confirmation when rider receives notification
   - No tracking of notification tap vs app open

2. **Advanced Activity Metrics**
   - No session duration tracking
   - No idle time detection
   - No app opens per day counter
   - No background duration measurement

3. **Performance Metrics for Ranking**
   - Order acceptance rate not tracked
   - Average response time not measured
   - Location proximity not factored
   - Historical patterns not analyzed

4. **Location Enforcement**
   - No "Always Allow" requirement
   - No location staleness detection
   - No automatic rider de-activation for stale location

---

## 7. Recommendations for Improvement

### 7.1 Critical (Implement First)

1. **Enforce "Always Allow" Location Permission**
   ```javascript
   // Check for background permission
   const { status } = await Location.getBackgroundPermissionsAsync()
   if (status !== 'granted') {
     // Block rider from going online
     // Show modal: "Background location required"
   }
   ```

2. **Backend Location Freshness Validation**
   ```javascript
   // In dispatch queue - filter out riders with stale locations
   const fifteenMinutesAgo = new Date(Date.now() - 15*60*1000)
   const riders = await Rider.find({
     zone: order.zone,
     available: true,
     lastUpdatedLocationDate: { $gte: fifteenMinutesAgo } // ⬅️ NEW
   })
   ```

3. **Use `openedAt` Data in Ranking**
   ```javascript
   // Add engagement score based on how often rider opens orders
   const recentOpens = await Order.countDocuments({
     'riderInteractions': {
       $elemMatch: {
         rider: rider._id,
         openedAt: { $gte: thirtyMinutesAgo }
       }
     }
   })
   score -= recentOpens // Reward engaged riders
   ```

### 7.2 High Priority

4. **Implement Client-Side Notification Receipt**
   ```javascript
   // In rider app notification handler
   Notifications.addNotificationReceivedListener(notification => {
     // Send acknowledgment to backend
     mutateNotificationReceived({
       variables: {
         orderId: notification.data.orderId,
         riderId: currentRider._id,
         receivedAt: new Date()
       }
     })
   })
   ```

5. **Track Background Events**
   ```javascript
   // In useRiderAppState.js
   if (nextState === 'background') {
     mutateAppState({
       variables: {
         state: 'background',
         timestamp: new Date()
       }
     })
   }
   ```

6. **Add Response Time Metrics**
   ```javascript
   // Calculate: notifiedAt → openedAt → respondedAt
   const responseTime = openedAt - notifiedAt
   // Use in ranking: faster responders get priority
   ```

### 7.3 Medium Priority

7. **Populate `seenAt` Field**
   ```javascript
   // When order appears in rider's list
   await Order.updateOne(
     { _id: orderId },
     { 
       $push: { 
         riderInteractions: {
           rider: riderId,
           seenAt: new Date() // ⬅️ Track list view
         }
       }
     }
   )
   ```

8. **Add Acceptance Rate Tracking**
   ```javascript
   // New Rider fields
   {
     totalNotifications: Number,
     totalAccepted: Number,
     acceptanceRate: Number  // totalAccepted / totalNotifications
   }
   ```

9. **Session Duration Tracking**
   ```javascript
   // Track active session time
   {
     sessionStart: Date,
     totalActiveMinutesToday: Number,
     averageSessionDuration: Number
   }
   ```

### 7.4 Low Priority (Nice to Have)

10. **Proximity-Based Ranking**
    ```javascript
    // Factor in distance to pickup location
    const distance = haversineDistance(rider.location, order.pickupLocation)
    score += distance * 0.5 // Closer = better score
    ```

11. **Idle Detection**
    ```javascript
    // Detect if app is open but rider inactive
    let lastInteractionTime = Date.now()
    AppState.addEventListener('touch', () => {
      lastInteractionTime = Date.now()
    })
    ```

12. **Historical Performance Metrics**
    - Average delivery time
    - Customer ratings
    - Completion rate
    - Peak hour availability

---

## 8. Data Flow Diagrams

### Current Order Notification Flow
```
1. Order Created (ACCEPTED status)
   ↓
2. Dispatch Queue Triggered
   ↓
3. rankRiders() - Score riders using:
   - activeOrders (DB query)
   - lastOrderAt (Rider field)
   - lastActiveAt (Rider field)
   ↓
4. Select Top N Riders (1, 10, 15 by cycle)
   ↓
5. sendNotificationToRiders()
   - Create DispatchRecipient records
   - Set notifiedAt timestamp
   - Send FCM notifications
   ↓
6. Rider App Receives Notification
   - Play sound (tracked in app)
   - Show in notification tray
   ↓
7. Rider Taps Order in App
   - Call orderOpenedByRider mutation
   - Set openedAt timestamp
   ↓
8. Rider Accepts/Rejects Order
   - Update DispatchRecipient.status
   - Set respondedAt timestamp
```

### Location Tracking Flow
```
1. Rider Logs In
   ↓
2. Check Location Permission
   - If denied → LocationPermission screen
   - If granted → Continue
   ↓
3. initBackgroundLocation()
   - Configure Transistor with 5m filter
   - Start tracking
   ↓
4. Rider Moves 5+ Meters
   ↓
5. Transistor Triggers Location Event
   ↓
6. Send updateRiderLocation Mutation
   - Update rider.location (GeoJSON)
   - Update lastUpdatedLocationDate
   ↓
7. publishRiderLocation() via WebSocket
   - Customer/Restaurant apps subscribe
   - See rider on map in real-time
```

---

## 9. Database Schema Impact

### Current Schema
```javascript
// Rider
{
  location: Point,
  lastUpdatedLocationDate: Date,
  lastOrderAt: Date,
  lastActiveAt: Date,
  available: Boolean,
  isActive: Boolean,
  isOnline: Boolean
}

// Order
{
  riderInteractions: [{
    rider: ObjectId,
    seenAt: Date,      // ⚠️ UNUSED
    openedAt: Date     // ✅ USED
  }],
  eligibleRiders: [ObjectId]  // NEW (from our recent feature)
}

// DispatchRecipient
{
  order: ObjectId,
  rider: ObjectId,
  cycle: Number,
  status: String,
  notifiedAt: Date,
  respondedAt: Date
}
```

### Recommended Additions
```javascript
// Rider - Add engagement metrics
{
  totalNotificationsReceived: Number,
  totalOrdersAccepted: Number,
  totalOrdersViewed: Number,
  acceptanceRate: Number,
  averageResponseTimeSeconds: Number,
  sessionStartTime: Date,
  totalActiveMinutesToday: Number
}

// Order.riderInteractions - Use seenAt
{
  seenAt: Date,          // ⬅️ Populate when order appears in list
  notificationReceivedAt: Date,  // ⬅️ Add client-side receipt
  viewDurationSeconds: Number    // ⬅️ Track engagement
}

// New: RiderSession model
{
  rider: ObjectId,
  sessionStart: Date,
  sessionEnd: Date,
  durationMinutes: Number,
  appState: String,  // 'active', 'background', 'terminated'
  ordersAccepted: Number
}
```

---

## 10. Performance Considerations

### Current Performance
- ✅ Location updates: ~Every 5 meters (efficient)
- ✅ Ranking query: Single aggregate query per dispatch
- ✅ DispatchRecipient: Indexed on `{ rider: 1, order: 1 }`

### Potential Issues
- ⚠️ Ranking algorithm queries `Order` collection for each rider (N+1 problem)
- ⚠️ No caching of rider scores
- ⚠️ Location updates happen even when rider unavailable

### Optimization Recommendations
1. **Cache Rider Scores**
   ```javascript
   // Update rider.engagementScore periodically (every 5 min)
   // Use cached value in ranking instead of live calculation
   ```

2. **Batch Active Order Counts**
   ```javascript
   // Single aggregation query instead of per-rider queries
   const activeCounts = await Order.aggregate([
     { $match: { orderStatus: 'ASSIGNED' } },
     { $group: { _id: '$rider', count: { $sum: 1 } } }
   ])
   ```

3. **Stop Location Tracking When Unavailable**
   ```javascript
   // In toggleAvailability mutation
   if (!args.available) {
     // Tell rider app to pause Transistor tracking
     await stopBackgroundLocation()
   }
   ```

---

## Conclusion

**Overall Assessment: 70% Complete**

The system has solid foundations for rider tracking but lacks enforcement and full utilization of collected data:

**Strengths:**
- Robust location tracking infrastructure
- Comprehensive notification logging
- Basic activity tracking in place
- Data collection is happening

**Weaknesses:**
- Location permission not strictly enforced ("Always Allow" missing)
- Collected engagement data (`openedAt`) not used in ranking
- No client-side notification receipt confirmation
- Limited app state tracking (foreground only)
- Missing performance metrics for optimization

**Priority Actions:**
1. Enforce background location permissions
2. Validate location freshness in dispatch queue
3. Integrate `openedAt` data into ranking algorithm
4. Add notification receipt tracking
5. Track background/foreground events

This will create a complete feedback loop: track rider behavior → use data for smarter dispatch → reward engaged/active riders with more orders.
