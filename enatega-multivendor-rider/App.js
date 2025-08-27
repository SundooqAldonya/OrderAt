import React, { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  View,
  StatusBar,
  StyleSheet,
  LogBox,
  I18nManager,
  Alert,
  BackHandler
} from 'react-native'
import * as Font from 'expo-font'
import { ApolloProvider } from '@apollo/client'
import FlashMessage from 'react-native-flash-message'
import * as SplashScreen from 'expo-splash-screen'
import * as Updates from 'expo-updates'
import AppContainer from './src/routes/index'
import colors from './src/utilities/colors'
import setupApolloClient from './src/apollo/index'
import { ConfigurationProvider } from './src/context/configuration'
import { AuthProvider } from './src/context/auth'
import { TabsContext } from './src/context/tabs'
import TextDefault from './src/components/Text/TextDefault/TextDefault'
import { LocationProvider } from './src/context/location'
import moment from 'moment-timezone'
import { useKeepAwake } from 'expo-keep-awake'
import RNRestart from 'react-native-restart'
import * as Notifications from 'expo-notifications'

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
import { PaperProvider } from 'react-native-paper'
import Constants from 'expo-constants'

moment.tz.setDefault('Africa/Cairo')
LogBox.ignoreLogs([
  'Warning: ...',
  'Sentry Logger ',
  'Constants.deviceYearClass'
]) // Ignore log notification by message
LogBox.ignoreAllLogs() // Ignore all log notifications

Notifications.setNotificationHandler({
  handleNotification: async notification => {
    console.log('✅ Notification received in handler:', notification)

    return {
      shouldShowAlert: true,
      shouldPlaySound: true, // We play it manually
      shouldSetBadge: false
    }
  }
})

export default function App() {
  console.log('moment', moment().format())
  useKeepAwake()
  console.log({ projectId: Constants.expoConfig.extra.firebaseProjectId })
  const [appIsReady, setAppIsReady] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [active, setActive] = useState('NewOrder')

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
    ;(async () => {
      await SplashScreen.preventAutoHideAsync()

      await Font.loadAsync({
        MuseoSans300: require('./src/assets/font/MuseoSans/MuseoSans300.ttf'),
        MuseoSans500: require('./src/assets/font/MuseoSans//MuseoSans500.ttf'),
        MuseoSans700: require('./src/assets/font/MuseoSans/MuseoSans700.ttf')
      })

      setAppIsReady(true)
      await SplashScreen.hideAsync()
    })()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (__DEV__) return
    ;(async () => {
      const { isAvailable } = await Updates.checkForUpdateAsync()
      if (isAvailable) {
        try {
          setIsUpdating(true)
          const { isNew } = await Updates.fetchUpdateAsync()
          if (isNew) {
            await Updates.reloadAsync()
          }
        } catch (error) {
          console.log('error while updating app', JSON.stringify(error))
        } finally {
          setIsUpdating(false)
        }
      }
    })()
  }, [])

  if (isUpdating) {
    return (
      <View
        style={[
          styles.flex,
          styles.mainContainer,
          { backgroundColor: colors.startColor }
        ]}>
        <TextDefault textColor={colors.white} bold>
          {/* {t('updating')} */}
          updating
          {/* {.t('updating')} */}
        </TextDefault>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    )
  }

  if (appIsReady) {
    return (
      <ApolloProvider client={client}>
        <StatusBar
          backgroundColor={colors.headerBackground}
          barStyle="dark-content"
        />
        <ConfigurationProvider>
          <AuthProvider>
            <LocationProvider>
              <TabsContext.Provider value={{ active, setActive }}>
                <PaperProvider>
                  <AppContainer />
                </PaperProvider>
              </TabsContext.Provider>
            </LocationProvider>
          </AuthProvider>
        </ConfigurationProvider>
        <FlashMessage />
      </ApolloProvider>
    )
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.spinnerColor} />
    </View>
  )
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
