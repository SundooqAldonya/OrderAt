import React, { useContext, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import MainStack from './mainStack'
import AuthStack from './authStack'
import { AuthContext } from '../ui/context'
import * as Sentry from '@sentry/react-native'
import getEnvVars from '../../environment'
// import ToastManager from 'toastify-react-native'
import Toast from 'react-native-toast-message'

function AppContainer() {
  const { isLoggedIn } = useContext(AuthContext)

  const { SENTRY_DSN } = getEnvVars()

  useEffect(() => {
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        enableInExpoDevelopment: true,
        debug: true,
        tracesSampleRate: 1.0, // to be changed to 0.2 in production
        environment: 'development'
      })
    }
  }, [SENTRY_DSN])

  return (
    <NavigationContainer>
      {/* {isLoggedIn ? <AuthStack />:<MainStack />  } */}
      {isLoggedIn ? <MainStack /> : <AuthStack />}
      <Toast />
    </NavigationContainer>
  )
}

export default Sentry.withProfiler(AppContainer)
