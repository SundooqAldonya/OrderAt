// // Handle notification taps
// const handleNotification = useCallback(async response => {
//   if (
//     response &&
//     response.notification &&
//     response.notification.request &&
//     response.notification.request.content &&
//     response.notification.request.content.data
//   ) {
//     const { _id } = response.notification.request.content.data
//     const { data } = await client.query({
//       query: gql`
//         ${riderOrders}
//       `,
//       fetchPolicy: 'network-only'
//     })
//     const order = data.riderOrders.find(o => o._id === _id)
//     const lastNotificationHandledId = await AsyncStorage.getItem(
//       '@lastNotificationHandledId'
//     )
//     if (lastNotificationHandledId === _id) return
//     await AsyncStorage.setItem('@lastNotificationHandledId', _id)
//     navigationService.navigate('OrderDetail', {
//       itemId: _id,
//       order
//     })
//   }
// }, [])

// // Set notification handler globally
// // useEffect(() => {
// //   Notifications.setNotificationHandler({
// //     handleNotification: async () => ({
// //       shouldShowAlert: true,  // Allow notifications to show
// //       shouldPlaySound: true,
// //       shouldSetBadge: true
// //     }),
// //   });
// // }, []);

// useEffect(() => {
//   async function getToken() {
//     const { data } = await Notifications.getExpoPushTokenAsync()
//     console.log('Notification Token:', data)
//   }
//   getToken()
// }, [])

// // Listen for notification taps
// useEffect(() => {
//   const subscription = Notifications.addNotificationResponseReceivedListener(
//     handleNotification
//   )
//   return () => subscription.remove()
// }, [handleNotification])

// // Register for push notifications.
// useEffect(() => {
//   async function registerForPushNotificationsAsync() {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync()
//     let finalStatus = existingStatus

//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync()
//       finalStatus = status
//     }

//     if (finalStatus === 'granted') {
//       const { data: fcmToken } = await Notifications.getDevicePushTokenAsync()
//       console.log('FCM Token:', fcmToken)
//       Notifications.setNotificationHandler({
//         handleNotification: async notification => {
//           return {
//             shouldShowAlert: true, // Prevent the app from closing
//             shouldPlaySound: true,
//             shouldSetBadge: true
//           }
//         }
//       })
//     }
//   }

//   registerForPushNotificationsAsync()
// }, [])
