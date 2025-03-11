import * as Notifications from 'expo-notifications'
import beep1 from '../assets/beep1.wav'

export const testingNotifications = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Local Test',
      body: 'Checking notification sound',
      sound: beep1 // Test if custom sound works
    },
    trigger: { seconds: 1 }
  })
}
