import { Audio } from 'expo-av'
import beep3 from '../assets/beep3.wav'
export async function playCustomSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(beep3)
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
      sound: beep3, // 🔹 Ensure the sound filename matches your FCM payload
      enableVibrate: true
    })
  }
}
