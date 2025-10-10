import React, { useCallback, useContext, useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import navigationService from './navigationService'
import * as Notifications from 'expo-notifications'
import Login from '../screens/Login/Login'
import Register from '../screens/Register/Register'
import ForgotPassword from '../screens/ForgotPassword/ForgotPassword'
import SetYourPassword from '../screens/ForgotPassword/SetYourPassword'
import CreateAccount from '../screens/CreateAccount/CreateAccount'
import SideBar from '../components/Sidebar/Sidebar'
import ItemDetail from '../screens/ItemDetail/ItemDetail'
import MyOrders from '../screens/MyOrders/MyOrders'
import Cart from '../screens/Cart/Cart'
import SaveAddress from '../screens/SaveAddress/SaveAddress'
import RateAndReview from '../screens/RateAndReview/RateAndReview'
import Payment from '../screens/Payment/Payment'
import Help from '../screens/Help/Help'
import Paypal from '../screens/Paypal/Paypal'
import StripeCheckout from '../screens/Stripe/StripeCheckout'
import Profile from '../screens/Profile/Profile'
import Addresses from '../screens/Addresses/Addresses'
import NewAddress from '../screens/NewAddress/NewAddress'
import EditAddress from '../screens/EditAddress/EditAddress'
import CartAddress from '../screens/CartAddress/CartAddress'
import FullMap from '../screens/FullMap/FullMap'
import OrderDetail from '../screens/OrderDetail/OrderDetail'
import Settings from '../screens/Settings/Settings'
import HelpBrowser from '../screens/HelpBrowser/HelpBrowser'
import Main from '../screens/Main/Main'
import Restaurant from '../screens/Restaurant/Restaurant'
import About from '../screens/About'
import SelectLocation from '../screens/SelectLocation'
import AddNewAddress from '../screens/SelectLocation/AddNewAddress'
import CurrentLocation from '../screens/CurrentLocation'
import ThemeContext from '../ui/ThemeContext/ThemeContext'
import { theme } from '../utils/themeColors'
import screenOptions from './screenOptions'
import { LocationContext } from '../context/Location'
import Reorder from '../screens/Reorder/Reorder'
import Favourite from '../screens/Favourite/Favourite'
import ChatScreen from '../screens/ChatWithRider/ChatScreen'
import { DarkBackButton } from '../components/Header/HeaderIcons/HeaderIcons'
import EmailOtp from '../screens/Otp/Email/EmailOtp'
import PhoneOtp from '../screens/Otp/Phone/PhoneOtp'
import ForgotPasswordOtp from '../screens/Otp/ForgotPassword/ForgetPasswordOtp'
import PhoneNumber from '../screens/PhoneNumber/PhoneNumber'
import { useApolloClient, gql } from '@apollo/client'
import { myOrders } from '../apollo/queries'
import Checkout from '../screens/Checkout/Checkout'
import Menu from '../screens/Menu/Menu'
import Reviews from '../screens/Reviews'
import useEnvVars from '../../environment'
import * as Sentry from '@sentry/react-native'
import AddNewAddressUser from '../screens/SelectLocation/AddNewAddressUser'
import EditUserAddress from '../screens/SelectLocation/EditUserAddress'
import messaging from '@react-native-firebase/messaging'
import { playCustomSound, setupNotificationChannel } from '../utils/playSound'
import {
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { colors } from '../utils/colors'
import { useTranslation } from 'react-i18next'
import UserContext from '../context/User'
import RequestDelivery from '../screens/RequestDelivery'
import FromPlace from '../screens/RequestDelivery/FromPlace'
import ToPlace from '../screens/RequestDelivery/ToPlace'
import MainRestaurantScreen from '../components/Main/MainRestaurantCard/MainRestaurantScreen'
import { TopBrandsScreen } from '../components/Main/TopBrandsScreen'
import NotificationMandoob from '../screens/RequestDelivery/NotificationMandoob'
import NewPickupMandoob from '../screens/RequestDelivery/NewPickupMandoob'
import PickupFromMap from '../screens/RequestDelivery/PickupFromMap'
import NewDropoffMandoob from '../screens/RequestDelivery/NewDropoffMandoob'
import DropoffFromMap from '../screens/RequestDelivery/DropoffFromMap'
import AddressNewVersion from '../screens/AddressNewVersion'
import AddressFromMap from '../screens/AddressNewVersion/AddressFromMap'
import EditAddressNewVersion from '../screens/EditAddressNewVersion'
import EditAddressFromMap from '../screens/EditAddressNewVersion/EditAddressFromMap'
import i18next from 'i18next'
import SelectLanguageScreen from '../screens/ChooseLanguageLanding'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import CityListScreen from '../screens/SelectLocation/CityListScreen'
import { moderateScale } from '../utils/scaling'
import RestaurantDetailsV2 from '../screens/Restaurant/RestaurantDetailsV2'
import MainV2 from '../screens/Main/MainV2'
import MandoobImg from '../assets/tabs_request_delivery.png'
import TextDefault from '../components/Text/TextDefault/TextDefault'
import CategorySearchRestaurants from '../screens/CategorySearchRestaurants'
import MenuV2 from '../screens/Menu/MenuV2'

const NavigationStack = createStackNavigator()
const MainStack = createStackNavigator()
const SideDrawer = createDrawerNavigator()
const Location = createStackNavigator()
const Language = createStackNavigator()

function Drawer() {
  return (
    <SideDrawer.Navigator
      screenOptions={{
        drawerStyle: {
          width: '75%'
        }
      }}
      drawerContent={(props) => <SideBar {...props} />}
    >
      <SideDrawer.Screen
        options={{ headerShown: false }}
        name='NoDrawer'
        component={NoDrawer}
      />
    </SideDrawer.Navigator>
  )
}
function NoDrawer() {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()

  useEffect(() => {
    setupNotificationChannel()
  }, [])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log({ remoteMessage })
      try {
        // Alert.alert(JSON.stringify(remoteMessage))
        const sound = remoteMessage?.notification?.android?.sound
          ? remoteMessage?.notification?.android?.sound
          : null
        if (sound !== 'false') {
          await playCustomSound()
        }
        Toast.show({
          type: 'success',
          text1: remoteMessage?.notification?.title,
          text2: remoteMessage?.notification?.body,
          visibilityTime: 10000,
          onPress: () => {
            handleNavigation(remoteMessage)
          }
        })
      } catch (error) {
        console.error('Error handling FCM message:', error)
      }
    })

    // Background & Killed state notification handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage
      )
      handleNavigation(remoteMessage)
    })

    // When the app is opened from a **killed state**
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from killed state:',
            remoteMessage
          )
          handleNavigation(remoteMessage)
        }
      })

    return unsubscribe
  }, [navigation])

  const handleNavigation = (remoteMessage) => {
    if (remoteMessage?.data?.orderId) {
      navigation.navigate('OrderDetail', {
        _id: remoteMessage.data.orderId
      })
    }
  }

  return (
    <NavigationStack.Navigator
    // screenOptions={screenOptions({
    //   theme: themeContext.ThemeValue,
    //   headerMenuBackground: currentTheme.headerMenuBackground,
    //   backColor: currentTheme.headerBackground,
    //   lineColor: currentTheme.horizontalLine,
    //   textColor: currentTheme.headerText,
    //   iconColor: currentTheme.iconColorPink
    // })}
    >
      <NavigationStack.Screen
        name='BottomTabs'
        options={{ headerShown: false }}
        component={BottomTabs}
      />
      <NavigationStack.Screen name='Menu' component={MenuV2} />

      <NavigationStack.Screen
        // options={{ headerShown: false }}
        name='MainRestaurantScreen'
        component={MainRestaurantScreen}
      />
      <NavigationStack.Screen
        // options={{ headerShown: false }}
        name='TopBrandsScreen'
        component={TopBrandsScreen}
      />

      <NavigationStack.Screen
        name='Restaurant'
        component={RestaurantDetailsV2}
        options={{ header: () => null }}
      />

      <NavigationStack.Screen
        options={{ headerShown: false }}
        name='ItemDetail'
        component={ItemDetail}
      />
      <NavigationStack.Screen name='Cart' component={Cart} />
      <NavigationStack.Screen name='Checkout' component={Checkout} />
      <NavigationStack.Screen name='Profile' component={Profile} />
      <NavigationStack.Screen name='Addresses' component={Addresses} />
      <NavigationStack.Screen name='NewAddress' component={NewAddress} />
      <NavigationStack.Screen name='EditAddress' component={EditAddress} />
      <NavigationStack.Screen name='FullMap' component={FullMap} />
      <NavigationStack.Screen name='CartAddress' component={CartAddress} />
      <NavigationStack.Screen name='Payment' component={Payment} />
      <NavigationStack.Screen
        name='OrderDetail'
        component={OrderDetail}
        options={{
          headerBackImage: () =>
            DarkBackButton({
              iconColor: currentTheme.backIcon,
              iconBackground: currentTheme.backIconBackground
            })
        }}
      />
      <NavigationStack.Screen name='Settings' component={Settings} />
      <NavigationStack.Screen name='MyOrders' component={MyOrders} />
      <NavigationStack.Screen name='Reorder' component={Reorder} />
      <NavigationStack.Screen name='Help' component={Help} />
      <NavigationStack.Screen name='HelpBrowser' component={HelpBrowser} />
      <NavigationStack.Screen
        name='About'
        component={About}
        options={{ header: () => null }}
      />
      <NavigationStack.Screen name='Reviews' component={Reviews} />
      <NavigationStack.Screen name='Paypal' component={Paypal} />
      <NavigationStack.Screen name='RateAndReview' component={RateAndReview} />

      <NavigationStack.Screen
        name='StripeCheckout'
        component={StripeCheckout}
      />

      {/* Authentication Login */}
      <NavigationStack.Screen
        options={{ headerShown: true }}
        name='CreateAccount'
        component={CreateAccount}
      />
      <NavigationStack.Screen name='Login' component={Login} />
      <NavigationStack.Screen name='Register' component={Register} />
      <NavigationStack.Screen name='PhoneNumber' component={PhoneNumber} />
      <NavigationStack.Screen
        name='ForgotPassword'
        component={ForgotPassword}
      />
      <NavigationStack.Screen
        name='SetYourPassword'
        component={SetYourPassword}
      />
      <NavigationStack.Screen name='EmailOtp' component={EmailOtp} />
      <NavigationStack.Screen name='PhoneOtp' component={PhoneOtp} />
      <NavigationStack.Screen
        name='ForgotPasswordOtp'
        component={ForgotPasswordOtp}
      />
      <NavigationStack.Screen
        name='SelectLocation'
        component={SelectLocation}
      />
      <NavigationStack.Screen name='AddNewAddress' component={AddNewAddress} />
      <NavigationStack.Screen
        options={{ headerShown: true }}
        name='AddNewAddressUser'
        component={AddNewAddressUser}
      />
      <NavigationStack.Screen
        name='EditUserAddress'
        component={EditUserAddress}
      />
      <NavigationStack.Screen name='SaveAddress' component={SaveAddress} />
      <NavigationStack.Screen name='Favourite' component={Favourite} />
      <NavigationStack.Screen name='ChatWithRider' component={ChatScreen} />
      <NavigationStack.Screen
        name='RequestDelivery'
        options={{
          headerTitle: () => (
            <TextDefault
              bolder
              style={{ color: '#000', fontSize: moderateScale(20) }}
            >
              {t('Request_delivery')}
            </TextDefault>
          ),
          tabBarStyle: { display: 'none' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                paddingHorizontal: 10,
                marginLeft: 10
              }}
            >
              <AntDesign name='arrowleft' size={24} color='black' />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShown: true
        }}
        component={RequestDelivery}
      />
      <NavigationStack.Screen
        name='NewPickupMandoob'
        component={NewPickupMandoob}
        options={{
          headerTitle: () => (
            <TextDefault
              bolder
              style={{ color: '#000', fontSize: moderateScale(20) }}
            >
              {t('pickup')}
            </TextDefault>
          ),
          tabBarStyle: { display: 'none' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                paddingHorizontal: 10,
                marginLeft: 10
              }}
            >
              <AntDesign name='arrowleft' size={24} color='black' />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />
      <NavigationStack.Screen
        name='NewDropoffMandoob'
        component={NewDropoffMandoob}
        options={{
          headerTitle: () => (
            <TextDefault
              bolder
              style={{ color: '#000', fontSize: moderateScale(20) }}
            >
              {t('dropoff')}
            </TextDefault>
          ),
          tabBarStyle: { display: 'none' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                paddingHorizontal: 10,
                marginLeft: 10
              }}
            >
              <AntDesign name='arrowleft' size={24} color='black' />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />

      <NavigationStack.Screen name='PickupFromMap' component={PickupFromMap} />
      <NavigationStack.Screen
        name='DropoffFromMap'
        component={DropoffFromMap}
      />
      <NavigationStack.Screen
        name='FromPlace'
        options={{
          headerTitle: t('pickup'),
          headerRight: false,
          headerStyle: {
            backgroundColor: colors.primary
          }
        }}
        component={FromPlace}
      />
      <NavigationStack.Screen
        name='ToPlace'
        options={{
          headerTitle: t('dropoff'),
          headerRight: false,
          headerStyle: {
            backgroundColor: colors.primary
          }
        }}
        component={ToPlace}
      />
      <NavigationStack.Screen
        name='NotificationMandoob'
        component={NotificationMandoob}
      />
      <NavigationStack.Screen
        name='AddressNewVersion'
        component={AddressNewVersion}
      />
      <NavigationStack.Screen
        name='AddressFromMap'
        component={AddressFromMap}
      />
      <NavigationStack.Screen
        name='EditAddressNewVersion'
        component={EditAddressNewVersion}
      />
      <NavigationStack.Screen
        name='EditAddressFromMap'
        component={EditAddressFromMap}
      />
      <NavigationStack.Screen
        name='CityListScreen'
        component={CityListScreen}
      />
      <NavigationStack.Screen
        name='SelectLanguageScreen'
        options={{ headerShown: false }}
        component={SelectLanguageScreen}
      />
      <NavigationStack.Screen
        name='CategorySearchRestaurants'
        options={{ headerShown: false }}
        component={CategorySearchRestaurants}
      />
    </NavigationStack.Navigator>
  )
}

function LocationStack() {
  const [language, setLanguage] = useState(null)

  const handleLanguageSelect = async (lang) => {
    await AsyncStorage.setItem('enatega-language', lang)
    setLanguage(lang)
    i18next.changeLanguage(lang)
  }

  return (
    <Location.Navigator initialRouteName='CityListScreen'>
      <Location.Screen
        name='CurrentLocation'
        component={CurrentLocation}
        options={{ header: () => null }}
      />
      <Location.Screen name='CityListScreen' component={CityListScreen} />
      <Location.Screen name='SelectLocation' component={SelectLocation} />
      <Location.Screen name='AddNewAddress' component={AddNewAddress} />
      <Location.Screen name='Main' component={MainV2} />
      <Location.Screen
        name='SelectLanguageScreen'
        options={{
          headerTitle: 'الرجوع'
        }}
        children={(props) => (
          <SelectLanguageScreen
            {...props}
            onSelectLanguage={handleLanguageSelect}
          />
        )}
      />
    </Location.Navigator>
  )
}

const CustomSearchButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -30, // makes it float above tab bar
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
      backgroundColor: colors.primary,
      borderRadius: moderateScale(40)
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: moderateScale(65),
        height: moderateScale(65),
        borderRadius: moderateScale(65) / 2,
        backgroundColor: colors.primary, // 👈 main color
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
)

const BottomTabs = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const Tab = createBottomTabNavigator()
  const { isLoggedIn } = useContext(UserContext)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ color, size }) => {
          let iconName
          if (route.name === 'Main') {
            iconName = 'home'
          } else if (route.name === 'Profile') {
            iconName = 'person'
          } else if (route.name === 'Settings') {
            iconName = 'settings'
          } else if (route.name === 'MyOrders') {
            iconName = 'lunch-dining'
          } else if (route.name === 'RequestDelivery') {
            iconName = 'delivery-dining'
          } else if (route.name === 'CreateAccount') {
            iconName = 'login'
          } else if (route.name === 'SelectLanguageScreen') {
            iconName = 'language'
          } else if (route.name === 'Menu') {
            iconName = 'search'
          }
          return (
            <Icon
              name={iconName}
              size={24}
              color={color}
              style={{ marginTop: 10 }}
            />
          )
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          height: Platform.OS === 'ios' ? 90 : 70,
          //   paddingBottom: 10,
          //  position: 'absolute',
          // bottom: 15,
          // left: 20,
          // right: 20,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
          // paddingBottom: 10
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: moderateScale(8),
          marginBottom: 10,
          alignSelf: 'center'
        },
        tabBarInactiveTintColor: 'grey',
        tabBarActiveTintColor: colors.primary
        // tabBarActiveTintColor: '#000'
      })}
    >
      <Tab.Screen
        name='Main'
        options={{ tabBarLabel: t('home') }}
        component={MainV2}
      />
      {/* {isLoggedIn && ( */}
      <Tab.Screen
        name='MyOrders'
        options={{ tabBarLabel: t('titleOrders') }}
        component={MyOrders}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault() // prevent tab from switching
              navigation.navigate('CreateAccount') // redirect to Login screen
            }
          }
        })}
      />
      {/* )} */}

      <Tab.Screen
        name='RequestDelivery'
        component={RequestDelivery}
        listeners={() => ({
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault() // prevent tab from switching
              navigation.navigate('CreateAccount') // redirect to Login screen
            }
          }
        })}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={MandoobImg}
              style={{ width: moderateScale(60), height: moderateScale(60) }}
            />
          ),
          tabBarButton: (props) => <CustomSearchButton {...props} />,
          tabBarLabel: () => null,
          headerTitle: () => (
            <TextDefault
              bolder
              style={{ color: '#000', fontSize: moderateScale(20) }}
            >
              {t('Request_delivery')}
            </TextDefault>
          ),
          tabBarStyle: { display: 'none' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                paddingHorizontal: 10,
                marginLeft: 10
              }}
            >
              <AntDesign name='arrowleft' size={24} color='black' />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />
      {isLoggedIn ? (
        <Tab.Screen
          name='Menu'
          options={{ tabBarLabel: t('search') }}
          component={MenuV2}
        />
      ) : (
        <Tab.Screen
          name='SelectLanguageScreen'
          options={{
            headerShown: false,
            tabBarLabel: t('change_language')
          }}
          component={SelectLanguageScreen}
        />
      )}
      {/* {isLoggedIn ? (
        <Tab.Screen
          name='Settings'
          options={{ tabBarLabel: t('titleSettings') }}
          component={Settings}
        />
      ) : (
        <Tab.Screen
          name='CreateAccount'
          options={{
            tabBarLabel: t('login'),
            tabBarStyle: { display: 'none' }
          }}
          component={CreateAccount}
        />
      )} */}

      {/* <Tab.Screen
        name='RequestDelivery'
        options={{ tabBarLabel: t('Request_delivery') }}
        component={Settings}
      /> */}
      {isLoggedIn ? (
        <Tab.Screen
          name='Profile'
          options={{
            tabBarLabel: t('profile')
          }}
          listeners={() => ({
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault() // prevent tab from switching
                navigation.navigate('CreateAccount') // redirect to Login screen
              }
            }
          })}
          component={Profile}
        />
      ) : (
        <Tab.Screen
          name='CreateAccount'
          options={{
            tabBarLabel: t('login'),
            tabBarStyle: { display: 'none' }
          }}
          component={CreateAccount}
        />
      )}
      {/* {!isLoggedIn ? (
        <Tab.Screen
          name='SelectLanguageScreen'
          options={{
            headerShown: false,
            tabBarLabel: t('change_language')
          }}
          component={SelectLanguageScreen}
        />
      ) : null} */}
    </Tab.Navigator>
  )
}

const LanguageStack = () => {
  return (
    <Language.Navigator>
      <Language.Screen
        name='SelectLanguage'
        component={SelectLanguageScreen}
        options={{ headerShown: false }}
      />
    </Language.Navigator>
  )
}

function AppContainer() {
  const { language } = useSelector((state) => state.language)
  console.log({ language })
  const client = useApolloClient()
  const { location } = useContext(LocationContext)
  const { SENTRY_DSN } = useEnvVars()
  const lastNotificationResponse = Notifications.useLastNotificationResponse()

  const handleNotification = useCallback(
    async (response) => {
      const { _id } = response.notification.request.content.data
      const lastNotificationHandledId = await AsyncStorage.getItem(
        '@lastNotificationHandledId'
      )
      await client.query({
        query: gql`
          ${myOrders}
        `,
        fetchPolicy: 'network-only'
      })
      const identifier = response.notification.request.identifier
      if (lastNotificationHandledId === identifier) return
      await AsyncStorage.setItem('@lastNotificationHandledId', identifier)
      navigationService.navigate('OrderDetail', {
        _id
      })
    },
    [lastNotificationResponse]
  )

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data?.type ===
        'order' &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      handleNotification(lastNotificationResponse)
    }
  }, [lastNotificationResponse])

  useEffect(() => {
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: 'development',
        enableInExpoDevelopment: true,
        debug: true,
        tracesSampleRate: 1.0,
        enableNative: false
      })
    }
  }, [SENTRY_DSN])

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={(ref) => {
          navigationService.setGlobalRef(ref)
        }}
      >
        {!language ? (
          <LanguageStack />
        ) : !location ? (
          <LocationStack />
        ) : (
          <MainStack.Navigator initialRouteName='Drawer'>
            <MainStack.Screen
              name='Drawer'
              component={Drawer}
              options={{ headerShown: false }}
            />
          </MainStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default Sentry.withProfiler(AppContainer)
