import { useEffect } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { Platform } from 'react-native'
import { saveToken, restaurantInfo } from '../../apollo'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { useTranslation } from 'react-i18next'
import beep1 from '../../assets/beep1.wav'

export default function useNotification() {
  const { t } = useTranslation()
  // get permission
  // request permission
  // send token to backend
  // toggle notification status
  // restaurant current permission on backend

  const { data } = useQuery(
    gql`
      ${restaurantInfo}
    `,
    { fetchPolicy: 'network-only' }
  )

  const [sendTokenToBackend, { loading }] = useMutation(
    gql`
      ${saveToken}
    `
  )

  // useEffect(() => {
  //   registerForPushNotificationsAsync()
  // }, [])

  // async function registerForPushNotificationsAsync() {
  //   if (!Device.isDevice) {
  //     alert(t('notificationText'))
  //   }
  //   if (Platform.OS === 'android') {
  //     Notifications.setNotificationChannelAsync('default', {
  //       name: 'Default Channel',
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [0, 250, 250, 250],
  //       // sound: true,
  //       sound: beep1,
  //       lightColor: '#FF231F7C'
  //     })
  //   }
  // }

  return {
    getPermission: Notifications.getPermissionsAsync,
    requestPermission: Notifications.requestPermissionsAsync,
    getDevicePushTokenAsync: Notifications.getDevicePushTokenAsync,
    sendTokenToBackend,
    restaurantData: data,
    savingToken: loading
  }
}
