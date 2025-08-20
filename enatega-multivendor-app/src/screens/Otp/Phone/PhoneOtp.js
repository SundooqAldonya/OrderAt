import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Text
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../styles'
import Spinner from '../../../components/Spinner/Spinner'
import TextDefault from '../../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import screenOptions from '../screenOptions'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import usePhoneOtp from './usePhoneOtp'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale, scale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'
import { useSelector } from 'react-redux'
import CustomOtpInput from '../../../components/CustomOTP'
import { useMutation } from '@apollo/client'
import {
  validatePhone,
  validatePhoneUnauth,
  verifyPhoneOTP
} from '../../../apollo/mutations'
import Toast from 'react-native-toast-message'
import usePhoneNumber from '../../PhoneNumber/usePhoneNumber'
import { useNavigation, useRoute } from '@react-navigation/native'

function PhoneOtp(props) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigation = useNavigation()
  const route = useRoute()
  const { forgotPassword = false } = route.params || {}

  // console.log({ createUser })

  const {
    // phone,
    setSeconds,
    seconds,
    loading,
    updateUserLoading,
    resendOtp,
    currentTheme,
    themeContext
  } = usePhoneOtp()

  const { country } = usePhoneNumber()

  const phone = useSelector((state) => state.phone.phone)
  console.log({ phone })
  const [code, setCode] = useState(new Array(4).fill('')) // 4703

  const [mutateVerify] = useMutation(verifyPhoneOTP, {
    onCompleted: (res) => {
      console.log({ res })
      setCode(new Array(4).fill(''))
      if (forgotPassword) {
        navigation.navigate('SetYourPassword')
      } else {
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: t('phone_verified'),
          text1Style: {
            textAlign: isArabic ? 'right' : 'left'
          },
          text2Style: {
            textAlign: isArabic ? 'right' : 'left'
          }
        })
        navigation.navigate('Main')
      }
    },
    onError: (err) => {
      console.log({ err })
      const message =
        err?.graphQLErrors?.[0]?.message.split(': ')[1] || 'unknown_error'
      console.log({ message })
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t(message),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
    }
  })

  const [mutateValidate, { loading: loadingValidate }] = useMutation(
    validatePhoneUnauth,
    {
      onCompleted: (res) => {
        console.log({ res })
        setSeconds(30)
      },
      onError: (err) => {
        console.log({ err })
      }
    }
  )

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        iconColor: currentTheme.newIconColors,
        backColor: currentTheme.themeBackground,
        fontColor: currentTheme.newFontcolor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  console.log({ phone })

  const onCodeFilled = (otp) => {
    mutateVerify({
      variables: {
        otp,
        phone
      }
    })
  }

  console.log({ country })

  const handleResend = () => {
    mutateValidate({
      variables: {
        phone: `+2${phone}`
      }
    })
  }

  return (
    <SafeAreaView style={styles(currentTheme).safeAreaViewStyles}>
      <StatusBar backgroundColor={colors.primary} barStyle={'light-content'} />

      <View style={styles(currentTheme).mainContainer}>
        <View style={styles().subContainer}>
          <View style={styles().logoContainer}>
            <Ionicons
              name='phone-portrait-outline'
              size={moderateScale(30)}
              color={currentTheme.newIconColor}
            />
          </View>
          <View>
            <TextDefault
              H3
              bolder
              textColor={currentTheme.newFontcolor}
              style={{
                ...alignment.MTlarge,
                ...alignment.MBmedium
              }}
            >
              {t('verifyPhone')}
            </TextDefault>
            <TextDefault
              H5
              bold
              textColor={currentTheme.color6}
              style={{
                paddingBottom: scale(5)
              }}
            >
              {t('enterOtp')}
            </TextDefault>
            <TextDefault H5 bold textColor={currentTheme.fontfourthColor}>
              {phone}
            </TextDefault>
          </View>
          <CustomOtpInput
            pinCount={4}
            otp={code}
            setOtp={setCode}
            onCodeFilled={onCodeFilled}
          />
          {/* <View>
            <OTPInputView
              pinCount={6}
              style={styles().otpInput}
              codeInputFieldStyle={[
                styles(currentTheme).otpBox,
                otpError && styles().errorInput
              ]}
              codeInputHighlightStyle={{
                borderColor: currentTheme.iconColorPink
              }}
              autoFocusOnLoad
              code={code}
              onCodeChanged={(code) => setCode(code)}
              onCodeFilled={(code) => {
                onCodeFilled(code)
              }}
              editable
            />
            {otpError && (
              <TextDefault
                style={styles().error}
                bold
                textColor={currentTheme.textErrorColor}
              >
                {t('wrongOtp')}
              </TextDefault>
            )}
          </View> */}
        </View>
        <View>
          {loading ||
            (updateUserLoading && (
              <Spinner
                backColor={currentTheme.themeBackground}
                spinnerColor={currentTheme.main}
                size='large'
              />
            ))}
        </View>
        <View style={styles().btnContainer}>
          <View style={alignment.MBxSmall}>
            <TextDefault
              center
              H4
              bold
              textColor={currentTheme.fontNewColor}
              style={alignment.MTsmall}
            >
              {seconds !== 0 ? `${t('retry')} ${seconds}s` : ''}
            </TextDefault>
          </View>
          <View>
            {loading || updateUserLoading ? (
              <Spinner
                backColor={currentTheme.color3}
                spinnerColor={currentTheme.color3}
                size='small'
              />
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles(currentTheme).btn,
                  seconds !== 0 && styles(currentTheme).disabledBtn
                ]}
                disabled={seconds !== 0 || loadingValidate}
                // onPress={() => resendOtp()}
                onPress={handleResend}
              >
                <TextDefault
                  H4
                  textColor={currentTheme.black}
                  style={alignment.MLsmall}
                  bold
                >
                  {t('resendBtn')}
                </TextDefault>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
export default PhoneOtp
