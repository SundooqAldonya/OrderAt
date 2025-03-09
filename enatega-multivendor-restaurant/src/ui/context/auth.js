import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { restaurantLogout } from '../../apollo'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  // const [isAppReady, setIsAppReady] = useState(false)

  const [mutateLogout] = useMutation(restaurantLogout)

  const generateAuth = async () => {
    const token = await SecureStore.getItemAsync('token')
    if (token) setToken(token)
    // setIsAppReady(true)
  }

  useEffect(() => {
    generateAuth()
  }, [])

  const login = async (token, restaurantId, city) => {
    await SecureStore.setItemAsync('token', token)
    await AsyncStorage.setItem('restaurantId', restaurantId)
    await SecureStore.setItemAsync('cityId', city)
    setToken(token)
  }

  const logout = async () => {
    await SecureStore.deleteItemAsync('token')
    const restaurantId = await AsyncStorage.getItem('restaurantId')
    console.log({ restaurantId })
    setToken(null)
    mutateLogout({ variables: { id: restaurantId } })
    await AsyncStorage.removeItem('restaurantId')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
