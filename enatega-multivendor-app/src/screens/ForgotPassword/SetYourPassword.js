import React, { useContext, useLayoutEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import Spinner from '../../components/Spinner/Spinner'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import { useResetYourPassword } from './useResetYourPassword'
import { useTranslation } from 'react-i18next'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../utils/colors'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { useMutation } from '@apollo/client'
import { resetPasswordCustomer } from '../../apollo/mutations'
import Toast from 'react-native-toast-message'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

function SetYourPassword(props) {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const phone = useSelector((state) => state.phone.phone)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const [mutateResetPassword, { loading }] = useMutation(
    resetPasswordCustomer,
    {
      onCompleted: (res) => {
        console.log({ res })
        navigation.navigate('Login')
      },
      onError: (err) => {
        console.log({ err })
      }
    }
  )

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        iconColor: currentTheme.newIconColor,
        backColor: currentTheme.themeBackground,
        fontColor: currentTheme.newFontcolor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('password_not_match'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
    } else {
      mutateResetPassword({
        variables: {
          phone,
          password
        }
      })
    }
  }

  return (
    <SafeAreaView style={styles(currentTheme).safeAreaViewStyles}>
      <StatusBar backgroundColor={colors.primary} barStyle={'light-content'} />
      <View style={styles(currentTheme).mainContainer}>
        <View style={styles().subContainer}>
          <View
            style={{
              ...styles().logoContainer,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <Feather name='lock' size={30} color={currentTheme.newIconColor} />
          </View>
          <View>
            <TextDefault
              H3
              bolder
              textColor={currentTheme.newFontcolor}
              style={{
                ...alignment.MTlarge,
                ...alignment.MBmedium,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {t('setYourPassword')}
            </TextDefault>
            <TextDefault
              H5
              bold
              textColor={currentTheme.fontSecondColor}
              style={{
                ...styles().enterPass,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {t('enterPass')}
            </TextDefault>
          </View>
          <View style={styles().passwordField}>
            <TextInput
              secureTextEntry
              placeholder={t('password')}
              style={[styles(currentTheme).textField, styles().passwordInput]}
              placeholderTextColor={currentTheme.fontSecondColor}
              value={password}
              onChangeText={(e) => setPassword(e)}
            />
          </View>

          <View style={[styles().passwordField, styles().confirmField]}>
            <TextInput
              secureTextEntry
              placeholder={t('confirmPassword')}
              style={[styles(currentTheme).textField, styles().passwordInput]}
              placeholderTextColor={currentTheme.fontSecondColor}
              value={confirmPassword}
              onChangeText={(e) => setConfirmPassword(e)}
            />
          </View>
        </View>
        <View style={{ width: '100%', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.7}
            style={styles(currentTheme).btn}
          >
            {loading ? (
              <Spinner
                size='small'
                backColor='transparent'
                spinnerColor={currentTheme.white}
              />
            ) : (
              <TextDefault H4 textColor={currentTheme.black} bold>
                {t('saveBtn')}
              </TextDefault>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
export default SetYourPassword
