import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ApolloProvider } from '@apollo/client'
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

LogBox.ignoreLogs([
  'Warning: ...',
  'Sentry Logger ',
  'Constants.deviceYearClass'
]) // Ignore log notification by message
LogBox.ignoreAllLogs() // Ignore all log notifications

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [token, setToken] = useState(null)
  const { i18n } = useTranslation()
  const [isUpdating, setIsUpdating] = useState(false)
  console.log({ isRTL: I18nManager.isRTL })
  console.log({ language: i18n.language })

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
    if (i18n.language === 'ar' && !I18nManager.isRTL) {
      I18nManager.allowRTL(true)
      I18nManager.forceRTL(true)
      console.log({ isRTL: I18nManager.isRTL })
    }
  }, [i18n.language])

  useEffect(() => {
    ;(async () => {
      const token = await SecureStore.getItemAsync('token')
      if (token) setToken(token)
      setIsAppReady(true)
    })()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (__DEV__) return
    ;(async () => {
      const { isAvailable } = await Updates.checkForUpdateAsync()
      if (isAvailable) {
        setIsUpdating(true)
        const { isNew } = await Updates.fetchUpdateAsync()
        if (isNew) {
          await Updates.reloadAsync()
        }
        setIsUpdating(false)
      }
    })()
  }, [])

  const login = async (token, restaurantId) => {
    await SecureStore.setItemAsync('token', token)
    await AsyncStorage.setItem('restaurantId', restaurantId)
    setToken(token)
  }

  const logout = async () => {
    await SecureStore.deleteItemAsync('token')
    await AsyncStorage.removeItem('restaurantId')
    setToken(null)
  }

  const [fontLoaded] = useFonts({
    MuseoSans300: require('./assets/font/MuseoSans/MuseoSans300.ttf'),
    MuseoSans500: require('./assets/font/MuseoSans/MuseoSans500.ttf'),
    MuseoSans700: require('./assets/font/MuseoSans/MuseoSans700.ttf')
  })

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

  if (fontLoaded && isAppReady) {
    return (
      <ApolloProvider client={client}>
        <StatusBar style="dark" backgroundColor={colors.headerBackground} />
        <Configuration.Provider>
          <AuthContext.Provider value={{ isLoggedIn: !!token, login, logout }}>
            <SafeAreaProvider>
              <AppContainer />
            </SafeAreaProvider>
          </AuthContext.Provider>
        </Configuration.Provider>
        <FlashMessage />
      </ApolloProvider>
    )
  } else {
    return <Spinner />
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