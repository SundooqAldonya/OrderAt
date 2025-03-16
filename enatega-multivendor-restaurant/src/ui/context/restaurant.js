import React, { useContext, useEffect, useRef, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import { subscribePlaceOrder, orders } from '../../apollo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import { MAX_TIME } from '../../utilities'

const Context = React.createContext({})
const Provider = props => {
  const navigation = useNavigation()
  const [printer, setPrinter] = useState()
  // const [notificationToken, setNotificationToken] = useState()
  const [addressToken, setAddressToken] = useState('')
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    const getPrinter = async () => {
      const printerStr = await AsyncStorage.getItem('printer')
      if (printerStr) setPrinter(JSON.parse(printerStr))
    }
    getPrinter()
  }, [])

  const {
    loading,
    error,
    data,
    subscribeToMore,
    refetch,
    networkStatus
  } = useQuery(
    gql`
      ${orders}
    `,
    {
      fetchPolicy: 'network-only',
      pollInterval: 15000,
      onError
    }
  )

  console.log('useQuery called:', { loading, error, data, networkStatus })

  function onError(error) {
    console.log(JSON.stringify(error))
  }

  let unsubscribe = null

  useEffect(() => {
    return () => {
      unsubscribe && unsubscribe()
    }
  }, [])

  useEffect(() => {
    console.log('runnnnnnnnnnnnnnnnn')
    subscribeToMoreOrders()
    return () => {
      console.log('Cleaning up subscription')
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [])

  // useEffect(() => {
  //   console.log('hillllewdewwerw')
  //   async function GetToken() {
  //     const result = await SecureStore.getItemAsync('notification-token')
  //     if (result) {
  //       setNotificationToken(JSON.parse(result))
  //     } else {
  //       setNotificationToken(null)
  //     }
  //   }
  //   GetToken()
  // }, [])

  const subscribeToMoreOrders = async () => {
    console.log('subscribeToMoreOrders calledddd')
    const restaurant = await AsyncStorage.getItem('restaurantId')
    console.log('restaurant@@@@@@@@', restaurant)
    if (!restaurant) return
    if (unsubscribeRef.current) {
      console.log('Unsubscribing from previous subscription')
      unsubscribeRef.current()
    }
    unsubscribeRef.current = subscribeToMore({
      document: gql`
        ${subscribePlaceOrder}
      `,
      variables: { restaurant },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const { restaurantOrders } = prev
        const { origin, order } = subscriptionData.data.subscribePlaceOrder
        const updatedOrders = [order, ...restaurantOrders]
        console.log('navigating to NewOrderScreenNotification')
        navigation.navigate('NewOrderScreenNotification', {
          activeBar: 0,
          orderData: order,
          rider: order.rider,
          remainingTime: moment(order.createdAt)
            .add(MAX_TIME, 'seconds')
            .diff(moment(), 'seconds'),
          createdAt: order.createdAt,
          MAX_TIME,
          acceptanceTime: moment(order.orderDate).diff(moment(), 'seconds'),
          preparationTime: new Date(order.preparationTime).toISOString()
        })
        if (origin === 'new') {
          return {
            restaurantOrders: [...updatedOrders]
          }
        }
        return prev
      },
      onError: error => {
        console.log('onError', error)
      }
    })
  }

  return (
    <Context.Provider
      value={{
        loading,
        error,
        data,
        subscribeToMoreOrders,
        refetch,
        networkStatus,
        printer,
        setPrinter,
        addressToken,
        setAddressToken
      }}>
      {props.children}
    </Context.Provider>
  )
}
export const useRestaurantContext = () => useContext(Context)
export default { Context, Provider }
