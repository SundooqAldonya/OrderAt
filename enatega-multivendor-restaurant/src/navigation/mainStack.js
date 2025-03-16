import React, { useCallback, useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { Restaurant, SoundContextProvider } from '../ui/context'
import { OrderDetailScreen } from '../screens/OrderDetail'
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OrdersScreen } from '../screens/Orders'
import SideBar from '../components/SideBar/SideBar'
import { screenOptions, tabIcon } from './screenOptions'
import { colors } from '../utilities/colors'
import { gql, useApolloClient } from '@apollo/client'
import { orders } from '../apollo'
import { useNavigation } from '@react-navigation/native'
import { SelectLanguage } from '../screens/Setting'
import moment from 'moment'
import { MAX_TIME } from '../utilities'
import RegisterUser from '../screens/Login/RegisterUser'
import Checkout from '../screens/Login/Checkout'
import AddNewAddress from '../screens/Login/AddNewAddress'
import messaging from '@react-native-firebase/messaging'
import {
  playCustomSound,
  setupNotificationChannel
} from '../utilities/playSound'
import { Alert } from 'react-native'
// import ToastManager, { Toast } from 'toastify-react-native'
import Toast from 'react-native-toast-message'
import { testingNotifications } from '../utilities/setupNotificationChannel'
import NewOrderScreenNotification from '../screens/NewOrderScreenNotification'
import AddNewOrder from '../screens/AddNewOrder'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH
  })
})

const Drawer = createDrawerNavigator()
// const Tabs = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

export default function MainStack() {
  return (
    <Restaurant.Provider>
      <SoundContextProvider>
        <DrawerNavigator />
      </SoundContextProvider>
    </Restaurant.Provider>
  )
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="ProfileDrawer"
      screenOptions={{
        headerShown: false,
        overlayColor: 'transparent',
        drawerType: 'slide',
        drawerStyle: {
          width: '60%'
        }
      }}
      drawerContent={props => <SideBar {...props} />}>
      {/* <Drawer.Screen name="ProfileDrawer" component={TabNavigator} /> */}
      <Drawer.Screen name="ProfileDrawer" component={StackNavigator} />
    </Drawer.Navigator>
  )
}

// function TabNavigator() {
//   const { t } = useTranslation()
//   return (
//     <Tabs.Navigator
//       initialRouteName={t('titleHome')}
//       screenOptions={({ route }) => tabIcon(route)}
//       tabBarLabelStyle={{
//         color: colors.green
//       }}>
//       <Tabs.Screen
//         name={t('titleProfile')}
//         component={SideBar}
//         listeners={({ navigation }) => ({
//           tabPress: e => {
//             e.preventDefault()
//             navigation.openDrawer()
//           }
//         })}
//       />
//       <Tabs.Screen name={t('titleHome')} component={StackNavigator} />
//       {/* {Platform.OS === 'ios' ? null :  */}
//       {/* <Tabs.Screen
//         name="Language"
//         options={{
//           tabBarLabel: t('language')
//         }}
//         component={SelectLanguage}
//       /> */}
//       {/* } */}
//     </Tabs.Navigator>
//   )
// }

function StackNavigator() {
  const navigation = useNavigation()
  const timeNow = new Date()

  useEffect(() => {
    setupNotificationChannel()
    // testingNotifications()
  }, [])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        const sound = remoteMessage?.notification?.android?.sound
          ? remoteMessage?.notification?.android?.sound
          : null
        if (sound !== 'false') {
          await playCustomSound()
        }
      } catch (error) {
        console.error('Error handling FCM message:', error)
      }
    })

    return unsubscribe
  }, [navigation])

  return (
    <Stack.Navigator initialRouteName="Orders" screenOptions={screenOptions()}>
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="RegisterUser" component={RegisterUser} />
      <Stack.Screen name="AddNewAddress" component={AddNewAddress} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="SelectLanguage" component={SelectLanguage} />
      <Stack.Screen
        name="NewOrderScreenNotification"
        component={NewOrderScreenNotification}
      />
      <Stack.Screen name="AddNewOrder" component={AddNewOrder} />
    </Stack.Navigator>
  )
}
