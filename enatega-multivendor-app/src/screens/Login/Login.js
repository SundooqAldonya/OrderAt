import React, { useContext, useLayoutEffect } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import Spinner from '../../components/Spinner/Spinner'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons'
import { useLogin } from './useLogin'
import screenOptions from './screenOptions'
import { useTranslation } from 'react-i18next'
import { moderateScale, scale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
import { setPhone } from '../../store/phoneSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import { customerLogin, validatePhoneUnauth } from '../../apollo/mutations'
import AuthContext from '../../context/Auth'
import Toast from 'react-native-toast-message'
import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
// import Constants from 'expo-constants'
import messaging from '@react-native-firebase/messaging'

function Login(props) {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const phone = useSelector((state) => state.phone.phone)
  const {
    // setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    registeredEmail,
    loading,
    loginLoading,
    loginAction,
    currentTheme,
    showPassword,
    setShowPassword,
    checkPhoneExists,
    emailRef
  } = useLogin()

  const { setTokenAsync } = useContext(AuthContext)

  const [mutateValidate, { loading: loadingValidate }] = useMutation(
    validatePhoneUnauth,
    {
      onCompleted: (res) => {
        console.log({ res })
        navigation.navigate('PhoneOtp', {
          forgotPassword: true
        })
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: t('wrong_credentials'),
          text1Style: {
            textAlign: isArabic ? 'right' : 'left'
          },
          text2Style: {
            textAlign: isArabic ? 'right' : 'left'
          }
        })
        console.log({ error })
      }
    }
  )

  const [mutateLogin, { loading: customerLoading }] = useMutation(
    customerLogin,
    {
      onCompleted: (res) => {
        console.log({ res })
        setTokenAsync(res.customerLogin.token)
        navigation.navigate({
          name: 'Main',
          merge: true
        })
      },
      onError: (err) => {
        console.log({ err })
        const message = err?.graphQLErrors?.[0]?.message
        console.log({ errorMessage: message })
        if (message.includes('no_password_set')) {
          mutateValidate({
            variables: {
              phone: `+2${phone}`
            }
          })
          // Redirect to forgot password flow
          navigation.navigate('PhoneOtp', {
            forgotPassword: true
          })
          return
        }
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: t('wrong_credentials'),
          text1Style: {
            textAlign: isArabic ? 'right' : 'left'
          },
          text2Style: {
            textAlign: isArabic ? 'right' : 'left'
          }
        })
      }
    }
  )

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        backColor: currentTheme.themeBackground,
        fontColor: currentTheme.newFontcolor,
        iconColor: currentTheme.newIconColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  const handleSubmitLogin = async () => {
    let notificationToken = null
    // permissions for IOS
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      alert('Please enable notifications in settings for better experience')
    }
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      if (existingStatus === 'granted') {
        notificationToken = await messaging().getToken()
        // notificationToken = (
        //   await Notifications.getDevicePushTokenAsync({
        //     projectId: Constants.expoConfig.extra.eas.projectId
        //   })
        // ).data
      }
    }
    console.log({ notificationToken })
    mutateLogin({
      variables: {
        phone,
        password,
        notificationToken
      }
    })
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={styles(currentTheme).safeAreaViewStyles}
    >
      <ScrollView
        style={styles().flex}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles().flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
        >
          <View style={styles(currentTheme).mainContainer}>
            <View style={styles().subContainer}>
              <View
                style={{
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                }}
              >
                <SimpleLineIcons
                  name='envelope'
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
                    ...alignment.MBmedium,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {registeredEmail
                    ? t('enterEmailPassword')
                    : t('whatsYourPhone')}
                </TextDefault>

                <TextDefault
                  H5
                  bold
                  textColor={currentTheme.horizontalLine}
                  style={{
                    ...alignment.MBmedium,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {registeredEmail ? t('emailExists') : t('checkAccount')}
                </TextDefault>
              </View>
              <View style={styles().form}>
                <View>
                  <View>
                    <TextInput
                      placeholder={t('phone_placeholder')}
                      keyboardType='number-pad'
                      style={[
                        styles(currentTheme).textField,
                        emailError !== null
                          ? styles(currentTheme).errorInput
                          : {}
                      ]}
                      placeholderTextColor={currentTheme.fontSecondColor}
                      autoCapitalize='none'
                      defaultValue=''
                      onChangeText={(text) => {
                        // setEmail(text.toLowerCase().trim())
                        dispatch(setPhone({ phone: text }))
                      }}
                    />
                    {emailError !== null && (
                      <TextDefault
                        style={{
                          ...styles().error,
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                        bold
                        textColor={currentTheme.textErrorColor}
                      >
                        {emailError}
                      </TextDefault>
                    )}
                  </View>
                  {registeredEmail && (
                    <>
                      <View style={styles().passwordField}>
                        <TextInput
                          secureTextEntry={showPassword}
                          autoCapitalize='none'
                          placeholder={t('password')}
                          style={[
                            styles(currentTheme).textField,
                            styles().passwordInput,
                            passwordError !== null
                              ? styles(currentTheme).errorInput
                              : {}
                          ]}
                          placeholderTextColor={currentTheme.fontSecondColor}
                          value={password}
                          onChangeText={(e) => setPassword(e)}
                        />
                        <FontAwesome
                          onPress={() => setShowPassword(!showPassword)}
                          name={!showPassword ? 'eye' : 'eye-slash'}
                          size={moderateScale(20)}
                          color={
                            passwordError === null
                              ? currentTheme.newFontcolor
                              : currentTheme.textErrorColor
                          }
                          style={[styles().eyeBtn]}
                        />
                      </View>
                      {passwordError !== null && (
                        <View>
                          <TextDefault
                            style={styles().error}
                            bold
                            textColor={currentTheme.textErrorColor}
                          >
                            {passwordError}
                          </TextDefault>
                        </View>
                      )}
                      <View
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row'
                        }}
                      >
                        <TouchableOpacity
                          style={alignment.MBsmall}
                          onPress={() =>
                            props.navigation.navigate('ForgotPassword', {
                              email: emailRef.current
                            })
                          }
                        >
                          <TextDefault
                            textColor={currentTheme.main}
                            style={alignment.MTsmall}
                            bolder
                          >
                            {t('forgotPassword')}
                          </TextDefault>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      registeredEmail ? handleSubmitLogin() : checkPhoneExists()
                    }
                    activeOpacity={0.7}
                    style={[
                      styles(currentTheme).btn,
                      { backgroundColor: colors.primary }
                    ]}
                  >
                    <TextDefault H4 textColor={currentTheme.black} bold>
                      {loading || loginLoading || customerLoading ? (
                        <Spinner
                          backColor='transparent'
                          spinnerColor={currentTheme.white}
                          size='small'
                        />
                      ) : registeredEmail ? (
                        t('loginBtn')
                      ) : (
                        t('continueBtn')
                      )}
                    </TextDefault>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Login
