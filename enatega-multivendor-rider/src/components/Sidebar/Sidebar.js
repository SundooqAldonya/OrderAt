import React, { useContext } from 'react'
import { View, Platform, Switch, ImageBackground, Linking } from 'react-native'
import NavItem from './NavItem/NavItem'
import Profile from './Profile/Profile'
import styles from './styles'
import TextDefault from '../Text/TextDefault/TextDefault'
import colors from '../../utilities/colors'
const rider = require('../../assets/rider.png')
import useSidebar from './useSidebar'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import UserContext from '../../context/user'
import { stopBackgroundLocation } from '../../utilities/transistorBackgroundTracking'
// import { stopBackgroundUpdate } from '../../utilities/backgroundLocationTask'

function SidebBar() {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const { dataProfile } = useContext(UserContext)
  const {
    logout,
    isEnabled,
    isMuted,
    toggleMute,
    toggleSwitch,
    datas
  } = useSidebar()

  const handleMute = async () => {
    toggleMute()
  }

  const isArabic = i18n.language === 'ar'

  const handleLogout = () => {
    logout()
    // stopBackgroundUpdate()
    stopBackgroundLocation()
  }

  return (
    <ImageBackground
      source={rider}
      height={200}
      width={200}
      style={styles.image}>
      <View style={styles.flex}>
        <View style={[styles.topContainer, styles.opacity, { flex: 4 }]}>
          <Profile />
        </View>
        <View style={[styles.opacity, { flex: 4 }]}>
          {/* <View
            style={[
              styles.rowDisplay,
              isArabic && { flexDirection: 'row-reverse' }
            ]}>
            <TextDefault textColor={colors.white} H4 bolder>
              {t('status')}
            </TextDefault>
            <View style={styles.row}>
              <TextDefault
                H5
                bold
                textColor={colors.primary}
                style={styles.online}>
                {isEnabled ? t('available') : t('notAvailable')}
              </TextDefault>
              <Switch
                trackColor={{
                  false: colors.fontSecondColor,
                  true: dataProfile?.rider?.isActive ? colors.primary : 'gray'
                }}
                disabled={!dataProfile?.rider?.isActive}
                thumbColor={isEnabled ? colors.headerBackground : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
                style={{ marginTop: Platform.OS === 'android' ? -12 : -5 }}
              />
            </View>
          </View> */}
          <View
            style={[
              styles.rowDisplay,
              isArabic && { flexDirection: 'row-reverse' }
            ]}>
            <TextDefault textColor={colors.white} H4 bolder>
              {t('muted')}
            </TextDefault>
            <View style={styles.row}>
              <TextDefault
                H5
                bold
                textColor={colors.primary}
                style={styles.online}>
                {isMuted ? t('muted') : t('notMuted')}
              </TextDefault>
              <Switch
                trackColor={{
                  false: colors.fontSecondColor,
                  true: colors.primary
                }}
                thumbColor={isMuted ? colors.headerBackground : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleMute}
                value={isMuted}
                style={{ marginTop: Platform.OS === 'android' ? -12 : -5 }}
              />
            </View>
          </View>
          <View style={styles.item}>
            <NavItem
              onPress={() => navigation.navigate('Home')}
              icon={'home'}
              title={t('NewOrders')}
              reverse={isArabic}
            />
          </View>
          {/* <View style={styles.item}>
            <NavItem
              onPress={() => navigation.navigate('Wallet')}
              icon={'wallet'}
              title={t('wallet')}
              reverse={isArabic}
            />
          </View> */}
          <View style={styles.item}>
            <NavItem
              onPress={() => navigation.navigate('MyOrders')}
              icon={'clock-o'}
              title={t('myorders')}
              reverse={isArabic}
            />
          </View>
          <View style={styles.item}>
            <NavItem
              onPress={() => navigation.navigate('Language')}
              icon={'language'}
              title={t('language')}
              reverse={isArabic}
            />
          </View>
          <View style={styles.item}>
            <NavItem
              onPress={() =>
                Linking.canOpenURL('https://orderat.ai/#/privacy').then(() => {
                  Linking.openURL('https://orderat.ai/#/privacy')
                })
              }
              icon="info"
              title={t('privacy')}
              reverse={isArabic}
            />
          </View>
        </View>
        <View style={[styles.opacity, { flex: 2 }]}>
          <NavItem
            onPress={handleLogout}
            icon="sign-out"
            title={t('titleLogout')}
            reverse={isArabic}
          />
        </View>
      </View>
    </ImageBackground>
  )
}

export default SidebBar
