import { BackHandler } from 'react-native'

let backHandlerSubscription = null

const handleAndroidBackButton = (callback) => {
  backHandlerSubscription = BackHandler.addEventListener(
    'hardwareBackPress',
    () => {
      callback()
      return true
    }
  )
}

const removeAndroidBackButtonHandler = () => {
  if (
    backHandlerSubscription &&
    typeof backHandlerSubscription.remove === 'function'
  ) {
    backHandlerSubscription.remove()
    backHandlerSubscription = null
  }
}

export { handleAndroidBackButton, removeAndroidBackButtonHandler }
