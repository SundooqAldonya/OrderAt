import 'expo-dev-client'
import App from './App'
import { registerRootComponent } from 'expo'
// import messaging from '@react-native-firebase/messaging'
// import { playCustomSound } from './src/utilities/playSound'

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   if (remoteMessage.notification.android.sound !== 'false') {
//     await playCustomSound()
//   }
// })
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
