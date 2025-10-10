import React, { Fragment, useContext, useState } from 'react'
import { View, StatusBar, Platform, ScrollView } from 'react-native'
import SideDrawerItems from '../Drawer/Items/DrawerItems'
import SideDrawerProfile from '../Drawer/Profile/DrawerProfile'
import { theme } from '../../utils/themeColors'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import {
  FontAwesome5,
  MaterialIcons,
  SimpleLineIcons
} from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { moderateScale, verticalScale } from '../../utils/scaling'
import MandoobImg from '../../assets/delivery_dark.png'
import { Image } from 'react-native'
import Toast from 'react-native-toast-message'
import { Linking } from 'react-native'
import { TouchableOpacity } from 'react-native'

function SidebBar(props) {
  const Analytics = analytics()
  const navigation = useNavigation()
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
      title: 'change_language',
      icon: (
        <View>
          <Icon
            name={'language'}
            size={verticalScale(18)}
            color={'#000'}
          />
        </View>
      ),
      navigateTo: 'SelectLanguageScreen',
      isAuth: true
    },
    {
      title: 'citySelect',
      icon: <MaterialIcons name='location-city' size={verticalScale(18)} color='black' />,
      navigateTo: 'CityListScreen',
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
    navigation.closeDrawer()
    Toast.show({
      type: 'success',
      text1: t('success'),
      text1Style: { textAlign: isArabic ? 'right' : 'left', fontSize: 16 },
      text2: t('logoutMessage'),
      text2Style: { textAlign: isArabic ? 'right' : 'left', fontSize: 16 }
    })
  }
  const logoutClick = () => {
    console.log('Cakked')
    setModalVisible(true)
  }

  // useFocusEffect(() => {
  //   if (Platform.OS === 'android') {
  //     StatusBar.setBackgroundColor(colors.primary)
  //   }
  //   StatusBar.setBarStyle('light-content')
  // })

  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{
        paddingBottom: inset.bottom,
        flexGrow: 1
      }}
    >
      <SafeAreaView edges={['top']}>
        <SideDrawerProfile navigation={props.navigation} />
      </SafeAreaView>

      <View style={styles(currentTheme).botContainer}>
        {isLoggedIn ?
        <>
          {datas.map((dataItem, ind) => (
            <View
              key={ind}
              style={[
                styles().item,
                { borderBottomWidth: 0, marginVertical: 0 }
              ]}
            >
              <SideDrawerItems
                // style={styles(currentTheme).iconContainer}
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
             <View
              style={[
                styles().item,
                { borderBottomWidth: 0, marginVertical: 0 }
              ]}
            >
              <SideDrawerItems
                onPress={() => Linking.openURL('https://orderat.ai/#/privacy')}
                icon={
                  <SimpleLineIcons
                    name={'info'}
                    size={moderateScale(18)}
                    color={currentTheme.darkBgFont}
                  />
                }
                title={t('privacy')}
              />
              </View>
              <View
              style={[
                styles().item,
                { borderBottomWidth: 0, marginVertical: 0 }
              ]}
            >
              <SideDrawerItems
                onPress={logoutClick}
                icon={
                  <SimpleLineIcons
                    name={'logout'}
                    size={moderateScale(18)}
                    color={currentTheme.darkBgFont}
                  />
                }
                title={t('titleLogout')}
                // style={{marginVertical: 10 }}
              />
            </View>
          </>
          
          : <View
            style={[
              styles().item,
              { borderBottomWidth: 0, marginVertical: 10 }
            ]}
          >
            <SideDrawerItems
              onPress={() => props.navigation.navigate('CreateAccount')}
              icon={
                <SimpleLineIcons
                  name={'login'}
                  size={moderateScale(18)}
                  color={currentTheme.darkBgFont}
                />
              }
              title={t('login_or_create')}
            />
          </View>
          }
      </View>

      <LogoutModal
        visible={modalVisible}
        onCancel={handleCancel}
        onLogout={handleLogout}
      />
    </ScrollView>
  )
}
export default SidebBar
