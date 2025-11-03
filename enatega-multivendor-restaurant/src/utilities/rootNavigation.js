import { createNavigationContainerRef } from '@react-navigation/native'

export const navigationRef = createNavigationContainerRef()

export function navigate(name, params) {
  console.log('before sending to PrinterSettings screen')
  if (navigationRef.isReady()) {
    console.log('sending to PrinterSettings screen')
    navigationRef.navigate(name, params)
  }
}
