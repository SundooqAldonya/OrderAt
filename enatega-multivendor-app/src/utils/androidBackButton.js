// packages
import { useTranslation } from 'react-i18next'
import { BackHandler, Alert, StyleSheet } from 'react-native'

// const { t } = useTranslation()

const handleAndroidBackButton = (callback) => {
  BackHandler.addEventListener('hardwareBackPress', () => {
    callback()
    return true
  })
}

const removeAndroidBackButtonHandler = () => {
  BackHandler.removeEventListener('hardwareBackPress')
}
// const exitAlert = () => {
//   Alert.alert('Confirm exit', 'Do you want to quit the app?', [
//     { text: 'CANCEL', style: 'cancel' },
//     {
//       text: 'OK',
//       onPress: () => {
//         BackHandler.exitApp()
//       }
//     }
//   ])
//   return true
// }
const exitAlert = () => {

  Alert.alert(
      'Confirm exit',
      'Do you want to quit the app',
      [
          {
              text: 'Cancel',
              style: 'cancel',
              style: styles.cancelButton
          },
          {
              text: 'okText',
              onPress: () => BackHandler.exitApp(),
              style: styles.confirmButton
          }
      ],
      {
          cancelable: false,
          containerStyle: styles.alertContainer,
          titleStyle: styles.titleStyle,
          messageStyle: styles.messageStyle
      }
  );
  return true;
}
const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8
  },
  messageStyle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20
  },
  cancelButton: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 16
  },
  confirmButton: {
    color: '#06C167', // Uber Eats green color
    fontWeight: 'bold',
    fontSize: 16
  }
})

export { handleAndroidBackButton, removeAndroidBackButtonHandler, exitAlert }
