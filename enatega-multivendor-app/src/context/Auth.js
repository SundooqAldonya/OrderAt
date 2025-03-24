import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)

  const setTokenAsync = async (token) => {
    await AsyncStorage.setItem('token', token)
    setToken(token)
  }

  const getTokenAsync = async () => {
    const savedToken = await AsyncStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
    }
  }

  useEffect(() => {
    getTokenAsync()
  }, [token])

  return (
    <AuthContext.Provider value={{ token, setToken, setTokenAsync }}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthConsumer = AuthContext.Consumer
export default AuthContext
