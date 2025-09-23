import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  View,
  ImageBackground,
  Platform,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  AppState,
  ScrollView
} from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import { colors } from '../../utilities/colors'
import styles from './styles'
import { Icon } from 'react-native-elements/dist/icons/Icon'
import { useAccount } from '../../ui/hooks'
import { Image } from 'react-native-elements'
import useNotification from '../../ui/hooks/useNotification'
import { PRODUCT_URL, ABOUT_URL } from '../../utilities'
import { useTranslation } from 'react-i18next'
import Constants from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import IconVec from 'react-native-vector-icons/FontAwesome5'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import messaging from '@react-native-firebase/messaging'

export default function SideBar() {
  const { t, i18n } = useTranslation()
  const navigator = useNavigation()
  const notificationRef = useRef(true)
  const openSettingsRef = useRef(false)
  const { logout, data, toggleSwitch, isAvailable } = useAccount()
  const [notificationStatus, setNotificationStatus] = useState(false)
  const appState = useRef(AppState.currentState)

  const {
    restaurantData,
    getPermission,
    getDevicePushTokenAsync,
    requestPermission,
    sendTokenToBackend
  } = useNotification()

  useEffect(() => {
    const checkToken = async () => {
      if (restaurantData) {
        setNotificationStatus(restaurantData.restaurant.enableNotification)
        if (
          restaurantData.restaurant.enableNotification &&
          notificationRef.current
        ) {
          const permissionStatus = await getPermission()
          if (permissionStatus.granted) {
            setNotificationStatus(true)
            const token = await messaging().getToken()
            // const token = (
            //   await getDevicePushTokenAsync({
            //     projectId: Constants.expoConfig.extra.eas.projectId
            //   })
            // ).data
            console.log({ token })
            sendTokenToBackend({ variables: { token, isEnabled: true } })
          }
        }
        notificationRef.current = false
      }
    }
    checkToken()
  }, [restaurantData])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const checkTokenOnFocus = async () => {
          if (
            !notificationStatus &&
            (await getPermission()).granted &&
            openSettingsRef.current
          ) {
            setNotificationStatus(true)
            const token = await messaging().getToken()
            // const token = (
            //   await getDevicePushTokenAsync({
            //     projectId: Constants.expoConfig.extra.eas.projectId
            //   })
            // ).data
            console.log({ token })
            sendTokenToBackend({ variables: { token, isEnabled: true } })
          }
        }
        if (!notificationRef.current) checkTokenOnFocus()
      }

      appState.current = nextAppState
    })
    return () => {
      subscription && subscription.remove()
    }
  }, [])

  const handleClick = async () => {
    if (notificationStatus === false) {
      const permissionStatus = await getPermission()
      if (permissionStatus.granted) {
        setNotificationStatus(true)
        const token = await messaging().getToken()
        // const token = (
        //   await getDevicePushTokenAsync({
        //     projectId: Constants.expoConfig.extra.eas.projectId
        //   })
        // ).data
        console.log({ token })
        sendTokenToBackend({ variables: { token, isEnabled: true } })
      } else if (permissionStatus.canAskAgain) {
        const result = await requestPermission()
        if (result.granted) {
          setNotificationStatus(true)
          const token = await messaging().getToken()
          // const token = (
          //   await getDevicePushTokenAsync({
          //     projectId: Constants.expoConfig.extra.eas.projectId
          //   })
          // ).data
          console.log({ token })
          sendTokenToBackend({ variables: { token, isEnabled: true } })
        }
      } else {
        openSettingsRef.current = true
        Platform.OS === 'ios'
          ? Linking.openURL('app-settings:')
          : Linking.openSettings()
      }
    } else {
      setNotificationStatus(false)
      sendTokenToBackend({ variables: { token: null, isEnabled: false } })
    }
  }

  const isRtl = i18n.language === 'ar'

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={styles.topContainer}>
        <View style={{ ...styles.profileContainer, flexDirection: 'column' }}>
          <View style={styles.avatar}>
            <Image
              source={{ uri: data && data.restaurant.image }}
              containerStyle={styles.item}
              style={{ borderRadius: 5 }}
              PlaceholderContent={<ActivityIndicator />}
            />
          </View>
          <View style={{ width: '50%' }}>
            <TextDefault
              H5
              bolder
              center
              textColor="white"
              style={{
                marginTop: 20,
                textAlign: 'center'
              }}>
              {data && data.restaurant.name}
            </TextDefault>
          </View>
        </View>
      </View>
      <ScrollView style={styles.middleContainer}>
        <View
          style={[styles.status, isRtl && { flexDirection: 'row-reverse' }]}>
          <View
            style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
            <TextDefault
              H4
              bolder
              textColor="white"
              style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('status')}
            </TextDefault>
            <TextDefault
              textColor="white"
              style={{
                marginRight: 5,
                MarginLeft: 15,
                textAlign: isRtl ? 'right' : 'left'
              }}>
              {isAvailable ? t('online') : t('closed')}
            </TextDefault>
          </View>

          <Switch
            trackColor={{
              false: colors.fontSecondColor,
              true: colors.green
            }}
            thumbColor={isAvailable ? colors.headerBackground : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isAvailable}
            style={{ marginTop: Platform.OS === 'android' ? -15 : -5 }}
          />
        </View>

        <View
          style={[styles.status, isRtl && { flexDirection: 'row-reverse' }]}>
          <View
            style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
            <TextDefault
              H4
              bolder
              textColor="white"
              style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('notifications')}
            </TextDefault>
            <TextDefault
              textColor="white"
              style={{
                marginRight: 5,
                MarginLeft: 15,
                textAlign: isRtl ? 'right' : 'left'
              }}>
              {notificationStatus ? t('onn') : t('off')}
            </TextDefault>
          </View>

          <Switch
            trackColor={{
              false: colors.fontSecondColor,
              true: colors.green
            }}
            thumbColor={
              notificationStatus ? colors.headerBackground : '#f4f3f4'
            }
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleClick}
            value={notificationStatus}
            style={{ marginTop: Platform.OS === 'android' ? -15 : -5 }}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() => navigator.navigate('OrdersHistory')}>
          <View style={styles.icon}>
            {/* <FontAwesome5 name="shopping-cart" size={26} color="#fff" /> */}
            <MaterialCommunityIcons
              name="progress-clock"
              size={26}
              color="#fff"
            />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('orders_history')}
          </TextDefault>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() => navigator.navigate('FoodListing')}>
          <View style={styles.icon}>
            <FontAwesome5 name="shopping-cart" size={26} color="#fff" />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('products')}
          </TextDefault>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() => navigator.navigate('SelectLanguage')}>
          <View style={styles.icon}>
            <Icon type="font-awesome" color="white" name="language" size={26} />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('language')}
          </TextDefault>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() => navigator.navigate('AreasDeliveryCosts')}>
          <View style={styles.icon}>
            <IconVec color="white" name="map-marked-alt" size={26} />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('areas_cost')}
          </TextDefault>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() => navigator.navigate('PrinterSettings')}>
          <View style={styles.icon}>
            <Icon type="font-awesome" color="white" name="user" size={26} />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('settings')}
          </TextDefault>
        </TouchableOpacity>

        {/* <TouchableOpacity
            style={[
              styles.logout,
              isRtl && { flexDirection: 'row-reverse', gap: 10 }
            ]}
            activeOpacity={0.8}
            onPress={() =>
              Linking.canOpenURL(PRODUCT_URL).then(() => {
                Linking.openURL(PRODUCT_URL)
              })
            }>
            <View style={styles.icon}>
              <Icon
                type="font-awesome"
                color="white"
                name="product-hunt"
                size={26}
              />
            </View>
            <TextDefault
              H4
              bolder
              style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('productPage')}
            </TextDefault>
          </TouchableOpacity> */}

        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() =>
            Linking.canOpenURL('https://orderat.ai/#/privacy').then(() => {
              Linking.openURL('https://orderat.ai/#/privacy')
            })
          }>
          <View style={styles.icon}>
            <Icon type="font-awesome" color="white" name="lock" size={26} />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('privacyPolicy')}
          </TextDefault>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() =>
            Linking.canOpenURL(ABOUT_URL).then(() => {
              Linking.openURL(ABOUT_URL)
            })
          }>
          <View style={styles.icon}>
            <Icon
              type="font-awesome"
              color="white"
              name="info-circle"
              size={26}
            />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('aboutUs')}
          </TextDefault>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          activeOpacity={0.8}
          onPress={() => navigator.navigate('DeactivateAccount')}>
          <View style={{ width: '12%', marginInlineStart: 5 }}>
            {/* <Icon type="font-awesome" color="white" name="user" size={26} /> */}
            <FontAwesome name="ban" size={26} color="#fff" />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('DeactivateAccount')}
          </TextDefault>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          onPress={logout}>
          <View style={styles.icon}>
            <Icon type="entypo" color="white" name="log-out" size={26} />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('titleLogout')}
          </TextDefault>
        </TouchableOpacity>
      </ScrollView>

      {/* <View style={styles.lowerContainer}>
        <TouchableOpacity
          style={[
            styles.logout,
            isRtl && { flexDirection: 'row-reverse', gap: 10 }
          ]}
          onPress={logout}>
          <View style={styles.icon}>
            <Icon type="entypo" color="white" name="log-out" size={26} />
          </View>
          <TextDefault
            H4
            bolder
            style={[styles.text, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('titleLogout')}
          </TextDefault>
        </TouchableOpacity>
      </View> */}
    </View>
  )
}
