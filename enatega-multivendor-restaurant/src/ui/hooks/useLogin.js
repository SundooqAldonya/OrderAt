import { useState, useRef, useContext } from 'react'
import { useMutation, gql, useQuery } from '@apollo/client'
import { FlashMessage } from '../../components'
import { login as loginQuery, defaultRestaurantCreds } from '../../apollo'
import { validateLogin } from '../validate'
import { AuthContext } from '../context'
import { useDispatch } from 'react-redux'
import { setCity } from '../../../store/citySlice'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as Constants from 'expo-constants'

export default function useLogin() {
  const dispatch = useDispatch()
  const [errors, setErrors] = useState()
  const { login } = useContext(AuthContext)
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const usernameRef = useRef()
  const passwordRef = useRef()
  const [mutate, { loading, error }] = useMutation(
    gql`
      ${loginQuery}
    `,
    {
      onCompleted: data => {
        console.log('Mutation Success:', data)
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
    FlashMessage({ message: error ? 'Server Error' : 'Server Error' })
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
    console.log('login calleldddddddddddd')
    const valid = await isValid()
    if (valid) {
      console.log('1111111111', valid)
      const settings = await Notifications.getPermissionsAsync()
      let notificationPermissions = { ...settings }

      // Request notification permissions if not granted or not provisional on iOS
      if (
        settings?.status !== 'granted' ||
        settings.ios?.status !==
          Notifications.IosAuthorizationStatus.PROVISIONAL
      ) {
        notificationPermissions = await Notifications.requestPermissionsAsync({
          ios: {
            allowProvisional: true,
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true
          }
        })
      }

      let notificationToken = null
      // Get notification token if permissions are granted and it's a device
      if (
        (notificationPermissions?.status === 'granted' ||
          notificationPermissions.ios?.status ===
            Notifications.IosAuthorizationStatus.PROVISIONAL) &&
        Device.isDevice
      ) {
        notificationToken = (
          await Notifications.getDevicePushTokenAsync({
            projectId: Constants.expoConfig?.extra?.firebaseProjectId
          })
        ).data
      }
      console.log({ notificationToken })
      mutate({ variables: { username, password, notificationToken } })
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
