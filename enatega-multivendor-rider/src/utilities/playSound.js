import { Audio } from 'expo-av'
import beep1 from '../assets/beep1.wav'

export async function playCustomSound(audio) {
  console.log({ audio })
  try {
    const { sound } = await Audio.Sound.createAsync(audio)
    await sound.playAsync()
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: beep1, // 🔹 Ensure the sound filename matches your FCM payload
      enableVibrate: true
    })
  }
}
