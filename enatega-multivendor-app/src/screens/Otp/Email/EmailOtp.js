import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, TouchableOpacity, StatusBar, Image, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../styles'
import Spinner from '../../../components/Spinner/Spinner'
import TextDefault from '../../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import screenOptions from '../screenOptions'
// import OTPInputView from '@twotalltotems/react-native-otp-input'
import useEmailOtp from './useEmailOtp'
import { useTranslation } from 'react-i18next'
import { SimpleLineIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { scale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'
import CustomOtpInput from '../../../components/CustomOTP'
import { useMutation } from '@apollo/client'
import { submitEmailOTP } from '../../../apollo/mutations'
import Toast from 'react-native-toast-message'

function EmailOtp(props) {
  const navigation = useNavigation()
  const {
    // otp,
    // setOtp,
    otpError,
    seconds,
    loading,
    updateUserLoading,
    onCodeFilled,
    resendOtp,
    currentTheme
  } = useEmailOtp()

  const [otp, setOtp] = useState(new Array(4).fill(''))

  const { editProfile } = useRoute().params

  useEffect(() => {
    resendOtp()
  }, [])

  const [mutateOtp] = useMutation(submitEmailOTP, {
    onCompleted: (data) => {
      console.log({ data })
      if (editProfile) {
        navigation.navigate('Profile')
      } else {
        navigation.navigate('Main')
      }
    },
    onError: (error) => {
      console.log({ error })
      const errorMessage = JSON.stringify(error).split(':').pop()
      const cleanedMessage = errorMessage.replace(/[^a-zA-Z0-9_]/g, '')
      console.log({ cleanedMessage })
      Toast.show({
        type: 'error',
        text1: t(cleanedMessage),
        visibilityTime: 10000
      })
    }
  })

  const route = useRoute()
  const userData = route.params?.user
  // console.log({ userData })
  const { t } = useTranslation()
  if (!t) {
    console.error('useTranslation() returned null. Check i18n setup.')
  }
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

  const onCodeFilledHandler = (code) => {
    try {
      if (onCodeFilled) {
        onCodeFilled(code)
      } else {
        console.warn('onCodeFilled function is undefined')
      }
    } catch (error) {
      console.error('Error in onCodeFilled:', error)
    }
  }

  const handleOTPSubmit = () => {
    if (!otp[0] || !otp[1] || !otp[2] || !otp[3]) {
      Alert.alert('Error', 'Should fill the code')
    } else {
      mutateOtp({
        variables: {
          email: userData.email,
          otp: otp.join('')
        }
      })
    }
  }

  return (
    <SafeAreaView style={styles(currentTheme).safeAreaViewStyles}>
      <StatusBar backgroundColor={colors.primary} barStyle={'light-content'} />
      <View style={styles(currentTheme).mainContainer}>
        <View style={styles().subContainer}>
          <View style={styles().logoContainer}>
            <SimpleLineIcons
              name='envelope'
              size={30}
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
              {t('verifyEmail')}
            </TextDefault>
            <TextDefault
              H5
              bold
              textColor={currentTheme.fontSecondColor}
              style={{
                paddingBottom: scale(5)
              }}
            >
              {t('otpSentToEmail')}
            </TextDefault>
            <TextDefault H5 bold textColor={currentTheme.newFontcolor}>
              {userData.email}
            </TextDefault>
          </View>
          <View>
            <CustomOtpInput
              pinCount={4}
              otp={otp}
              setOtp={setOtp}
              onCodeFilled={(code) => console.log('OTP:', code)}
            />
            <TouchableOpacity
              onPress={handleOTPSubmit}
              style={[
                styles(currentTheme).btn,
                {
                  marginTop: 50
                }
              ]}
            >
              <TextDefault>{t('correct')}</TextDefault>
            </TouchableOpacity>
            {/* <OTPInputView
              pinCount={4}
              style={styles().otpInput}
              codeInputFieldStyle={[
                styles(currentTheme).otpBox,
                otpError && styles(currentTheme).errorInput
              ]}
              codeInputHighlightStyle={{
                borderColor: currentTheme.main
              }}
              autoFocusOnLoad
              code={code}
              onCodeChanged={(code) => setCode(code)}
              onCodeFilled={onCodeFilledHandler}
              editable
            /> */}
            {otpError && (
              <TextDefault
                style={styles(currentTheme).error}
                bold
                textColor={currentTheme.textErrorColor}
              >
                {t('wrongOtp')}
              </TextDefault>
            )}
          </View>
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
        <View
          style={{
            ...alignment.MTlarge,
            ...alignment.MTlarge,
            width: '100%',
            marginBottom: 20
          }}
        >
          <View style={alignment.MBxSmall}>
            <TextDefault
              center
              H4
              bold
              style={alignment.MTsmall}
              textColor={currentTheme.fontNewColor}
            >
              {seconds === 0 ? '' : `${t('retry')} ${seconds}s`}
            </TextDefault>
          </View>
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
              disabled={seconds !== 0}
              onPress={() => resendOtp()}
            >
              <TextDefault H4 textColor={currentTheme.black} bold>
                {t('resendBtn')}
              </TextDefault>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
export default EmailOtp
