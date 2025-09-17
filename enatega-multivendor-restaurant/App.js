import React, { useState, useEffect, useContext } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ApolloProvider, useMutation } from '@apollo/client'
import { StatusBar } from 'expo-status-bar'
import FlashMessage from 'react-native-flash-message'
// import { useFonts } from '@use-expo/font'
import * as Updates from 'expo-updates'
import { AuthContext, Configuration } from './src/ui/context'
import AppContainer from './src/navigation'
import setupApolloClient from './src/apollo/client'
import { Spinner, TextDefault } from './src/components'
import { colors } from './src/utilities'
import {
  ActivityIndicator,
  StyleSheet,
  View,
  LogBox,
  I18nManager
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import {
  useFonts,
  Montserrat_100Thin,
  Montserrat_200ExtraLight,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
  Montserrat_100Thin_Italic,
  Montserrat_200ExtraLight_Italic,
  Montserrat_300Light_Italic,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium_Italic,
  Montserrat_600SemiBold_Italic,
  Montserrat_700Bold_Italic,
  Montserrat_800ExtraBold_Italic,
  Montserrat_900Black_Italic
} from '@expo-google-fonts/montserrat'
import { useTranslation } from 'react-i18next'
import { RestaurantContext } from './src/contexts/restaurant'
import { Provider } from 'react-redux'
// import { store } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './store/presistor'
import { useKeepAwake } from 'expo-keep-awake'
import RNRestart from 'react-native-restart'
import { restaurantLogout } from './src/apollo'
import { AuthProvider } from './src/ui/context/auth'
import { loadPrinterInfo, PrinterManager } from './src/utilities/printers'
import NetInfo from '@react-native-community/netinfo'
import NoInternetConnection from './src/components/NoInternetConnection'

LogBox.ignoreLogs([
  'Warning: ...',
  'Sentry Logger ',
  'Constants.deviceYearClass'
]) // Ignore log notification by message
LogBox.ignoreAllLogs() // Ignore all log notifications

export default function App() {
  useKeepAwake()
  const [isConnected, setIsConnected] = useState(true)

  // const [isAppReady, setIsAppReady] = useState(false)
  // const { isAppReady } = useContext(AuthContext)
  const [isUpdating, setIsUpdating] = useState(false)

  const client = setupApolloClient()

  let [fontsLoaded] = useFonts({
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat_100Thin_Italic,
    Montserrat_200ExtraLight_Italic,
    Montserrat_300Light_Italic,
    Montserrat_400Regular_Italic,
    Montserrat_500Medium_Italic,
    Montserrat_600SemiBold_Italic,
    Montserrat_700Bold_Italic,
    Montserrat_800ExtraBold_Italic,
    Montserrat_900Black_Italic
  })

  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false)
      I18nManager.forceRTL(false)
      RNRestart.Restart()
    }
  }, [I18nManager.isRTL])

  useEffect(() => {
    if (__DEV__) return
    checkAppUpdate()
  }, [])

  const checkAppUpdate = async () => {
    try {
      console.log('Checking for OTA update...')
      const { isAvailable } = await Updates.checkForUpdateAsync()
      console.log('Update check:', isAvailable)
      if (isAvailable) {
        setIsUpdating(true)
        const { isNew } = await Updates.fetchUpdateAsync()
        if (isNew) {
          await Updates.reloadAsync()
        }
        setIsUpdating(false)
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }

  useEffect(() => {
    const reconnectLastPrinter = async () => {
      const lastPrinter = await loadPrinterInfo()
      if (lastPrinter) {
        try {
          console.log('Reconnecting to last used printer:', lastPrinter)
          await PrinterManager.setConnectedDevice(lastPrinter)
          await PrinterManager.connect(lastPrinter)
        } catch (e) {
          console.warn('Auto-reconnect failed:', e)
        }
      }
    }

    reconnectLastPrinter()
  }, [])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable !== false)
    })

    return () => unsubscribe()
  }, [])

  const [fontLoaded] = useFonts({
    MuseoSans300: require('./assets/font/MuseoSans/MuseoSans300.ttf'),
    MuseoSans500: require('./assets/font/MuseoSans/MuseoSans500.ttf'),
    MuseoSans700: require('./assets/font/MuseoSans/MuseoSans700.ttf')
  })

  // if (!isConnected) {
  //   return <NoInternetConnection />
  // }

  if (isUpdating) {
    return (
      <View
        style={[
          styles.flex,
          styles.mainContainer,
          { backgroundColor: colors.startColor }
        ]}>
        <TextDefault textColor={colors.white} bold>
          Please wait while app is updating
        </TextDefault>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    )
  }

  if (fontLoaded) {
    return (
      <Provider store={store}>
        <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
          <ApolloProvider client={client}>
            <StatusBar style="dark" backgroundColor={colors.headerBackground} />
            <Configuration.Provider>
              <AuthProvider>
                <SafeAreaProvider>
                  {!isConnected && <NoInternetConnection />}
                  <AppContainer />
                </SafeAreaProvider>
              </AuthProvider>
            </Configuration.Provider>
            <FlashMessage />
          </ApolloProvider>
        </PersistGate>
      </Provider>
    )
  } else {
    return (
      <Provider store={store}>
        <Spinner />
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
