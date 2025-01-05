import { useState, useRef, useContext } from 'react'
import { useMutation, gql, useQuery } from '@apollo/client'
import { FlashMessage } from '../../components'
import { login as loginQuery, defaultRestaurantCreds } from '../../apollo'
import { validateLogin } from '../validate'
import { AuthContext } from '../context'

export default function useLogin() {
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
    console.log({ restaurantLogin }, { lastOrderCreds }, 'onCompleted')
    if (lastOrderCreds) {
      if (
        (lastOrderCreds.restaurantUsername !== null ||
          lastOrderCreds.restaurantUsername !== undefined) &&
        lastOrderCreds.restaurantPassword
      ) {
        setUserName(lastOrderCreds.restaurantUsername || '')
        setPassword(lastOrderCreds.restaurantPassword || '')
      }
    } else {
      login(restaurantLogin.token, restaurantLogin.restaurantId)
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
      // const username = await usernameRef.current.value
      // const password = await passwordRef.current.value
      console.log('username', username, password)
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
