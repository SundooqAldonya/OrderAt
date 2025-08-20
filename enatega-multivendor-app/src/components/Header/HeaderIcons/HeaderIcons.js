import React, { useState, useContext } from 'react'
import {
  Ionicons,
  EvilIcons,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Feather,
  SimpleLineIcons
} from '@expo/vector-icons'
import { moderateScale, scale } from '../../../utils/scaling'
import styles from './styles'
import { Text, TouchableOpacity, View } from 'react-native'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import {
  useNavigation,
  CommonActions,
  useRoute
} from '@react-navigation/native'
import navigationService from '../../../routes/navigationService'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { HeaderBackButton } from '@react-navigation/elements'
import UserContext from '../../../context/User'
import { colors } from '../../../utils/colors'
import { useTranslation } from 'react-i18next'
const rippleColor = '#6FCF97'
function BackButton(props) {
  if (props.icon === 'leftArrow') {
    return (
      <Ionicons
        name='arrow-back'
        size={moderateScale(18)}
        style={styles().leftIconPadding}
        color={colors.white}
      />
    )
  } else if (props.icon === 'menu') {
    return (
      <SimpleLineIcons
        name='menu'
        size={moderateScale(20)}
        color={colors.white}
        style={styles().leftIconPadding}
      />
    )
  } else if (props.icon === 'dots') {
    return (
      <MaterialCommunityIcons
        name='dots-vertical'
        size={moderateScale(25)}
        color={colors?.dark}
      />
    )
  } else if (props.icon === 'target') {
    return (
      <MaterialIcons
        name='my-location'
        size={moderateScale(10)}
        color={colors?.white}
      />
    )
  } else if (props.icon === 'fav') {
    return (
      <AntDesign name='hearto' size={moderateScale(20)} color={colors?.white} />
    )
  } else {
    return (
      <EvilIcons
        name='close'
        size={scale(16)}
        style={styles().leftIconPadding}
        color={colors?.white}
      />
    )
  }
}

function LeftButton(props) {
  const navigation = useNavigation()
  if (props.icon === 'back') {
    return (
      <HeaderBackButton
        truncatedLabel=''
        backImage={() =>
          BackButton({ iconColor: colors?.background, icon: 'leftArrow' })
        }
        onPress={() => {
          navigationService.goBack()
        }}
      />
    )
  } else if (props.icon === 'close') {
    return (
      <HeaderBackButton
        truncatedLabel=''
        pressColorAndroid={rippleColor}
        labelVisible={false}
        backImage={() =>
          BackButton({ iconColor: colors?.background, icon: 'close' })
        }
        onPress={() => {
          navigation.dispatch((state) => {
            const routes = state.routes.filter((r) => r.name === 'Main')
            return CommonActions.reset({
              ...state,
              routes,
              index: 0
            })
          })
        }}
      />
    )
  } else if (props.toggle) {
    return (
      <HeaderBackButton
        truncatedLabel=''
        labelVisible={false}
        backImage={() =>
          BackButton({
            iconColor: colors?.background,
            icon: props.toggleValue ? 'leftArrow' : 'close'
          })
        }
        onPress={() =>
          props.toggleValue
            ? navigation.goBack()
            : props.toggleView((prev) => !prev)
        }
      />
    )
  } else {
    return (
      <HeaderBackButton
        truncatedLabel=''
        pressColorAndroid={rippleColor}
        labelVisible={false}
        backImage={() =>
          BackButton({ iconColor: colors?.background, icon: 'menu',  })
        }
        onPress={() => navigation.toggleDrawer()}
      />
    )
  }
}

function RightButton(props) {
  // const { t } = props
  const { t } = useTranslation()

  const [password, setPassword] = useState(false)
  const navigation = useNavigation()
  const route = useRoute()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { cartCount, isLoggedIn, profile } = useContext(UserContext)

  function showPasswordButton() {
    props.titlePosition((prev) => !prev)
    setPassword((prev) => !prev)
  }

  function clickPasswordButton() {
    props.titlePosition((prev) => !prev)
    setPassword((prev) => !prev)
    props.modalVisible((prev) => !prev)
  }

  function cartIcon() {
    return (
      <View style={styles().rightContainer}>
        <SimpleLineIcons
          name='handbag'
          size={moderateScale(20)}
          color={colors.white}
        />
        <View
          style={[
            styles(route.name === 'Main' ? 'black' : currentTheme.white)
              .absoluteContainer,
            { alignItems: 'center', justifyContent: 'center' }
          ]}
        >
          <TextDefault
            textColor={colors.white}
            style={{ fontSize: moderateScale(10) }}
            center
            bolder
          >
            {cartCount}
          </TextDefault>
        </View>
      </View>
    )
  }

  function navigateCart() {
    if (cartCount > 0) {
      navigation.navigate('Cart')
    } else {
      FlashMessage({
        message: t('cartIsEmpty')
      })
    }
  }
  if (props.icon === 'dots') {
    return (
      <View>
        {password ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles().rightContainer, styles().passwordContainer]}
            onPress={clickPasswordButton}
          >
            <View style={styles(currentTheme.cartContainer).titlePasswordText}>
              <TextDefault
                style={{ fontSize: scale(11) }}
                textColor={colors.dark}
                bold
              >
                {t('changePassword')}
              </TextDefault>
            </View>
          </TouchableOpacity>
        ) : (
          <HeaderBackButton
            truncatedLabel=''
            labelVisible={false}
            backImage={() => (
              <View style={styles().rightContainer}>
                {BackButton({ iconColor: colors.dark, icon: 'dots' })}
              </View>
            )}
            onPress={showPasswordButton}
          />
        )}
      </View>
    )
  } else if (props.icon === 'cart') {
    return (
      <View style={{ flexDirection: 'row' }}>
        <HeaderBackButton
          truncatedLabel=''
          pressColorAndroid={route.name === 'Main' && rippleColor}
          labelVisible={false}
          backImage={() => (
            <View style={styles().favContainer}>
              {BackButton({ iconColor: colors.dark, icon: 'fav' })}
            </View>
          )}
          bolder
          onPress={() =>
            isLoggedIn && profile
              ? navigation.navigate('Favourite')
              : navigation.navigate('CreateAccount')
          }
        />
        {cartCount >= 0 && (
          <HeaderBackButton
            truncatedLabel=''
            pressColorAndroid={route.name === 'Main' && rippleColor}
            labelVisible={false}
            backImage={cartIcon}
            onPress={navigateCart}
          />
        )}
      </View>
    )
  }
  //  else if (props.icon === 'target') {
  //   return (
  //     <HeaderBackButton
  //       truncatedLabel=''
  //       pressColorAndroid={rippleColor}
  //       labelVisible={false}
  //       backImage={() => (
  //         <View style={[styles().rightContainer]}>
  //           {BackButton({ iconColor: colors.white, icon: 'target' })}
  //         </View>
  //       )}
  //       onPress={props.onPressRight}
  //     />
  //   )
  // }
  else {
    return null
  }
}
function DarkBackButton(props) {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 5
      }}
    >
      <Ionicons
        name='close-circle-outline'
        size={moderateScale(20)}
        style={{ ...styles().darkBackArrow, color: '#000' }}
        color={colors.white}
      />
    </View>
  )
}
function HelpButton(props) {
  const { t } = props
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  console.log({ currentTheme: currentTheme.gray500 })
  console.log({ ThemeValue: themeContext.ThemeValue })
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.white,
        borderRadius: scale(10),
        margin: scale(5)
      }}
      onPress={() => props.navigation.navigate('Help')}
    >
      <Text
        style={{
          ...styles().rightButtonContainer,
          color: '#000',
          textAlign: 'center'
        }}
        // textColor={'#000'}
        center
        small
        bold
      >
        {t('help')}
      </Text>
    </TouchableOpacity>
  )
}
export { BackButton, LeftButton, RightButton, DarkBackButton, HelpButton }
