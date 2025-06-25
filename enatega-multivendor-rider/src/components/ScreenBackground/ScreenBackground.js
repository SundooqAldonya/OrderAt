import React from 'react'
import {
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './style'
import { useNavigation } from '@react-navigation/native'
import { Switch } from 'react-native'
import colors from '../../utilities/colors'
import { useContext } from 'react'
import UserContext from '../../context/user'
import useSidebar from '../Sidebar/useSidebar'
import TextDefault from '../Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import Feather from '@expo/vector-icons/Feather'
import { useDrawerStatus } from '@react-navigation/drawer'

// const RiderLogin = require('../../assets/svg/RiderLogin.png')

const ScreenBackground = ({ children }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  const { dataProfile } = useContext(UserContext)

  const { isEnabled, toggleSwitch } = useSidebar()

  const drawerStatus = useDrawerStatus()

  const handleOpenDrawer = () => {
    if (drawerStatus !== 'open') {
      navigation.openDrawer()
    }
  }

  return (
    <SafeAreaView style={[styles.flex, styles.bgColor]}>
      <StatusBar
        backgroundColor={styles.bgColor.backgroundColor}
        barStyle="dark-content"
      />
      <TouchableOpacity style={styles.hamburger} onPress={handleOpenDrawer}>
        <Feather name="menu" size={34} color="black" />
        {/* <View style={styles.line}></View>
        <View style={styles.line}></View>
        <View style={styles.line}></View> */}
      </TouchableOpacity>
      <View style={styles.container}>
        <View
          style={{
            height: 150,
            width: '100%'
          }}>
          <TextDefault
            H5
            bold
            textColor={isEnabled ? colors.primary : 'red'}
            style={{
              marginTop: 55,
              textAlign: 'center',
              fontSize: 24
            }}>
            {isEnabled ? t('available') : t('notAvailable')}
          </TextDefault>
        </View>
        {/* <Image
          source={RiderLogin}
          style={[styles.image]}
          height={150}
          width={250}
        /> */}
        {children}
      </View>
      <View style={styles.toggleContainer}>
        <Switch
          trackColor={{
            false: colors.fontSecondColor,
            true: dataProfile?.rider?.isActive ? colors.primary : 'gray'
          }}
          disabled={!dataProfile?.rider?.isActive}
          thumbColor={isEnabled ? 'green' : 'red'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={{
            transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
            marginTop: Platform.OS === 'android' ? -12 : -5
          }}
        />
      </View>
    </SafeAreaView>
  )
}

export default ScreenBackground
