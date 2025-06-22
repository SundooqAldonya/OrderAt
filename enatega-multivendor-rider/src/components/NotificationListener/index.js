import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'
import UserContext from '../../context/user'
import { refreshFirebaseToken } from '../../apollo/mutations'
import messaging from '@react-native-firebase/messaging'
import { useMutation } from '@apollo/client'
import { AuthContext } from '../../context/auth'
import * as Notifications from 'expo-notifications'
import { setupNotificationChannel } from '../../utilities/pushNotifications'
import { Toast } from 'toastify-react-native'
import { playCustomSound } from '../../utilities/playSound'

const NotificationListener = () => {
  // const { token } = useContext(AuthContext)

  const { refetchAssigned } = useContext(UserContext)

  const [mutateRefreshToken] = useMutation(refreshFirebaseToken, {
    onCompleted: res => {
      console.log({ res })
    },
    onError: error => {
      console.log({ error })
    }
  })

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(token => {
      // ✅ Send this new token to your backend
      mutateRefreshToken({
        variables: {
          notificationToken: token
        }
      })
      console.log('FCM Token refreshed:', token)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    async function checkPermissions() {
      const { status } = await Notifications.getPermissionsAsync()
      console.log('🔍 Notification permission status:', status)

      if (status !== 'granted') {
        console.log(
          '⚠️ Notifications are not enabled, requesting permission...'
        )
        const {
          status: newStatus
        } = await Notifications.requestPermissionsAsync()
        console.log('🔍 New notification status:', newStatus)
      }
    }

    checkPermissions()
  }, [])

  useEffect(() => {
    setupNotificationChannel()
  }, [])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      refetchAssigned()
      Toast.info(remoteMessage.notification.body)
      const sound = remoteMessage?.notification?.android?.sound
        ? remoteMessage.notification.android.sound
        : null
      if (sound !== 'false') {
        playCustomSound()
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      refetchAssigned()
    })

    return unsubscribe
  }, [])
  return null
}

export default NotificationListener
