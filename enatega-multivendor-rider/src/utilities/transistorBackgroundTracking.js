// backgroundLocationService.js
import BackgroundGeolocation from 'react-native-background-geolocation'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { gql } from '@apollo/client'
import { request } from 'graphql-request'
import { getEnvVars } from '../../env_background'
import { updateLocation } from '../apollo/mutations'

const { GRAPHQL_URL } = getEnvVars()
const SEND_LOCATION_MUTATION = gql`
  ${updateLocation}
`

let initialized = false

export async function initBackgroundLocation() {
  if (initialized) return
  initialized = true

  // Register location listener
  BackgroundGeolocation.onLocation(async location => {
    console.log('📍 Transistor location:', location)

    const { latitude, longitude } = location.coords
    const token = await AsyncStorage.getItem('rider-token')

    if (!token) {
      console.log('Rider not logged in, skipping location update')
      return
    }

    try {
      const res = await request(
        GRAPHQL_URL,
        SEND_LOCATION_MUTATION,
        {
          latitude: String(latitude),
          longitude: String(longitude),
          tracking: 'true'
        },
        {
          Authorization: `Bearer ${token}`
        }
      )
      console.log('✅ Location sent:', res)
    } catch (err) {
      console.warn('❌ Failed to send location:', err)
    }
  })

  BackgroundGeolocation.onMotionChange(event => {
    console.log('[onMotionChange]', event.isMoving, event.location)
  })

  // Configure plugin
  BackgroundGeolocation.ready({
    reset: true,
    debug: false,
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 5,
    stopOnTerminate: true,
    startOnBoot: false,
    foregroundService: true,
    notification: {
      title: 'Tracking location',
      text: 'Your location is being used',
      color: '#229F48',
      priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_MIN
    }
  }).then(state => {
    console.log('[ready] BackgroundGeolocation is ready:', state.enabled)
    if (!state.enabled) {
      BackgroundGeolocation.start()
    }
  })
}

export async function stopBackgroundLocation() {
  BackgroundGeolocation.stop()
  BackgroundGeolocation.removeListeners()
  // await BackgroundGeolocation.ready({
  //   reset: true,
  //   stopOnTerminate: true,
  //   startOnBoot: false
  // })
  initialized = false
  console.log('Stopped Transistor background tracking')
}

// // backgroundLocationService.js
// import BackgroundGeolocation from 'react-native-background-geolocation'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { gql } from '@apollo/client'
// import { request } from 'graphql-request'
// import { getEnvVars } from '../../env_background'
// import { updateLocation } from '../apollo/mutations'

// const { GRAPHQL_URL } = getEnvVars()
// const SEND_LOCATION_MUTATION = gql`
//   ${updateLocation}
// `

// export async function initBackgroundLocation() {
//   // Register location listener
//   BackgroundGeolocation.onLocation(async location => {
//     console.log('📍 Transistor location:', location)

//     const { latitude, longitude } = location.coords
//     const token = await AsyncStorage.getItem('rider-token')

//     if (!token) {
//       console.log('Rider not logged in, skipping location update')
//       return
//     }

//     try {
//       const res = await request(
//         GRAPHQL_URL,
//         SEND_LOCATION_MUTATION,
//         {
//           latitude: String(latitude),
//           longitude: String(longitude),
//           tracking: 'true'
//         },
//         {
//           Authorization: `Bearer ${token}`
//         }
//       )
//       console.log('✅ Location sent:', res)
//     } catch (err) {
//       console.warn('❌ Failed to send location:', err)
//     }
//   })

//   // Optional motion change listener
//   BackgroundGeolocation.onMotionChange(event => {
//     console.log('[onMotionChange]', event.isMoving, event.location)
//   })

//   // Configure plugin
//   BackgroundGeolocation.ready({
//     reset: true,
//     debug: false,
//     desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//     distanceFilter: 5, // every 20 meters
//     stopOnTerminate: false, // continue after app killed
//     startOnBoot: true, // continue after device restart
//     foregroundService: true, // Android notification
//     notification: {
//       title: 'Tracking location',
//       text: 'Your location is being used',
//       color: '#229F48',
//       priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_MIN
//       // sticky: true
//     }
//   })
//     .then(state => {
//       console.log('[ready] BackgroundGeolocation is ready:', state.enabled)

//       if (!state.enabled) {
//         BackgroundGeolocation.start() // start tracking
//       }
//     })
//     .catch(err => {
//       console.log({ err })
//     })
// }

// export function stopBackgroundLocation() {
//   BackgroundGeolocation.stop()
//   BackgroundGeolocation.removeListeners()
//   console.log('Stopped Transistor background tracking')
// }
