import { Audio } from 'expo-av'
import beep1 from '../assets/beep1.wav'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

export async function playCustomSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/beep1.wav')
    )
    await sound.playAsync()
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        sound.unloadAsync()
      }
    })
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

export async function setupNotificationChannel() {
  const newChannelId = 'default_sound4'
  const existingChannel = await Notifications.getNotificationChannelAsync(
    newChannelId
  )

  console.log({ existingChannel })

  if (Platform.OS === 'android') {
    console.log('playing notification')
    await Notifications.setNotificationChannelAsync(newChannelId, {
      name: 'Default Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'beep1', // This must match the filename in res/raw
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
    console.log('finished notifications')
  }
}
