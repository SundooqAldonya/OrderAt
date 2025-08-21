// // backgroundLocationTask.js
// import * as TaskManager from 'expo-task-manager'
// import * as Location from 'expo-location'
// import { updateLocation } from '../apollo/mutations'
// import { gql } from '@apollo/client'
// import { request } from 'graphql-request'
// import { getEnvVars } from '../../env_background'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// export const LOCATION_TASK_NAME = 'background-location-task'
// const { GRAPHQL_URL } = getEnvVars()

// const SEND_LOCATION_MUTATION = gql`
//   ${updateLocation}
// `

// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
//   if (error) {
//     console.error('Background location task error:', error)
//     return
//   }

//   if (data) {
//     const { locations } = data
//     const location = locations[0]
//     console.log('📍 Background location:', location)
//     const coords = location.coords
//     const token = await AsyncStorage.getItem('rider-token')
//     console.log({ token })
//     try {
//       if (token) {
//         const res = await request(
//           GRAPHQL_URL,
//           SEND_LOCATION_MUTATION,
//           {
//             latitude: String(coords.latitude),
//             longitude: String(coords.longitude),
//             tracking: 'true'
//             //   heading: coords.heading,
//             //   speed: coords.speed,
//             //   timestamp: location.timestamp
//           },
//           {
//             Authorization: `Bearer ${token}`
//           }
//         )
//         console.log('✅ Location sent successfully:', res)
//       } else {
//         console.log('Rider is not logged in')
//       }
//     } catch (err) {
//       console.warn('❌ Failed to send location to server:', err)
//     }
//   }
// })

// export async function startBackgroundUpdate() {
//   const {
//     status: foregroundStatus
//   } = await Location.requestForegroundPermissionsAsync()
//   if (foregroundStatus !== 'granted') {
//     throw new Error('Foreground location permission not granted')
//   }

//   const {
//     status: backgroundStatus
//   } = await Location.requestBackgroundPermissionsAsync()
//   if (backgroundStatus !== 'granted') {
//     throw new Error('Background location permission not granted')
//   }

//   const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//     LOCATION_TASK_NAME
//   )
//   if (!hasStarted) {
//     await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//       accuracy: Location.Accuracy.High,
//       timeInterval: 30000, // 30 seconds
//       distanceInterval: 20, // 20 meters
//       deferredUpdatesDistance: 20,
//       deferredUpdatesInterval: 30000,
//       showsBackgroundLocationIndicator: true, // iOS
//       foregroundService: {
//         notificationTitle: 'Tracking location',
//         notificationBody: 'Your location is being used',
//         notificationColor: '#229F48'
//       }
//     })
//   }
// }

// export async function stopBackgroundUpdate() {
//   const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//     LOCATION_TASK_NAME
//   )
//   if (hasStarted) {
//     await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
//     console.log('Stopped tracking location')
//   }
// }
