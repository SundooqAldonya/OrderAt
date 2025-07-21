import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { cities, getCities } from '../apollo/queries'

// const GET_CITIES = gql`
//   ${cities}
// `
const GET_CITIES = gql`
  ${getCities}
`

export const LocationContext = createContext()

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null)
  const [country, setCountry] = useState('IL')
  const [loadingCountry, setLoadingCountry] = useState(true)
  const [errorCountry, setErrorCountry] = useState('')

  useEffect(() => {
    const getActiveLocation = async () => {
      try {
        const locationStr = await AsyncStorage.getItem('location')
        console.log({ locationStr })
        if (locationStr) {
          setLocation(JSON.parse(locationStr))
        }
      } catch (err) {
        console.log(err)
      }
    }

    getActiveLocation()
  }, [])

  useEffect(() => {
    if (location) {
      const saveLocation = async () => {
        await AsyncStorage.setItem('location', JSON.stringify(location))
      }
      saveLocation()
    }
  }, [location])

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('https://api.ipify.org/?format=json')
        const data = response.data

        const ipResponse = await axios.get(`https://ipinfo.io/${data.ip}/json`)
        const countryName = ipResponse.data.country // missing 'US'
        setCountry(countryName)
      } catch (error) {
        setErrorCountry(error.message)
        console.error('Error fetching user location:', error)
      } finally {
        setLoadingCountry(false)
      }
    }
    fetchCountry()
  }, [])

  const { data, loading, error } = useQuery(GET_CITIES)
  const cities = data?.cities || []
  // console.log({ city: cities.length ? cities[0].location.location : null })
  // const { loading, error, data } = useQuery(GET_CITIES, {
  //   variables: { iso: 'EG' }
  // })

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        cities
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
