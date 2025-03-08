import React, { useEffect, useState } from 'react'
import setupApolloClient from '../apollo/index'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { useMutation } from '@apollo/client'
import { riderLogout } from '../apollo/mutations'

export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)

  const client = setupApolloClient()
  const [mutateLogout] = useMutation(riderLogout, {
    onCompleted: data => {
      console.log({ data })
    },
    onError: err => {
      console.log({ err })
    }
  })

  const checkAuth = async () => {
    const auth = await AsyncStorage.getItem('rider-token')
    if (auth) setToken(auth)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const setTokenAsync = async token => {
    await AsyncStorage.setItem('rider-token', token)
    client.clearStore()
    setToken(token)
  }

  const logout = async () => {
    try {
      client.clearStore()
      // const savedToken = await AsyncStorage.getItem('rider-token')
      mutateLogout({
        variables: {
          token
        }
      })
      await AsyncStorage.removeItem('rider-token')

      setToken(null)
      if (await Location.hasStartedLocationUpdatesAsync('RIDER_LOCATION')) {
        await Location.stopLocationUpdatesAsync('RIDER_LOCATION')
      }
    } catch (e) {
      console.log('Logout Error: ', e)
    }
  }

  return (
    <AuthContext.Provider value={{ token, setTokenAsync, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
