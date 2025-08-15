import React, { useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useApolloClient, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { v5 as uuidv5 } from 'uuid'
import { v1 as uuidv1 } from 'uuid'
import { profile } from '../apollo/queries'
import { LocationContext } from './Location'
import AuthContext from './Auth'

import analytics from '../utils/analytics'

import { useTranslation } from 'react-i18next'
import { useRestaurant } from '../ui/hooks'

const v1options = {
  random: [
    0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1,
    0x67, 0x1c, 0x58, 0x36
  ]
}

const PROFILE = gql`
  ${profile}
`

const UserContext = React.createContext({})

export const UserProvider = (props) => {
  const Analytics = analytics()

  const { t } = useTranslation()

  const { token, setToken } = useContext(AuthContext)
  const client = useApolloClient()
  const { location, setLocation } = useContext(LocationContext)
  const [cart, setCart] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [isPickup, setIsPickup] = useState(false)
  const [instructions, setInstructions] = useState('')

  const {
    called: calledProfile,
    loading: loadingProfile,
    error: errorProfile,
    data: dataProfile,
    refetch: refetchProfile,
    networkStatus
  } = useQuery(PROFILE, {
    fetchPolicy: 'network-only',
    onError,
    onCompleted,
    skip: !token,
    pollInterval: 10000
  })

  const { loading, data } = useRestaurant(restaurant)
  const restaurantCustomer = data?.restaurantCustomer || null

  useEffect(() => {
    let isSubscribed = true
    ;(async () => {
      const restaurant = await AsyncStorage.getItem('restaurant')
      const cart = await AsyncStorage.getItem('cartItems')
      isSubscribed && setRestaurant(restaurant || null)
      isSubscribed && setCart(cart ? JSON.parse(cart) : [])
    })()
    return () => {
      isSubscribed = false
    }
  }, [])

  function onError(error) {
    console.log('error context user', error.message)
  }
  async function onCompleted(data) {
    const { _id: userId, name, email, phone } = data.profile
    await Analytics.identify(
      {
        userId,
        name,
        email,
        phone
      },
      userId
    )
    await Analytics.track(Analytics.events.USER_RECONNECTED, {
      userId: data.profile._id
    })
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      setToken(null)
      if (location._id) {
        setLocation({
          label: t('selectedLocation'),
          latitude: location.latitude,
          longitude: location.longitude,
          deliveryAddress: location.deliveryAddress
        })
      }
      client.cache.evict({
        id: `${dataProfile.profile.__typename}:${dataProfile.profile._id}`
      })
      await client.resetStore()
    } catch (error) {
      console.log('error on logout', error)
    }
  }

  const clearCart = async () => {
    setCart([])
    setRestaurant(null)
    setInstructions('')
    await AsyncStorage.removeItem('cartItems')
    await AsyncStorage.removeItem('restaurant')
  }

  const addQuantity = async (key, quantity = 1) => {
    const cartIndex = cart.findIndex((c) => c.key === key)
    cart[cartIndex].quantity += quantity
    setCart([...cart])
    await AsyncStorage.setItem('cartItems', JSON.stringify([...cart]))
  }

  const deleteItem = async (key) => {
    const cartIndex = cart.findIndex((c) => c.key === key)
    if (cartIndex > -1) {
      cart.splice(cartIndex, 1)
      const items = [...cart.filter((c) => c.quantity > 0)]
      setCart(items)
      if (items.length === 0) setRestaurant(null)
      await AsyncStorage.setItem('cartItems', JSON.stringify(items))
    }
  }

  const removeQuantity = async (key) => {
    const cartIndex = cart.findIndex((c) => c.key === key)
    cart[cartIndex].quantity -= 1
    const items = [...cart.filter((c) => c.quantity > 0)]
    setCart(items)
    if (items.length === 0) setRestaurant(null)
    await AsyncStorage.setItem('cartItems', JSON.stringify(items))
  }

  console.log({ cart })

  const checkItemCart = (itemId) => {
    const cartIndex = cart.findIndex((c) => c._id === itemId)
    if (cartIndex < 0) {
      return {
        exist: false,
        quantity: 0
      }
    } else {
      return {
        exist: true,
        quantity: cart[cartIndex].quantity,
        key: cart[cartIndex].key
      }
    }
  }
  const numberOfCartItems = () => {
    return cart
      .map((c) => c.quantity)
      .reduce(function (a, b) {
        return a + b
      }, 0)
  }

  const addCartItem = async (
    _id,
    variation,
    quantity = 1,
    addons = [],
    clearFlag,
    specialInstructions = ''
  ) => {
    const cartItems = clearFlag ? [] : cart
    cartItems.push({
      key: uuidv1(v1options),
      _id,
      quantity: quantity,
      variation: {
        _id: variation
      },
      addons,
      specialInstructions
    })

    await AsyncStorage.setItem('cartItems', JSON.stringify([...cartItems]))
    setCart([...cartItems])
  }

  const updateCart = async (cart) => {
    setCart(cart)
    await AsyncStorage.setItem('cartItems', JSON.stringify(cart))
  }

  const setCartRestaurant = async (id) => {
    setRestaurant(id)
    await AsyncStorage.setItem('restaurant', id)
  }

  function calculatePrice(delivery = 0, withDiscount) {
    let itemTotal = 0
    cart.forEach((cartItem) => {
      const food = populateFood(cartItem)
      if (!food) return
      itemTotal += food.price * food.quantity
    })
    // if (withDiscount && coupon && coupon.discount) {
    //   itemTotal = itemTotal - (coupon.discount / 100) * itemTotal
    // }
    return itemTotal.toFixed(2)
  }

  const foods = restaurantCustomer?.categories
    ?.map((c) => c.foods.flat())
    .flat()

  const addons = restaurantCustomer?.addons
  const options = restaurantCustomer?.options

  function populateFood(cartItem) {
    const food = foods?.find((food) => food._id === cartItem._id)
    if (!food) return null
    const variation = food.variations.find(
      (variation) => variation._id === cartItem.variation._id
    )
    if (!variation) return null

    const title = `${food.title}${
      variation.title ? `(${variation.title})` : ''
    }`
    let price = variation.price
    const optionsTitle = []
    if (cartItem.addons) {
      cartItem.addons.forEach((addon) => {
        const cartAddon = addons.find((add) => add._id === addon._id)
        if (!cartAddon) return null
        addon.options.forEach((option) => {
          const cartOption = options.find((opt) => opt._id === option._id)
          if (!cartOption) return null
          price += cartOption.price
          optionsTitle.push(cartOption.title)
        })
      })
    }
    const populateAddons = addons.filter((addon) =>
      food?.variations[0]?.addons?.includes(addon._id)
    )
    return {
      ...cartItem,
      optionsTitle,
      title: title,
      price: price.toFixed(2),
      image: food?.image,
      addons: populateAddons
    }
  }

  console.log({ restaurant })

  return (
    <UserContext.Provider
      value={{
        isLoggedIn: !!token && dataProfile && !!dataProfile.profile,
        loadingProfile: loadingProfile && calledProfile,
        errorProfile,
        profile:
          dataProfile && dataProfile.profile ? dataProfile.profile : null,
        logout,
        cart,
        cartCount: numberOfCartItems(),
        clearCart,
        updateCart,
        addQuantity,
        removeQuantity,
        addCartItem,
        checkItemCart,
        deleteItem,
        restaurant,
        setCartRestaurant,
        refetchProfile,
        networkStatus,
        isPickup,
        setIsPickup,
        instructions,
        setInstructions,
        calculatePrice,
        populateFood
      }}
    >
      {props.children}
    </UserContext.Provider>
  )
}
export const useUserContext = () => useContext(UserContext)
export const UserConsumer = UserContext.Consumer
export default UserContext
