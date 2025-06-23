import React, { Fragment, useContext, useState } from 'react'
import { View, StatusBar, Platform } from 'react-native'
import SideDrawerItems from '../Drawer/Items/DrawerItems'
import SideDrawerProfile from '../Drawer/Profile/DrawerProfile'
import { theme } from '../../utils/themeColors'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import UserContext from '../../context/User'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import styles from './styles'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import LogoutModal from './LogoutModal/LogoutModal'

import analytics from '../../utils/analytics'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { colors } from '../../utils/colors'
import TextDefault from '../Text/TextDefault/TextDefault'
import { SimpleLineIcons } from '@expo/vector-icons'
import { verticalScale } from '../../utils/scaling'
import MandoobImg from '../../assets/delivery_dark.png'
import { Image } from 'react-native'
import Toast from 'react-native-toast-message'
import { Linking } from 'react-native'
import { TouchableOpacity } from 'react-native'

function SidebBar(props) {
  const Analytics = analytics()

  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const datas = [
    {
      title: 'titleProfile',
      icon: (
        <SimpleLineIcons
          name={'user'}
          size={verticalScale(18)}
          color={currentTheme.darkBgFont}
        />
      ),
      navigateTo: 'Profile',
      isAuth: true
    },
    {
      title: 'titleOrders',
      icon: (
        <SimpleLineIcons
          name={'layers'}
          size={verticalScale(18)}
          color={currentTheme.darkBgFont}
        />
      ),
      navigateTo: 'MyOrders',
      isAuth: true
    },
    {
      title: 'myAddresses',
      icon: (
        <SimpleLineIcons
          name={'location-pin'}
          size={verticalScale(18)}
          color={currentTheme.darkBgFont}
        />
      ),
      navigateTo: 'Addresses',
      isAuth: true
    },
    {
      title: 'Favourite',
      icon: (
        <SimpleLineIcons
          name={'heart'}
          size={verticalScale(18)}
          color={currentTheme.darkBgFont}
        />
      ),
      navigateTo: 'Favourite',
      isAuth: true
    },

    {
      title: 'requestDeliveryTitle',
      icon: (
        <View>
          <Image source={MandoobImg} style={{ width: 30, height: 30 }} />
        </View>
      ),
      navigateTo: 'FromPlace',
      isAuth: true
    },
    {
      title: 'titleSettings',
      icon: (
        <SimpleLineIcons
          name={'settings'}
          size={verticalScale(18)}
          color={currentTheme.darkBgFont}
        />
      ),
      navigateTo: 'Settings',
      isAuth: true
    },
    {
      title: 'titleHelp',
      icon: (
        <SimpleLineIcons
          name={'question'}
          size={verticalScale(18)}
          color={currentTheme.darkBgFont}
        />
      ),
      navigateTo: 'Help',
      isAuth: true
    }
  ]
  const inset = useSafeAreaInsets()
  const { isLoggedIn, logout } = useContext(UserContext)

  const [modalVisible, setModalVisible] = useState(false)

  const handleCancel = () => {
    setModalVisible(false)
  }
  const handleLogout = async () => {
    setModalVisible(false)
    logout()
    props.navigation.closeDrawer()
    // FlashMessage({ message: t('logoutMessage') })
    Toast.show({
      type: 'success',
      text1: t('success'),
      text1Style: { textAlign: isArabic ? 'right' : 'left', fontSize: 16 },
      text2: t('logoutMessage'),
      text2Style: { textAlign: isArabic ? 'right' : 'left', fontSize: 16 }
    })
  }
  const logoutClick = () => {
    setModalVisible(true)
  }

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })

  return (
    <View
      style={[
        styles().flex,
        {
          justifyContent: 'space-between',
          paddingBottom: inset.bottom,
          backgroundColor: currentTheme.themeBackground
        }
      ]}
    >
      <View style={{ flexGrow: 1 }}>
        <View style={{ height: 100, paddingTop: 30 }}>
          <SideDrawerProfile navigation={props.navigation} />
        </View>
        <View style={styles(currentTheme).botContainer}>
          {/* {isLoggedIn ? (
            <View></View>
          ) : null} */}
          {isLoggedIn &&
            datas.map((dataItem, ind) => (
              <View
                key={ind}
                style={[
                  styles().item,
                  { borderBottomWidth: 0, marginVertical: 0 }
                ]}
              >
                <SideDrawerItems
                  style={styles(currentTheme).iconContainer}
                  onPress={async () => {
                    if (dataItem.isAuth && !isLoggedIn) {
                      props.navigation.navigate('CreateAccount')
                    } else {
                      props.navigation.navigate(dataItem.navigateTo)
                    }
                  }}
                  icon={dataItem.icon}
                  title={t(dataItem.title)}
                />
              </View>
            ))}
          {isLoggedIn ? (
            <Fragment>
              <TouchableOpacity
                style={[
                  styles().item,
                  { borderBottomWidth: 0, marginVertical: 5 }
                ]}
              >
                <SideDrawerItems
                  onPress={() =>
                    Linking.canOpenURL('https://orderat.ai/#/privacy').then(
                      () => {
                        Linking.openURL('https://orderat.ai/#/privacy')
                      }
                    )
                  }
                  icon={
                    <SimpleLineIcons
                      name={'info'}
                      size={verticalScale(18)}
                      color={currentTheme.darkBgFont}
                    />
                  }
                  title={t('privacy')}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles().item,
                  { borderBottomWidth: 0, marginVertical: 5 }
                ]}
              >
                <SideDrawerItems
                  onPress={logoutClick}
                  // icon={'logout'}
                  icon={
                    <SimpleLineIcons
                      name={'logout'}
                      size={verticalScale(18)}
                      color={currentTheme.darkBgFont}
                    />
                  }
                  title={t('titleLogout')}
                />
              </View>
              {/* <View
                style={[
                  styles().item,
                  {
                    borderBottomWidth: 0,
                    marginVertical: 10,
                    height: 50
                  }
                ]}
              >
                <SideDrawerItems
                  onPress={() => props.navigation.navigate(datas[4].navigateTo)}
                  icon={
                    <SimpleLineIcons
                      name={datas[4].icon}
                      size={verticalScale(18)}
                      color={currentTheme.darkBgFont}
                    />
                  }
                  title={t(datas[4].title)}
                />
              </View> */}
            </Fragment>
          ) : (
            <Fragment>
              <View
                style={[
                  styles().item,
                  {
                    borderBottomWidth: 0,
                    marginVertical: 10,
                    height: 50
                  }
                ]}
              >
                <SideDrawerItems
                  onPress={() => props.navigation.navigate('CreateAccount')}
                  // icon={'login'}
                  icon={
                    <SimpleLineIcons
                      name={'login'}
                      size={verticalScale(18)}
                      color={currentTheme.darkBgFont}
                    />
                  }
                  title={t('login_or_create')}
                />
              </View>
            </Fragment>
          )}
        </View>
      </View>

      <LogoutModal
        visible={modalVisible}
        onCancel={handleCancel}
        onLogout={handleLogout}
      />
    </View>
  )
}
export default SidebBar
