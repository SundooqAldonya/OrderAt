import React, { useState, useEffect, useReducer, useRef } from 'react'
import AppContainer from './src/routes'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as Font from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import {
  BackHandler,
  Platform,
  StatusBar,
  LogBox,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
  Text,
  AppState
} from 'react-native'
import { ApolloProvider } from '@apollo/client'
import { exitAlert } from './src/utils/androidBackButton'
import FlashMessage from 'react-native-flash-message'
import setupApolloClient from './src/apollo/index'
import ThemeReducer from './src/ui/ThemeReducer/ThemeReducer'
import ThemeContext from './src/ui/ThemeContext/ThemeContext'
import { ConfigurationProvider } from './src/context/Configuration'
import { UserProvider } from './src/context/User'
import { AuthProvider } from './src/context/Auth'
import { theme as Theme } from './src/utils/themeColors'
import { LocationProvider } from './src/context/Location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'expo-dev-client'
import useEnvVars, { isProduction } from './environment'
import { requestTrackingPermissions } from './src/utils/useAppTrackingTrasparency'
import { OrdersProvider } from './src/context/Orders'
import { MessageComponent } from './src/components/FlashMessage/MessageComponent'
import * as Updates from 'expo-updates'
import ReviewModal from './src/components/Review'
import { NOTIFICATION_TYPES } from './src/utils/enums'
import { useColorScheme } from 'react-native'
import useWatchLocation from './src/ui/hooks/useWatchLocation'
import RNRestart from 'react-native-restart'
import Toast from 'react-native-toast-message'

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
import { colors } from './src/utils/colors'
import { persistor, store } from './src/store/presistor'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import SelectLanguageScreen from './src/screens/ChooseLanguageLanding'
import i18next from 'i18next'
import ErrorView from './src/components/ErrorView/ErrorView'
import NetInfo from '@react-native-community/netinfo'
import TrackingPermissionModal from './src/components/TrackingPermissionModal'
import { initI18n } from './i18next'
import * as TrackingTransparency from 'expo-tracking-transparency'
import {
  handleAndroidBackButton,
  removeAndroidBackButtonHandler
} from './src/components/ExitModal/backHandler'
import ExitModal from './src/components/ExitModal'

LogBox.ignoreLogs([
  'Warning: ...',
  'Sentry Logger ',
  'Constants.deviceYearClass'
]) // Ignore log notification by message
LogBox.ignoreAllLogs() // Ignore all log notifications

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldShowAlert:
        notification?.request?.content?.data?.type !==
        NOTIFICATION_TYPES.REVIEW_ORDER,
      shouldPlaySound: true,
      shouldSetBadge: false
    }
  }
})

export default function App() {
  const reviewModalRef = useRef()
  const [isConnected, setIsConnected] = useState(true)
  const [exitVisible, setExitVisible] = useState(false)

  const [appIsReady, setAppIsReady] = useState(false)
  const [location, setLocation] = useState(null)
  const notificationListener = useRef()
  const responseListener = useRef()
  const [orderId, setOrderId] = useState()
  const systemTheme = useColorScheme()
  // Theme Reducer
  const [theme, themeSetter] = useReducer(
    ThemeReducer,
    // systemTheme === 'dark' ? 'Dark' : 'Pink'
    systemTheme === 'Pink'
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const [language, setLanguage] = useState(null)

  const checkLang = async () => {
    const savedLang = await AsyncStorage.getItem('enatega-language')
    if (savedLang) setLanguage(savedLang)
  }

  const appState = useRef(AppState.currentState)

  console.log({ appState })

  useEffect(() => {
    checkLang()
  }, [])

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'ios') {
        const { status } =
          await TrackingTransparency.getTrackingPermissionsAsync()
        console.log('Tracking permission status:', status)
        if (status === 'undetermined') {
          const { status: newStatus } =
            await TrackingTransparency.requestTrackingPermissionsAsync()
          console.log('Tracking permission status:', newStatus)
        }
      }
    }
    requestPermission()
  }, [])

  useEffect(() => {
    const setup = async () => {
      await initI18n()
      // setI18nReady(true)
    }
    setup()
  }, [])

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App resumed. Listening to network changes...')

        let unsubscribeNetInfo = () => {}

        unsubscribeNetInfo = NetInfo.addEventListener((state) => {
          console.log('🌐 NetInfo state on resume:', state)
          setIsConnected(state.isConnected)

          if (state.isConnected) {
            client.reFetchObservableQueries()
            unsubscribeNetInfo() // ✅ now it’s defined and safe to call
          }
        })
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription.remove()
  }, [])

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

  useWatchLocation()

  useEffect(() => {
    // let subscription = null
    const loadAppData = async () => {
      try {
        await SplashScreen.preventAutoHideAsync()
      } catch (e) {
        console.warn(e)
      }
      // await i18n.initAsync()
      await Font.loadAsync({
        MuseoSans300: require('./src/assets/font/MuseoSans/MuseoSans300.ttf'),
        MuseoSans500: require('./src/assets/font/MuseoSans/MuseoSans500.ttf'),
        MuseoSans700: require('./src/assets/font/MuseoSans/MuseoSans700.ttf'),
        'Roboto-Black': require('./src/assets/font/roboto/Roboto-Black.ttf'),
        'Roboto-BlackItalic': require('./src/assets/font/roboto/Roboto-BlackItalic.ttf'),
        'Roboto-Bold': require('./src/assets/font/roboto/Roboto-Bold.ttf'),
        'Roboto-BoldItalic': require('./src/assets/font/roboto/Roboto-BoldItalic.ttf'),
        'Roboto-Italic': require('./src/assets/font/roboto/Roboto-Italic.ttf'),
        'Roboto-Light': require('./src/assets/font/roboto/Roboto-Light.ttf'),
        'Roboto-LightItalic': require('./src/assets/font/roboto/Roboto-LightItalic.ttf'),
        'Roboto-Medium': require('./src/assets/font/roboto/Roboto-Medium.ttf'),
        'Roboto-MediumItalic': require('./src/assets/font/roboto/Roboto-MediumItalic.ttf'),
        'Roboto-Regular': require('./src/assets/font/roboto/Roboto-Regular.ttf'),
        'Roboto-Thin': require('./src/assets/font/roboto/Roboto-Thin.ttf'),
        'Roboto-ThinItalic': require('./src/assets/font/roboto/Roboto-ThinItalic.ttf')
      })
      // await permissionForPushNotificationsAsync()
      await getActiveLocation()
      // subscription = BackHandler.addEventListener(
      //   'hardwareBackPress',
      //   exitAlert
      // )

      setAppIsReady(true)
    }

    loadAppData()

    // return () => {
    //   subscription.remove()
    // }
  }, [])

  useEffect(() => {
    // register back button listener
    handleAndroidBackButton(() => setExitVisible(true))

    return () => {
      // cleanup listener
      removeAndroidBackButtonHandler()
    }
  }, [])

  useEffect(() => {
    try {
      // themeSetter({ type: systemTheme === 'dark' ? 'Dark' : 'Pink' })
      themeSetter({ type: systemTheme === 'Pink' })
    } catch (error) {
      // Error retrieving data
      console.log('Theme Error : ', error.message)
    }
  }, [systemTheme])

  useEffect(() => {
    if (!appIsReady) return

    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync()
    }

    hideSplashScreen()
  }, [appIsReady])

  useEffect(() => {
    if (!location) return

    const saveLocation = async () => {
      await AsyncStorage.setItem('location', JSON.stringify(location))
    }

    saveLocation()
  }, [location])

  const client = setupApolloClient()
  const shouldBeRTL = false
  if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== 'web') {
    I18nManager.allowRTL(shouldBeRTL)
    I18nManager.forceRTL(shouldBeRTL)
    Updates.reloadAsync()
  }

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
          { backgroundColor: Theme[theme].startColor }
        ]}
      >
        <TextDefault textColor={Theme[theme].white} bold>
          Please wait while app is updating
        </TextDefault>
        <ActivityIndicator size='large' color={Theme[theme].white} />
      </View>
    )
  }

  async function getActiveLocation() {
    try {
      const locationStr = await AsyncStorage.getItem('location')
      if (locationStr) {
        setLocation(JSON.parse(locationStr))
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync()

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        if (
          notification?.request?.content?.data?.type ===
          NOTIFICATION_TYPES.REVIEW_ORDER
        ) {
          const id = notification?.request?.content?.data?._id
          if (id) {
            setOrderId(id)
            reviewModalRef?.current?.open()
          }
        }
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (
          response?.notification?.request?.content?.data?.type ===
          NOTIFICATION_TYPES.REVIEW_ORDER
        ) {
          const id = response?.notification?.request?.content?.data?._id
          if (id) {
            setOrderId(id)
            reviewModalRef?.current?.open()
          }
        }
      })
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  const onOverlayPress = () => {
    reviewModalRef?.current?.close()
  }

  const confirmExitApp = () => {
    setExitVisible(false)
    BackHandler.exitApp()
  }

  const handleCancelExit = () => {
    setExitVisible(false) // just close modal
  }

  if (!isConnected) return <ErrorView />

  if (appIsReady) {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ApolloProvider client={client}>
              <ThemeContext.Provider
                value={{ ThemeValue: theme, dispatch: themeSetter }}
              >
                <StatusBar
                  // backgroundColor={colors.primary}
                  backgroundColor={'#fff'}
                  barStyle={'dark-content'}
                />
                <LocationProvider>
                  <ConfigurationProvider>
                    <AuthProvider>
                      <UserProvider>
                        <OrdersProvider>
                          <AppContainer />
                          <ExitModal
                            visible={exitVisible}
                            onConfirm={confirmExitApp}
                            onCancel={handleCancelExit}
                          />
                          {/* <TrackingPermissionModal /> */}
                          <ReviewModal
                            ref={reviewModalRef}
                            onOverlayPress={onOverlayPress}
                            theme={Theme[theme]}
                            orderId={orderId}
                          />
                        </OrdersProvider>
                      </UserProvider>
                    </AuthProvider>
                  </ConfigurationProvider>
                </LocationProvider>
                <FlashMessage MessageComponent={MessageComponent} />
              </ThemeContext.Provider>
            </ApolloProvider>
            <Toast />
          </GestureHandlerRootView>
        </PersistGate>
      </Provider>
    )
  } else {
    return null
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

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
    }
  } else {
    alert('Must use physical device for Push Notifications')
  }
}

// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: 'Here is the notification body',
//       data: { type: NOTIFICATION_TYPES.REVIEW_ORDER, _id: '65e068b2150aab288f2b821f' }
//     },
//     trigger: { seconds: 10 }
//   })
// }
