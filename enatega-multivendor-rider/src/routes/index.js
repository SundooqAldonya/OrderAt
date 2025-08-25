/* eslint-disable react/display-name */
import React, { useContext, useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as Notifications from 'expo-notifications'
import Login from '../screens/Login/Login'
import Sidebar from '../components/Sidebar/Sidebar'
import Orders from '../screens/Orders/Orders'
import NewOrders from '../screens/NewOrders/NewOrders'
import OrderDetail from '../screens/OrderDetail/OrderDetail'
import Language from '../screens/Language/Language'
import Help from '../screens/Help/Help'
import HelpBrowser from '../screens/HelpBrowser/HelpBrowser'
import UserContext, { UserProvider } from '../context/user'
import { screenOptions, tabOptions, tabIcon } from './screenOptions'
import LeftButton from '../components/Header/HeaderIcons/HeaderIcons'
import navigationService from './navigationService'
import LocationPermissions from '../screens/LocationPermissions/LocationPermissions'
import { useLocationContext } from '../context/location'
import Wallet from '../screens/Wallet/Wallet'
import Withdraw from '../screens/Withdraw/Withdraw'
import WalletHistory from '../screens/WalletHistory/WalletHistory'
import AvailableCash from '../screens/AvailableCash/AvailableCash'
import ChatScreen from '../screens/ChatWithCustomer/ChatScreen'
import { AuthContext } from '../context/auth'
import { SoundContextProvider } from '../context/sound'
import { useTranslation } from 'react-i18next'
import * as Sentry from '@sentry/react-native'
import ConfigurationContext from '../context/configuration'
import { playCustomSound } from '../utilities/playSound'
import ToastManager, { Toast } from 'toastify-react-native'
import messaging from '@react-native-firebase/messaging'
import { Alert } from 'react-native'
import { setupNotificationChannel } from '../utilities/pushNotifications'
import beep1 from '../assets/beep1.wav'
import CameraCaptureReceipt from '../screens/CameraCaptureReceipt'
import { useMutation } from '@apollo/client'
import { refreshFirebaseToken } from '../apollo/mutations'
import { startBackgroundUpdate } from '../utilities/backgroundLocationTask'
import NotificationListener from '../components/NotificationListener'
import { initBackgroundLocation } from '../utilities/transistorBackgroundTracking'
import useRiderAppState from '../utilities/useRiderAppState'

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator()

// Notifications.setNotificationHandler({
//   handleNotification: async notification => {
//     console.log('✅ Notification received in handler:', notification)

//     // // Check if notification includes sound
//     // if (notification.request.content.sound) {
//     //   await playCustomSound()
//     // }

//     return {
//       shouldShowAlert: true,
//       shouldPlaySound: true, // We play it manually
//       shouldSetBadge: false
//     }
//   }
// })

function MyTabs() {
  const { t } = useTranslation()
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        ...tabIcon(route),
        ...tabOptions()
      })}>
      <Tab.Screen
        name="Home"
        component={NewOrders}
        options={{ title: t('home') }}
      />
      <Tab.Screen
        name="MyOrders"
        component={Orders}
        options={{ title: t('orders') }}
      />
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={{ title: t('wallet') }}
      />
      {/* {
        Platform.OS === 'ios'? null : <Tab.Screen
        name="Language"
        component={Language}
        options={{ title: t('language') }}
      />
      } */}
      <Tab.Screen
        name="Language"
        component={Language}
        options={{ title: t('language') }}
      />
      <Tab.Screen
        name="Profile"
        component={NoDrawer}
        options={{ title: t('profile') }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault()
            navigation.openDrawer()
          }
        })}
      />
    </Tab.Navigator>
  )
}

function Auth() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  )
}

function LocationStack() {
  return (
    <Stack.Navigator
      initialRouteName="Location"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Location" component={LocationPermissions} />
    </Stack.Navigator>
  )
}

function Main() {
  const { locationPermission } = useLocationContext()

  return locationPermission ? (
    <UserProvider>
      <SoundContextProvider>
        <NotificationListener />
        <Drawer.Navigator
          drawerType="slide"
          drawerPosition="right"
          drawerContent={props => <Sidebar {...props} />}
          screenOptions={{ headerShown: false }}>
          {/*<Drawer.Screen name="SidebBar" component={Sidebar} />*/}

          <Drawer.Screen name="noDrawer" component={NoDrawer} />
        </Drawer.Navigator>
      </SoundContextProvider>
    </UserProvider>
  ) : (
    <LocationStack />
  )
}

function NoDrawer() {
  const { t } = useTranslation()
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions()}>
      <Stack.Screen
        name="Home"
        component={NewOrders}
        options={{
          headerLeft: () => <LeftButton />
        }}
      />
      <Stack.Screen
        name="MyOrders"
        component={Orders}
        options={{ title: t('orders') }}
      />
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{ title: t('wallet') }}
      />
      <Stack.Screen name="OrderDetail" component={OrderDetail} />
      <Stack.Screen name="Withdraw" component={Withdraw} />
      <Stack.Screen name="WalletHistory" component={WalletHistory} />
      <Stack.Screen name="AvailableCash" component={AvailableCash} />
      <Stack.Screen
        name="ChatWithCustomer"
        options={{
          headerShown: true
        }}
        component={ChatScreen}
      />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="Language" component={Language} />
      <Stack.Screen name="HelpBrowser" component={HelpBrowser} />
      <Stack.Screen
        name="CameraCaptureReceipt"
        component={CameraCaptureReceipt}
      />
    </Stack.Navigator>
  )
}

function AppContainer() {
  const { token } = useContext(AuthContext)
  const configuration = useContext(ConfigurationContext)
  const { assignedOrders } = useContext(UserContext)

  useEffect(() => {
    const dsn = configuration?.riderAppSentryUrl

    if (dsn) {
      Sentry.init({
        dsn: dsn,
        environment: 'development',
        enableInExpoDevelopment: true,
        debug: true,
        tracesSampleRate: 0 // to be changed to 0.2 in production
      })
    }
  }, [configuration?.riderAppSentryUrl])

  useEffect(() => {
    initBackgroundLocation()
  }, [])

  useRiderAppState(assignedOrders?.length)

  // useEffect(() => {
  //   // Optional: Start immediately
  //   // if (token) {
  //   startBackgroundUpdate().catch(console.warn)
  //   // }
  // }, [])

  return (
    <SafeAreaProvider>
      <ToastManager
        textStyle={{
          fontSize: 14
        }}
      />

      <NavigationContainer
        ref={ref => {
          navigationService.setGlobalRef(ref)
        }}>
        {token ? <Main /> : <Auth />}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default Sentry.withProfiler(AppContainer)
