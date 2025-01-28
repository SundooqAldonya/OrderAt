import { Linking, Alert, Platform } from 'react-native'
import * as Clipboard from 'expo-clipboard'

export const callNumber = phone => {
  let phoneNumber =
    Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`

  Linking.canOpenURL(phoneNumber)
    .then(supported => {
      console.log({ supported })
      if (!supported) {
        Clipboard.setStringAsync(phone).then(() => {
          Alert.alert(
            'Copied the phone number',
            'This device cannot make calls. The phone number has been copied to your clipboard.'
          )
        })
      } else {
        return Linking.openURL(phoneNumber).catch(err =>
          console.error('Failed to open phone dialer', err)
        )
      }
    })
    .catch(err => {
      console.log(err)
      Alert.alert(
        'Error',
        'An unexpected error occurred while trying to make the call'
      )
    })
}
