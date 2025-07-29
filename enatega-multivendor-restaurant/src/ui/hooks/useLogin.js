import { useState, useRef, useContext } from 'react'
import { useMutation, gql, useQuery } from '@apollo/client'
import { FlashMessage } from '../../components'
import { login as loginQuery, defaultRestaurantCreds } from '../../apollo'
import { validateLogin } from '../validate'
import { AuthContext } from '../context'
import { useDispatch } from 'react-redux'
import { setCity } from '../../../store/citySlice'
import { useTranslation } from 'react-i18next'
import useNotification from './useNotification'
import { Linking, Platform } from 'react-native'

export default function useLogin() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [errors, setErrors] = useState()
  const { login } = useContext(AuthContext)
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const usernameRef = useRef()
  const passwordRef = useRef()

  const {
    // restaurantData,
    getPermission,
    getDevicePushTokenAsync,
    requestPermission,
    sendTokenToBackend
  } = useNotification()

  const [mutate, { loading, error }] = useMutation(
    gql`
      ${loginQuery}
    `,
    {
      onCompleted: async data => {
        console.log('Mutation Success:', data)
        // const permissionStatus = await getPermission()
        // if (permissionStatus.granted) {
        //   // setNotificationStatus(true)
        //   const token = (
        //     await getDevicePushTokenAsync({
        //       projectId: Constants.expoConfig.extra.eas.projectId
        //     })
        //   ).data
        //   sendTokenToBackend({ variables: { token, isEnabled: true } })
        // } else if (permissionStatus.canAskAgain) {
        //   const result = await requestPermission()
        //   if (result.granted) {
        //     // setNotificationStatus(true)
        //     const token = (
        //       await getDevicePushTokenAsync({
        //         projectId: Constants.expoConfig.extra.eas.projectId
        //       })
        //     ).data
        //     sendTokenToBackend({ variables: { token, isEnabled: true } })
        //   }
        // } else {
        //   // openSettingsRef.current = true
        //   Platform.OS === 'ios'
        //     ? Linking.openURL('app-settings:')
        //     : Linking.openSettings()
        // }
        onCompleted(data)
      },
      // Call onError when the mutation fails
      onError: err => {
        console.log('Mutation Error:', err)
        onError(err)
      }
    }
  )

  useQuery(
    gql`
      ${defaultRestaurantCreds}
    `,
    { onCompleted, onError }
  )

  function onCompleted({ restaurantLogin, lastOrderCreds }) {
    console.log({ restaurantLogin }, lastOrderCreds, 'onCompleted')

    dispatch(setCity({ cityId: restaurantLogin.city }))
    if (lastOrderCreds) {
      if (
        (lastOrderCreds.restaurantUsername !== null ||
          lastOrderCreds.restaurantUsername !== undefined) &&
        lastOrderCreds.restaurantPassword
      ) {
        if (process.env.NODE_ENV === 'development') {
          // setUserName(lastOrderCreds.restaurantUsername || '')
          // setPassword(lastOrderCreds.restaurantPassword || '')
        }
      }
    } else {
      login(
        restaurantLogin.token,
        restaurantLogin.restaurantId,
        restaurantLogin.city
      )
      setUserName(username || '')
    }
  }

  function onError(error) {
    console.log('error', error)
    console.log(
      'includes wrong_credentials',
      error.message.includes('wrong_credentials')
    )
    if (error.message.includes('wrong_credentials')) {
      FlashMessage({ message: t('wrong_credentials') })
    } else {
      FlashMessage({ message: 'Server Error' })
    }
  }

  const isValid = async () => {
    // const username = await usernameRef.current
    // const password = await passwordRef.current
    const errors = validateLogin({ username, password })
    console.log(username + password)
    // setErrors(errors)
    // if (errors) return false
    return true
  }

  const onLogin = async () => {
    const valid = await isValid()
    if (valid) {
      mutate({ variables: { username, password } })
    }
  }

  return {
    onLogin,
    isValid,
    loading,
    errors,
    error,
    usernameRef,
    passwordRef,
    setPassword,
    setUserName,
    username,
    password
  }
}
