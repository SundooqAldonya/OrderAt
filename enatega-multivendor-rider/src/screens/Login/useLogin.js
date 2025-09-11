import { useContext, useState } from 'react'
import { Alert, Dimensions } from 'react-native'
import { riderLogin } from '../../apollo/mutations'
import { defaultRiderCreds } from '../../apollo/queries'
import { AuthContext } from '../../context/auth'
import { FlashMessage } from '../../components/FlashMessage/FlashMessage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { gql, useMutation, useQuery } from '@apollo/client'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { useTranslation } from 'react-i18next'
import Constants from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import { playCustomSound } from '../../utilities/playSound'
import { startBackgroundUpdate } from '../../utilities/backgroundLocationTask'
import messaging from '@react-native-firebase/messaging'

const RIDER_LOGIN = gql`
  ${riderLogin}
`
const RIDER_CREDS = gql`
  ${defaultRiderCreds}
`

const useLogin = () => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const { height } = Dimensions.get('window')
  const navigation = useNavigation()
  const { setTokenAsync } = useContext(AuthContext)

  const [mutate, { loading }] = useMutation(RIDER_LOGIN, {
    onCompleted,
    onError
  })

  useQuery(RIDER_CREDS, { onCompleted, onError })

  function validateForm() {
    let result = true
    setUsernameError('')
    setPasswordError('')
    if (!username) {
      setUsernameError(t('emptyUsernameError'))
      result = false
    }
    if (!password) {
      setPasswordError(t('emptyPasswordError'))
      result = false
    }
    return result
  }

  async function onCompleted({ riderLogin, lastOrderCreds }) {
    console.log('onCompleted data')
    if (riderLogin) {
      FlashMessage({ message: t('loginFlashMsg') })
      await AsyncStorage.setItem('rider-id', riderLogin.userId)
      await setTokenAsync(riderLogin.token)
      // startBackgroundUpdate().catch(console.warn)
      navigation.navigate('Home')
    } else {
      if (
        lastOrderCreds &&
        lastOrderCreds.riderUsername &&
        lastOrderCreds.riderPassword
      ) {
        if (process.env.NODE_ENV === 'development') {
          setUsername(lastOrderCreds.riderUsername || '')
          setPassword(lastOrderCreds.riderPassword || '')
        }
      } else {
        setUsername('')
        setPassword('')
      }
    }
  }
  function onError(error) {
    let message = 'Check internet connection'
    console.log('going in', error)
    try {
      const rawMessage = error.message || 'An unexpected error occurred.'
      const extractedMessage =
        rawMessage.match(/Error: (.*)\]/)?.[1] || rawMessage
      console.log({ extractedMessage })
      Alert.alert(extractedMessage)
    } catch (error) {
      console.log({ err })
    }
    // setUsername('')
    // setPassword('')
  }

  async function onSubmit() {
    console.log(validateForm(), 'form da')
    try {
      if (validateForm()) {
        console.log('inside form da')
        // Get notification permissions
        const settings = await Notifications.getPermissionsAsync()
        let notificationPermissions = { ...settings }

        // Request notification permissions if not granted or not provisional on iOS
        if (
          settings?.status !== 'granted' ||
          settings.ios?.status !==
            Notifications.IosAuthorizationStatus.PROVISIONAL
        ) {
          notificationPermissions = await Notifications.requestPermissionsAsync(
            {
              ios: {
                allowProvisional: true,
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowAnnouncements: true
              }
            }
          )
        }

        let notificationToken = null
        // Get notification token if permissions are granted and it's a device
        if (
          (notificationPermissions?.status === 'granted' ||
            notificationPermissions.ios?.status ===
              Notifications.IosAuthorizationStatus.PROVISIONAL) &&
          Device.isDevice
        ) {
          notificationToken = await messaging().getToken()
        }
        console.log({ notificationToken })
        // Perform mutation with the obtained data
        mutate({
          variables: {
            username: username.toLowerCase(),
            password: password,
            notificationToken: notificationToken
          }
        })
      }
    } catch (err) {
      console.log({ errLogin: err })
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    usernameError,
    passwordError,
    onSubmit,
    showPassword,
    setShowPassword,
    loading,
    height
  }
}

export default useLogin
