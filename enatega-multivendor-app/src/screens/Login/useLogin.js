import { useState, useContext, useRef } from 'react'
import { Alert } from 'react-native'
import _ from 'lodash'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import {
  login,
  emailExist,
  phoneExist,
  validatePhoneUnauth
} from '../../apollo/mutations'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import * as Notifications from 'expo-notifications'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import analytics from '../../utils/analytics'
import AuthContext from '../../context/Auth'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Toast from 'react-native-toast-message'

const LOGIN = gql`
  ${login}
`
const PHONE = gql`
  ${phoneExist}
`

export const useLogin = () => {
  const Analytics = analytics()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const navigation = useNavigation()
  const emailRef = useRef('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [registeredEmail, setRegisteredEmail] = useState(false)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { setTokenAsync } = useContext(AuthContext)
  const phone = useSelector((state) => state.phone.phone)

  const [mutatePhoneExists, { loading }] = useMutation(PHONE, {
    onCompleted,
    onError: onPhoneError
  })

  const [LoginMutation, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: onLoginCompleted,
    onError: onLoginError
  })

  // Debounce the setEmail function
  const setEmail = (email) => {
    emailRef.current = email
  }

  function validateCredentials() {
    let result = true
    setEmailError(null)
    setPasswordError(null)
    // if (!emailRef.current) {
    //   setEmailError(t('phoneErr1'))
    //   result = false
    // } else {
    // const emailRegex = /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/
    // if (emailRegex.test(emailRef.current) !== true) {
    //   setEmailError(t('emailErr2'))
    //   result = false
    // }
    // }
    if (!password && registeredEmail) {
      setPasswordError(t('passErr1'))
      result = false
    }
    return result
  }

  function onCompleted({ emailExist }) {
    setRegisteredEmail(true)
    if (validateCredentials()) {
      if (emailExist._id !== null) {
        if (
          emailExist.userType !== 'apple' &&
          emailExist.userType !== 'google' &&
          emailExist.userType !== 'facebook'
        ) {
          setRegisteredEmail(true)
        } else {
          FlashMessage({
            message: `${t('emailAssociatedWith')} ${emailExist.userType} ${t(
              'continueWith'
            )} ${emailExist.userType}`
          })
          navigation.navigate({ name: 'Main', merge: true })
        }
      } else {
        navigation.navigate('Register', { email: emailRef.current })
      }
    }
  }

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
        console.log({ error })
      }
    }
  )

  function onError(error) {
    console.log({ error })
    const firstTimeLogin = JSON.stringify(error).includes(
      'user_first_time_login'
    )
    const phoneNotExist = JSON.stringify(error).includes('phone_doesnt_exist')
    if (firstTimeLogin) {
      mutateValidate({
        variables: {
          phone: `+2${phone}`
        }
      })
    }
    if (phoneNotExist) {
      navigation.navigate('Register')
      return
    }
    try {
      if (error.includes)
        FlashMessage({
          message: error.graphQLErrors[0].message
        })
    } catch (e) {
      FlashMessage({
        message: t('mailCheckingError')
      })
    }
  }

  async function onLoginCompleted(data) {
    if (data.login.isActive == false) {
      FlashMessage({ message: t('accountDeactivated') })
    } else {
      try {
        setTokenAsync(data.login.token)
        navigation.navigate({
          name: 'Main',
          merge: true
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  function onPhoneError(error) {
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

  function onLoginError(error) {
    try {
      FlashMessage({
        message: error.graphQLErrors[0].message
      })
    } catch (e) {
      FlashMessage({ message: t('errorInLoginError') })
    }
  }

  async function loginAction(email, password) {
    try {
      if (validateCredentials()) {
        let notificationToken = null
        if (Device.isDevice) {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync()
          if (existingStatus === 'granted') {
            notificationToken = (
              await Notifications.getDevicePushTokenAsync({
                projectId: Constants.expoConfig.extra.eas.projectId
              })
            ).data
          }
        }
        LoginMutation({
          variables: {
            email: phone,
            password,
            type: 'default',
            notificationToken
          }
        })
      }
    } catch (e) {
      FlashMessage({
        message: t('errorWhileLogging')
      })
    } finally {
    }
  }

  function checkPhoneExists() {
    if (phone.length > 11) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('eleven_digits_number'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      return
    }
    mutatePhoneExists({ variables: { phone } })
  }

  function onBackButtonPressAndroid() {
    navigation.navigate({
      name: 'Main',
      merge: true
    })
    return true
  }

  return {
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    emailError,
    passwordError,
    registeredEmail,
    currentTheme,
    loading,
    loginLoading,
    loginAction,
    checkPhoneExists,
    onBackButtonPressAndroid,
    emailRef
  }
}
