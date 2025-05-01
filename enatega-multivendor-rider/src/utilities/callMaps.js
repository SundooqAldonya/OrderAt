import { Alert, Linking, Platform } from 'react-native'

export const openGoogleMaps = ({ latitude, longitude }) => {
  // const url =
  //   Platform.OS === 'ios'
  //     ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  //     : `geo:${latitude},${longitude}`
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        const geoUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        Linking.openURL(geoUrl).catch(err => {
          Alert.alert(
            'Maps Not Supported',
            'Google Maps or a compatible app is not available on this device.'
          )
        })
      }
    })
    .catch(err => console.error('An error occurred', err))
}
