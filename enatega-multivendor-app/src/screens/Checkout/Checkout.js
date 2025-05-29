/* eslint-disable indent */
import React, { useState, useEffect, useContext, useRef } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Text,
  TextInput,
  Dimensions
} from 'react-native'
import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  AntDesign,
  EvilIcons,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import { Modalize } from 'react-native-modalize'
import moment from 'moment'
import {
  getDeliveryCalculation,
  getTipping,
  myOrders,
  orderFragment
} from '../../apollo/queries'
import {
  applyCoupon,
  getCoupon,
  phoneIsVerified,
  placeOrder
} from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import { stripeCurrencies, paypalCurrencies } from '../../utils/currencies'
import { theme } from '../../utils/themeColors'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../../context/Configuration'
import UserContext from '../../context/User'

import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { useRestaurant } from '../../ui/hooks'
import { LocationContext } from '../../context/Location'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { DAYS } from '../../utils/enums'
import { textStyles } from '../../utils/textStyles'
import { calculateDistance } from '../../utils/customFunctions'
import analytics from '../../utils/analytics'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { useTranslation } from 'react-i18next'
import styles from './styles'
import Location from '../../components/Main/Location/Location'
import { customMapStyle } from '../../utils/customMapStyles'
import EmptyCart from '../../assets/SVG/imageComponents/EmptyCart'
import Spinner from '../../components/Spinner/Spinner'
import RestaurantMarker from '../../assets/SVG/restaurant-marker'
import { fontStyles } from '../../utils/fontStyles'
import { FulfillmentMode } from '../../components/Checkout/FulfillmentMode'
import { Instructions } from '../../components/Checkout/Instructions'
import ArrowForwardIcon from '../../assets/SVG/arrow-forward-icon'
import PickUp from '../../components/Pickup'
import RadioButton from '../../ui/FdRadioBtn/RadioBtn'
import { PaymentModeOption } from '../../components/Checkout/PaymentOption'
import { colors } from '../../utils/colors'
import { openGoogleMaps } from '../../utils/callMaps'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector } from 'react-redux'

// Constants
const PLACEORDER = gql`
  ${placeOrder}
`
const TIPPING = gql`
  ${getTipping}
`
const { height: HEIGHT } = Dimensions.get('window')

const kmWidth = 0.5 // desired width in km

function Checkout(props) {
  const mapRef = useRef()
  const navigation = useNavigation()

  const configuration = useContext(ConfigurationContext)

  const {
    isLoggedIn,
    profile,
    clearCart,
    restaurant: cartRestaurant,
    cart,
    cartCount,
    updateCart,
    isPickup,
    setIsPickup,
    instructions
  } = useContext(UserContext)
  const themeContext = useContext(ThemeContext)
  const { location } = useContext(LocationContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const voucherModalRef = useRef(null)
  const tipModalRef = useRef(null)
  const [loadingData, setLoadingData] = useState(true)
  const [minimumOrder, setMinimumOrder] = useState('')
  const [orderDate, setOrderDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState({})
  const [deliveryCharges, setDeliveryCharges] = useState(0)
  const [restaurantName, setrestaurantName] = useState('...')
  const [voucherCode, setVoucherCode] = useState('')
  const [coupon, setCoupon] = useState(0)
  const [tip, setTip] = useState(null)
  const [tipAmount, setTipAmount] = useState(null)
  const modalRef = useRef(null)
  const [paymentMode, setPaymentMode] = useState('COD')
  const [deliveryDiscount, setDeliveryDiscount] = useState(0)

  console.log({ location })

  const translatedAddress = location.deliveryAddress
    ? location.deliveryAddress
    : location.deliveryAddress &&
        location.deliveryAddress === 'Current Location'
      ? t('currentLocation')
      : location.area
        ? `${location.city.title}, ${location.area.title}`
        : null

  const { loading, data } = useRestaurant(cartRestaurant)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const latOrigin = data?.restaurantCustomer?.location?.coordinates[1]
  const lonOrigin = data?.restaurantCustomer?.location?.coordinates[0]

  const businessAddress = data?.restaurantCustomer?.address || null

  const { width, height } = Dimensions.get('window')
  const ASPECT_RATIO = width / height

  const latOriginNum = +latOrigin // make sure it's a number
  const longitudeDelta =
    kmWidth / (111.32 * Math.cos((latOriginNum * Math.PI) / 180))
  const latitudeDelta = longitudeDelta / ASPECT_RATIO

  const initialRegion = {
    latitude: +latOrigin,
    longitude: +lonOrigin,
    latitudeDelta,
    longitudeDelta
  }

  const {
    data: calcData,
    loading: calcLoading,
    error: errorCalc
  } = useQuery(getDeliveryCalculation, {
    skip: !data,
    variables: {
      destLong: Number(location.longitude),
      destLat: Number(location.latitude),
      originLong: Number(data?.restaurantCustomer.location.coordinates[0]),
      originLat: Number(data?.restaurantCustomer.location.coordinates[1])
    }
  })

  const restaurant = data?.restaurantCustomer

  useEffect(() => {
    if (calcData) {
      const amount = calcData.getDeliveryCalculation.amount
      setDeliveryCharges(
        amount >= configuration.minimumDeliveryFee
          ? amount
          : configuration.minimumDeliveryFee
      )
    }
  }, [calcData])

  useEffect(() => {
    if (mapRef?.current) {
      mapRef.current.animateToRegion(initialRegion, 1000) // 1000ms = 1 second animation
    }
  }, [initialRegion])

  const onModalOpen = (modalRef) => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }
  const onModalClose = (modalRef) => {
    const modal = modalRef.current
    if (modal) {
      modal.close()
    }
  }

  function onCouponCompleted(data) {
    console.log({ data })
    if (data?.applyCoupon) {
      setCoupon({ ...data?.applyCoupon })
      FlashMessage({
        message: t('coupanApply')
      })
      setVoucherCode('')
      onModalClose(voucherModalRef)
      // } else {
      //   FlashMessage({
      //     message: t('coupanFailed')
      //   })
      // }
    }
  }

  function onCouponError() {
    FlashMessage({
      message: t('invalidCoupan')
    })
  }

  const [mutateCoupon, { loading: couponLoading }] = useMutation(applyCoupon, {
    onCompleted: onCouponCompleted,
    onError: onCouponError
  })

  const { loading: loadingTip, data: dataTip } = useQuery(TIPPING, {
    fetchPolicy: 'network-only'
  })

  const [mutateOrder] = useMutation(PLACEORDER, {
    onCompleted,
    onError,
    update
  })

  const COD_PAYMENT = {
    payment: 'COD',
    label: t('cod'),
    index: 2,
    icon: 'dollar'
  }

  const paymentMethod =
    props.route.params && props.route.params.paymentMethod
      ? props.route.params.paymentMethod
      : COD_PAYMENT

  const [selectedTip, setSelectedTip] = useState()
  const inset = useSafeAreaInsets()

  function onTipping() {
    if (isNaN(tipAmount)) FlashMessage({ message: t('invalidAmount') })
    else if (Number(tipAmount) <= 0) {
      FlashMessage({ message: t('amountMustBe') })
    } else {
      setTip(tipAmount)
      setTipAmount(null)
      onModalClose(tipModalRef)
    }
  }

  useEffect(() => {
    if (tip) {
      setSelectedTip(null)
    } else if (dataTip && !selectedTip) {
      setSelectedTip(dataTip.tips.tipVariations[1])
    }
  }, [tip, data])

  console.log({ deliveryCharges })
  console.log({ minimumDeliveryFee: configuration.minimumDeliveryFee })
  console.log({ minimumOrder: minimumOrder })

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: () => (
        <View style={{ alignItems: 'center', gap: scale(2) }}>
          <TextDefault
            style={{
              color: currentTheme.newFontcolor,
              ...textStyles.H4,
              ...textStyles.Bolder
            }}
          >
            {t('titleCheckout')}
          </TextDefault>
          <TextDefault
            style={{ color: currentTheme.newFontcolor, ...textStyles.H5 }}
          >
            {data &&
              data?.restaurantCustomer.name &&
              data?.restaurantCustomer.address && (
                <>
                  {data?.restaurantCustomer.name} {' - '}{' '}
                  {data?.restaurantCustomer.address}
                </>
              )}
          </TextDefault>
        </View>
      ),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        ...textStyles.H4,
        ...textStyles.Bolder
      },

      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={{ ...alignment.PLxSmall, width: scale(30) }}>
              <AntDesign
                name='arrowleft'
                size={22}
                color={currentTheme.fontFourthColor}
              />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props.navigation, data])

  useEffect(() => {
    if (!data) return
    didFocus()
    setrestaurantName(
      `${data?.restaurantCustomer.name} - ${data?.restaurantCustomer.address}`
    )
  }, [data])

  useEffect(() => {
    if (cart && cartCount > 0) {
      if (
        data &&
        data?.restaurantCustomer &&
        (!data?.restaurantCustomer.isAvailable || !isOpen())
      ) {
        showAvailablityMessage()
      }
    }
  }, [data])

  useEffect(() => {
    if (coupon && coupon.appliesTo === 'delivery') {
      const { discountType, discount } = coupon
      let discountValue = 0

      if (discountType === 'percent') {
        discountValue = (discount / 100) * deliveryCharges
      } else {
        discountValue = discount
      }

      // Make sure we don't apply more than the delivery charge
      discountValue = Math.min(discount, deliveryCharges)
      console.log({ discountValue })

      setDeliveryDiscount(discountValue)
    } else {
      setDeliveryDiscount(0)
    }
  }, [coupon, deliveryCharges])

  console.log({ deliveryDiscount })

  const showAvailablityMessage = () => {
    Alert.alert(
      '',
      `${data?.restaurantCustomer.name} closed at the moment`,
      [
        {
          text: 'Go back to restaurants',
          onPress: () => {
            props.navigation.navigate({
              name: 'Main',
              merge: true
            })
          },
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: () => {},
          style: 'cancel'
        }
      ],
      { cancelable: true }
    )
  }

  function update(cache, { data: { placeOrder } }) {
    try {
      if (placeOrder && placeOrder.paymentMethod === 'COD') {
        cache.modify({
          fields: {
            orders(existingOrders = []) {
              const newOrder = cache.writeFragment({
                data: placeOrder,
                fragment: gql`
                  ${orderFragment}
                `
              })
              return [newOrder, ...existingOrders]
            }
          }
        })
      }
    } catch (error) {
      console.log('update error', error)
    }
  }

  async function onCompleted(data) {
    // await Analytics.track(Analytics.events.ORDER_PLACED, {
    //   userId: data.placeOrder.user._id,
    //   orderId: data.placeOrder.orderId,
    //   name: data.placeOrder.user.name,
    //   email: data.placeOrder.user.email,
    //   restaurantName: data.placeOrder.restaurant.name,
    //   restaurantAddress: data.placeOrder.restaurant.address,
    //   orderPaymentMethod: data.placeOrder.paymentMethod,
    //   orderItems: data.placeOrder.items,
    //   orderAmount: data.placeOrder.orderAmount,
    //   orderPaidAmount: data.placeOrder.paidAmount,
    //   tipping: data.placeOrder.tipping,
    //   orderStatus: data.placeOrder.orderStatus,
    //   orderDate: data.placeOrder.orderDate
    // })
    if (paymentMode === 'COD') {
      // props.navigation.reset({
      //   routes: [
      //     { name: 'Main' },
      //     {
      //       name: 'OrderDetail',
      //       params: { _id: data?.placeOrder?._id }
      //     }
      //   ]
      // })
      props.navigation.navigate('Main')
      clearCart()
    } else if (paymentMode === 'PAYPAL') {
      props.navigation.replace('Paypal', {
        _id: data.placeOrder.orderId,
        currency: configuration.currency
      })
    } else if (paymentMode === 'STRIPE') {
      props.navigation.replace('StripeCheckout', {
        _id: data.placeOrder.orderId,
        amount: data.placeOrder.orderAmount,
        email: data.placeOrder.user.email,
        currency: configuration.currency
      })
    }
  }
  function onError(error) {
    setLoadingOrder(false)
    console.log('onError', error)
    if (error.graphQLErrors.length) {
      console.log('error', JSON.stringify(error))
      FlashMessage({
        message: error.graphQLErrors[0].message
      })
    } else {
      FlashMessage({
        message: error.message
      })
    }
  }

  function calculateTip() {
    if (tip) {
      return tip
    } else if (selectedTip) {
      let total = 0
      const delivery = isPickup ? 0 : deliveryCharges
      total += +calculatePrice(delivery, true)
      total += +taxCalculation()
      const tipPercentage = (
        (total / 100) *
        parseFloat(selectedTip).toFixed(2)
      ).toFixed(2)
      return tipPercentage
    } else {
      return 0
    }
  }

  function taxCalculation() {
    const tax = data?.restaurantCustomer ? +data?.restaurantCustomer.tax : 0
    if (tax === 0) {
      return tax.toFixed(2)
    }
    const delivery = isPickup ? 0 : deliveryCharges
    const amount = +calculatePrice(delivery, true)
    const taxAmount = ((amount / 100) * tax).toFixed(2)
    return taxAmount
  }

  function calculatePrice(delivery = 0, withDiscount) {
    let itemTotal = 0
    let finalDeliveryCharges = delivery > 0 ? deliveryCharges : 0

    cart.forEach((cartItem) => {
      itemTotal += cartItem.price * cartItem.quantity
    })
    if (withDiscount && coupon && coupon.discount) {
      if (coupon.appliesTo === 'subtotal') {
        if (coupon.discountType === 'percent') {
          const rawTotal = itemTotal - (coupon.discount / 100) * itemTotal
          const totalAmountDiscout = itemTotal - rawTotal

          itemTotal =
            coupon.maxDiscount < totalAmountDiscout
              ? itemTotal - coupon.maxDiscount
              : rawTotal
        } else {
          const rawTotal = itemTotal - coupon.discount
          itemTotal =
            rawTotal > coupon.maxDiscount
              ? itemTotal - coupon.maxDiscount
              : itemTotal - coupon.discount
        }
      }
      if (coupon.appliesTo === 'delivery') {
        finalDeliveryCharges = calculateDeliveryCoupon(finalDeliveryCharges)
      }
    }
    // const deliveryAmount = delivery > 0 ? deliveryCharges : 0
    console.log({ itemTotal })
    const total = (itemTotal + finalDeliveryCharges).toFixed(2)
    console.log({ total })
    return total
  }

  // console.log({ calculatePrice: calculatePrice() })

  function calculateTotal() {
    let total = 0
    const delivery = isPickup ? 0 : deliveryCharges
    total += +calculatePrice(delivery, true)
    total += +taxCalculation()
    total += +calculateTip()
    return parseFloat(total).toFixed(2)
  }

  function validateOrder() {
    if (!data?.restaurantCustomer.isAvailable || !isOpen()) {
      showAvailablityMessage()
      return
    }
    if (!cart.length) {
      FlashMessage({
        message: t('validateItems')
      })
      return false
    }
    if (calculatePrice(deliveryCharges, true) < minimumOrder) {
      // Alert.alert('Minimum order', 'Minimum Order')
      FlashMessage({
        // message: `The minimum amount of (${configuration.currencySymbol} ${minimumOrder}) for your order has not been reached.`
        message: `${t('minAmount')} (${
          configuration.currencySymbol
        } ${minimumOrder}) ${t('forYourOrder')}`,
        duration: 10000
      })
      return false
    }
    if (!location.deliveryAddress) {
      props.navigation.navigate('CartAddress')
      return false
    }
    if (!paymentMode) {
      FlashMessage({
        message: t('setPaymentMethod')
      })
      return false
    }
    if (profile.phone.length < 1) {
      props.navigation.navigate('PhoneNumber', { backScreen: 'Cart' })
      return false
    }
    if (profile.phone.length > 0 && !profile.phoneIsVerified) {
      FlashMessage({
        message: t('numberVerificationAlert')
      })
      props.navigation.navigate('PhoneNumber', { backScreen: 'Cart' })
      return false
    }
    return true
  }

  function checkPaymentMethod(currency) {
    if (paymentMode === 'STRIPE') {
      return stripeCurrencies.find((val) => val.currency === currency)
    }
    if (paymentMode === 'PAYPAL') {
      return paypalCurrencies.find((val) => val.currency === currency)
    }
    return true
  }

  function transformOrder(cartData) {
    return cartData.map((food) => {
      return {
        food: food._id,
        quantity: food.quantity,
        variation: food.variation._id,
        addons: food.addons
          ? food.addons.map(({ _id, options }) => ({
              _id,
              options: options.map(({ _id }) => _id)
            }))
          : [],
        specialInstructions: food.specialInstructions
      }
    })
  }
  async function onPayment() {
    if (checkPaymentMethod(configuration.currency)) {
      const items = transformOrder(cart)
      mutateOrder({
        variables: {
          restaurant: cartRestaurant,
          orderInput: items,
          paymentMethod: paymentMode,
          couponCode: coupon ? coupon.title : null,
          tipping: +calculateTip(),
          taxationAmount: +taxCalculation(),
          orderDate: orderDate,
          isPickedUp: isPickup,
          deliveryCharges: isPickup ? 0 : deliveryCharges,
          address: {
            label: location.label,
            deliveryAddress: location.deliveryAddress,
            details: location.details,
            longitude: '' + location.longitude,
            latitude: '' + location.latitude
          },
          instructions
        }
      })
    } else {
      FlashMessage({
        message: t('paymentNotSupported')
      })
    }
  }

  const isOpen = () => {
    const date = new Date()
    const day = date.getDay()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const todaysTimings = data?.restaurantCustomer.openingTimes.find(
      (o) => o.day === DAYS[day]
    )
    const times = todaysTimings.times.filter(
      (t) =>
        hours >= Number(t.startTime[0]) &&
        minutes >= Number(t.startTime[1]) &&
        hours <= Number(t.endTime[0]) &&
        minutes <= Number(t.endTime[1])
    )

    return times.length > 0
  }

  async function didFocus() {
    const { restaurantCustomer } = data
    setSelectedRestaurant(restaurantCustomer)
    setMinimumOrder(restaurantCustomer.minimumOrder)
    const foods = restaurantCustomer.categories
      .map((c) => c.foods.flat())
      .flat()
    const { addons, options } = restaurantCustomer
    try {
      if (cartCount && cart) {
        const transformCart = cart.map((cartItem) => {
          const food = foods.find((food) => food._id === cartItem._id)
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
          return {
            ...cartItem,
            optionsTitle,
            title: title,
            price: price.toFixed(2)
          }
        })

        if (props.navigation.isFocused()) {
          const updatedItems = transformCart.filter((item) => item)
          if (updatedItems.length === 0) await clearCart()
          await updateCart(updatedItems)
          setLoadingData(false)
          if (transformCart.length !== updatedItems.length) {
            FlashMessage({
              message: t('itemNotAvailable')
            })
          }
        }
      } else {
        if (props.navigation.isFocused()) {
          setLoadingData(false)
        }
      }
    } catch (e) {
      FlashMessage({
        message: e.message
      })
    }
  }

  console.log({ coupon })

  const showMinimumOrderMessage = () => {
    if (calculatePrice(0, true) < minimumOrder - coupon) {
      return (
        <TextDefault
          style={{
            color: '#000',
            fontSize: 12,
            textAlign: 'center'
          }}
        >{`${t('minAmount')} (${minimumOrder - calculatePrice(0, false)} ${
          isArabic ? configuration.currencySymbol : configuration.currency
        }) ${t('forYourOrder')} (${minimumOrder} ${
          isArabic ? configuration.currencySymbol : configuration.currency
        }).`}</TextDefault>
      )
    }
  }

  // console.log({ cart })

  const handleApplyCoupon = () => {
    const coordinates = {
      latitude: location.latitude,
      longitude: location.longitude
    }
    mutateCoupon({
      variables: {
        applyCouponInput: {
          code: voucherCode,
          orderSubtotal: parseFloat(calculatePrice(0, false)),
          orderMeta: {
            business_id: restaurant._id,
            item_ids: cart.map((item) => item._id),
            location: coordinates
          }
        }
      }
    })
  }

  function loadginScreen() {
    return (
      <View style={styles(currentTheme).screenBackground}>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine />
          <PlaceholderLine />
          <PlaceholderLine />
        </Placeholder>

        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height60} />
          <PlaceholderLine />
        </Placeholder>

        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height100} />
          <PlaceholderLine />
          <PlaceholderLine />
          <View
            style={[
              styles(currentTheme).horizontalLine,
              styles().width100,
              styles().mB10
            ]}
          />
          <PlaceholderLine />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height100} />
          <PlaceholderLine />
          <PlaceholderLine />
          <View
            style={[
              styles(currentTheme).horizontalLine,
              styles().width100,
              styles().mB10
            ]}
          />
          <PlaceholderLine />
          <PlaceholderLine />
        </Placeholder>
      </View>
    )
  }

  if (loading || loadingData || loadingTip) return loadginScreen()

  let deliveryTime = Math.floor((orderDate - Date.now()) / 1000 / 60)
  if (deliveryTime < 1) deliveryTime += restaurant?.deliveryTime

  const handleNavigateAddress = () => {
    if (profile.addresses && !profile.addresses.length) {
      navigation.navigate('NewAddress', {
        backScreen: 'Cart'
      })
    } else {
      navigation.navigate('CartAddress', {
        address: location
      })
    }
  }

  const calculateDeliveryCoupon = (delivery) => {
    if (coupon.discountType === 'percent') {
      delivery -= (coupon.discount / 100) * delivery
    } else {
      delivery -= coupon.discount
    }
    // setDeliveryDiscount(delivery)
    return delivery
  }

  return (
    <>
      <View style={styles(currentTheme).mainContainer}>
        {!!cart.length && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={[styles().flex]}
            >
              <View>
                {/* {isPickup ? (
                  <View style={[styles(currentTheme).headerContainer]}>
                    <View style={styles().mapView}>
                      <MapView
                        ref={mapRef}
                        style={styles().flex}
                        scrollEnabled={false}
                        zoomEnabled={true}
                        zoomControlEnabled={false}
                        rotateEnabled={false}
                        cacheEnabled={false}
                        initialRegion={initialRegion}
                        provider={PROVIDER_GOOGLE}
                      />
                      <View style={styles().marker}>
                        <RestaurantMarker />
                      </View>
                    </View>
                    <View
                      style={[
                        styles(currentTheme).horizontalLine,
                        styles().width100
                      ]}
                    />
                  </View>
                ) : null} */}
                <FulfillmentMode
                  theme={currentTheme}
                  setIsPickup={setIsPickup}
                  isPickup={isPickup}
                />
                <View style={[styles(currentTheme).headerContainer]}>
                  {/* user address */}
                  <TouchableOpacity
                    onPress={handleNavigateAddress}
                    style={{
                      backgroundColor: '#F5F5F5',
                      marginVertical: 16,
                      padding: 16,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 3
                    }}
                  >
                    <View
                      style={{
                        flexDirection: isArabic ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <View
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <EvilIcons
                          name='location'
                          size={scale(22)}
                          color='#333'
                        />
                        <TextDefault
                          bolder
                          style={{ fontSize: 16, color: '#333' }}
                        >
                          {t('your_address')}
                        </TextDefault>
                        <TextDefault
                          bolder
                          style={{ fontSize: 12, color: '#000' }}
                        >
                          {`(${location.label})`}
                        </TextDefault>
                      </View>
                      <View
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row',
                          gap: 5
                        }}
                      >
                        <TextDefault
                          bolder
                          style={{ fontSize: 16, color: '#333' }}
                        >
                          {t('edit')}
                        </TextDefault>

                        <Feather
                          name={isArabic ? 'chevron-left' : 'chevron-right'}
                          size={20}
                          color='#999'
                        />
                      </View>
                    </View>
                    <View style={{ marginTop: 8 }}>
                      <TextDefault
                        style={{
                          fontSize: 14,
                          color: '#666',
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        {translatedAddress}
                      </TextDefault>
                    </View>
                  </TouchableOpacity>

                  {/* business address */}
                  <TouchableOpacity
                    onPress={() =>
                      openGoogleMaps({
                        latitude: latOrigin,
                        longitude: lonOrigin
                      })
                    }
                    style={{
                      backgroundColor: '#F5F5F5',
                      marginVertical: 16,
                      padding: 16,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 3
                    }}
                  >
                    <View
                      style={{
                        flexDirection: isArabic ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <View
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <EvilIcons
                          name='location'
                          size={scale(22)}
                          color='#333'
                        />
                        <TextDefault
                          bolder
                          style={{ fontSize: 16, color: '#333' }}
                        >
                          {t('business_address')}
                        </TextDefault>
                      </View>
                      <View
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row',
                          gap: 5
                        }}
                      >
                        <Feather
                          name={isArabic ? 'chevron-left' : 'chevron-right'}
                          size={20}
                          color='#999'
                        />
                      </View>
                    </View>
                    <View style={{ marginTop: 8 }}>
                      {/* <TextDefault
                        style={{
                          fontSize: 14,
                          color: '#666',
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        {businessAddress}
                      </TextDefault> */}
                    </View>
                  </TouchableOpacity>

                  {/* <Location
                    locationIcon={currentTheme.newIconColor}
                    locationLabel={currentTheme.newFontcolor}
                    location={currentTheme.newFontcolor}
                    navigation={props.navigation}
                    addresses={profile.addresses}
                    forwardIcon={true}
                    screenName={'checkout'}
                  /> */}

                  <View
                    style={[
                      styles(currentTheme).horizontalLine,
                      styles().width100
                    ]}
                  />
                  {/* <TouchableOpacity
                    onPress={() => {
                      onModalOpen(modalRef)
                    }}
                    style={{
                      ...styles(currentTheme).deliveryTime
                    }}
                  >
                    <View style={[styles().iconContainer]}>
                      <View style={styles().icon}>
                        <EvilIcons name='calendar' size={scale(20)} />
                      </View>
                    </View>
                    <View style={styles(currentTheme).labelContainer}>
                      <View style={{ marginInlineStart: scale(5) }}>
                        <TextDefault
                          textColor={currentTheme.newFontcolor}
                          numberOfLines={1}
                          H5
                          bolder
                        >
                          {t(isPickup ? 'pickUp' : 'delivery')} ({deliveryTime}{' '}
                          {t('mins')})
                        </TextDefault>
                      </View>
                    </View>
                    <View
                      style={[
                        styles().iconContainer,
                        { justifyContent: 'center', alignItems: 'center' }
                      ]}
                    >
                      <View style={[styles().icon, { backgroundColor: null }]}>
                        <Feather
                          name='chevron-right'
                          size={20}
                          color={currentTheme.secondaryText}
                        />
                      </View>
                    </View>
                  </TouchableOpacity> */}
                </View>
                <View>
                  <Instructions
                    theme={currentTheme}
                    title={'Instruction for the courier'}
                    message={instructions}
                  />
                </View>

                {isLoggedIn && profile && (
                  <>
                    <View style={styles().paymentSec}>
                      <TextDefault
                        numberOfLines={1}
                        H5
                        bolder
                        textColor={currentTheme.fontNewColor}
                        style={{ textAlign: isArabic ? 'right' : 'left' }}
                      >
                        {t('titlePayment')}
                      </TextDefault>
                      <View>
                        <PaymentModeOption
                          isArabic={isArabic}
                          title={t('cod')}
                          icon={'dollar'}
                          selected={paymentMode === 'COD'}
                          theme={currentTheme}
                          onSelect={() => {
                            setPaymentMode('COD')
                          }}
                        />
                        {/* <PaymentModeOption
                          title={'Card (Stripe)'}
                          icon={'credit-card'}
                          selected={paymentMode === 'STRIPE'}
                          theme={currentTheme}
                          onSelect={() => {
                            setPaymentMode('STRIPE')
                          }}
                        />
                        <PaymentModeOption
                          title={'Card (Paypal)'}
                          icon={'credit-card'}
                          selected={paymentMode === 'PAYPAL'}
                          theme={currentTheme}
                          onSelect={() => {
                            setPaymentMode('PAYPAL')
                          }}
                        /> */}
                      </View>
                    </View>
                  </>
                )}
                <View
                  style={[
                    styles(currentTheme).horizontalLine2,
                    { width: '92%', alignSelf: 'center' }
                  ]}
                />

                <View style={styles().voucherSec}>
                  {!coupon ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        ...styles().voucherSecInner,
                        flexDirection: isArabic ? 'row-reverse' : 'row'
                      }}
                      onPress={() => onModalOpen(voucherModalRef)}
                    >
                      <MaterialCommunityIcons
                        name='ticket-confirmation-outline'
                        size={24}
                        color={currentTheme.lightBlue}
                      />
                      <TextDefault
                        H4
                        bolder
                        textColor={currentTheme.lightBlue}
                        center
                      >
                        {t('applyVoucher')}
                      </TextDefault>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TextDefault
                        numberOfLines={1}
                        H5
                        bolder
                        textColor={currentTheme.fontNewColor}
                      >
                        Voucher
                      </TextDefault>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: scale(8),
                            gap: scale(5)
                          }}
                        >
                          <AntDesign
                            name='tags'
                            size={24}
                            color={currentTheme.main}
                          />
                          <View>
                            <TextDefault
                              numberOfLines={1}
                              tnormal
                              bold
                              textColor={currentTheme.fontFourthColor}
                            >
                              {coupon ? coupon.code : null} applied
                            </TextDefault>
                            {/* <TextDefault
                              small
                              bold
                              textColor={currentTheme.fontFourthColor}
                            >
                              -{configuration.currencySymbol}
                              {parseFloat(
                                calculatePrice(0, false) -
                                  calculatePrice(0, true)
                              ).toFixed(2)}
                            </TextDefault> */}
                          </View>
                        </View>
                        <View style={styles(currentTheme).changeBtn}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setCoupon(null)}
                          >
                            <TextDefault
                              small
                              bold
                              textColor={currentTheme.darkBgFont}
                              center
                            >
                              {coupon ? t('remove') : null}
                            </TextDefault>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </View>
                {/* <View style={styles().tipSec}>
                  <View style={[styles().tipRow]}>
                    <TextDefault
                      numberOfLines={1}
                      H5
                      bolder
                      textColor={currentTheme.fontNewColor}
                    >
                      {t('AddTip')}
                    </TextDefault>
                    <TextDefault
                      numberOfLines={1}
                      normal
                      bolder
                      uppercase
                      textItalic
                      textColor={currentTheme.fontNewColor}
                    >
                      {t('optional')}
                    </TextDefault>
                  </View>
                  {dataTip && (
                    <View style={styles().buttonInline}>
                      {dataTip.tips.tipVariations.map((label, index) => (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          key={index}
                          style={[
                            selectedTip === label
                              ? styles(currentTheme).activeLabel
                              : styles(currentTheme).labelButton
                          ]}
                          onPress={() => {
                            props.navigation.setParams({ tipAmount: null })
                            setTip(null)
                            setSelectedTip((prevState) =>
                              prevState === label ? null : label
                            )
                          }}
                        >
                          <TextDefault
                            textColor={
                              selectedTip === label
                                ? currentTheme.black
                                : currentTheme.fontFourthColor
                            }
                            normal
                            bolder
                            center
                          >
                            {label}%
                          </TextDefault>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={
                          tip
                            ? styles(currentTheme).activeLabel
                            : styles(currentTheme).labelButton
                        }
                        onPress={() => onModalOpen(tipModalRef)}
                      >
                        <TextDefault
                          textColor={
                            tip
                              ? currentTheme.black
                              : currentTheme.fontFourthColor
                          }
                          normal
                          bolder
                          center
                        >
                          {t('Other')}
                        </TextDefault>
                      </TouchableOpacity>
                    </View>
                  )}
                </View> */}
                <View style={[styles(currentTheme).priceContainer]}>
                  <TextDefault
                    numberOfLines={1}
                    H5
                    bolder
                    textColor={currentTheme.fontNewColor}
                    style={{
                      ...alignment.MBmedium,
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                  >
                    {t('paymentSummary')}
                  </TextDefault>
                  <View
                    style={{
                      ...styles().billsec,
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}
                  >
                    <TextDefault
                      numberOfLines={1}
                      normal
                      bold
                      textColor={currentTheme.fontFourthColor}
                    >
                      {t('subTotal')}
                    </TextDefault>
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      normal
                      bold
                    >
                      {calculatePrice(0, false)}{' '}
                      {isArabic
                        ? configuration.currencySymbol
                        : configuration.currency}
                    </TextDefault>
                  </View>
                  {coupon?.appliesTo === 'subtotal' && (
                    <View>
                      <View style={styles(currentTheme).horizontalLine2} />
                      <View
                        style={{
                          ...styles().billsec,
                          flexDirection: isArabic ? 'row-reverse' : 'row'
                        }}
                      >
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          {t('voucherDiscountSubtotal')}
                        </TextDefault>
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          -{!isArabic ? configuration.currencySymbol : null}
                          {parseFloat(
                            calculatePrice(0, false) - calculatePrice(0, true)
                          ).toFixed(2)}{' '}
                          {isArabic ? configuration.currencySymbol : null}
                        </TextDefault>
                      </View>
                    </View>
                  )}
                  {calculatePrice(0, true) < minimumOrder - coupon && (
                    <View
                      style={{
                        backgroundColor: 'rgba(255,0,0,0.5)',
                        paddingVertical: 5,
                        borderRadius: 3,
                        marginTop: 10
                      }}
                    >
                      {showMinimumOrderMessage()}
                    </View>
                  )}
                  <View style={styles(currentTheme).horizontalLine2} />

                  {!isPickup && (
                    <>
                      <View
                        style={{
                          ...styles().billsec,
                          flexDirection: isArabic ? 'row-reverse' : 'row'
                        }}
                      >
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          {t('deliveryFee')}
                        </TextDefault>
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          {deliveryCharges.toFixed(2)}{' '}
                          {isArabic
                            ? configuration.currencySymbol
                            : configuration.currency}
                          {/* {deliveryCharges} */}
                        </TextDefault>
                      </View>
                      {coupon?.appliesTo === 'delivery' && (
                        <View>
                          <View style={styles(currentTheme).horizontalLine2} />
                          <View
                            style={{
                              ...styles().billsec,
                              flexDirection: isArabic ? 'row-reverse' : 'row'
                            }}
                          >
                            <TextDefault
                              numberOfLines={1}
                              textColor={currentTheme.fontFourthColor}
                              normal
                              bold
                            >
                              {t('voucherDiscountDelivery')}
                            </TextDefault>
                            <TextDefault
                              numberOfLines={1}
                              textColor={currentTheme.fontFourthColor}
                              normal
                              bold
                            >
                              -{!isArabic ? configuration.currencySymbol : null}
                              {parseFloat(deliveryDiscount).toFixed(2)}{' '}
                              {isArabic ? configuration.currencySymbol : null}
                            </TextDefault>
                          </View>
                        </View>
                      )}
                      <View style={styles(currentTheme).horizontalLine2} />
                    </>
                  )}

                  <View
                    style={{
                      ...styles().billsec,
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}
                  >
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      normal
                      bold
                    >
                      {t('taxFee')}
                    </TextDefault>
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      normal
                      bold
                    >
                      {taxCalculation()}{' '}
                      {isArabic
                        ? configuration.currencySymbol
                        : configuration.currency}
                    </TextDefault>
                  </View>
                  <View style={styles(currentTheme).horizontalLine2} />
                  {/* <View
                    style={{
                      ...styles().billsec,
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}
                  >
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      normal
                      bold
                    >
                      {t('tip')}
                    </TextDefault>
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      normal
                      bold
                    >
                      {configuration.currencySymbol}
                      {parseFloat(calculateTip()).toFixed(2)}
                    </TextDefault>
                  </View> */}
                  {/* {coupon && (
                    <View>
                      <View style={styles(currentTheme).horizontalLine2} />
                      <View
                        style={{
                          ...styles().billsec,
                          flexDirection: isArabic ? 'row-reverse' : 'row'
                        }}
                      >
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          {t('voucherDiscount')}
                        </TextDefault>
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          -{configuration.currencySymbol}
                          {parseFloat(
                            calculatePrice(0, false) - calculatePrice(0, true)
                          ).toFixed(2)}
                        </TextDefault>
                      </View>
                    </View>
                  )} */}

                  <View style={styles(currentTheme).horizontalLine2} />
                  <View
                    style={{
                      ...styles().billsec,
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}
                  >
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      H4
                      bolder
                    >
                      {t('total')}
                    </TextDefault>
                    <TextDefault
                      numberOfLines={1}
                      textColor={currentTheme.fontFourthColor}
                      normal
                      bold
                    >
                      {calculateTotal()}{' '}
                      {isArabic
                        ? configuration.currencySymbol
                        : configuration.currency}
                    </TextDefault>
                  </View>
                </View>

                <View
                  style={[
                    styles(currentTheme).termsContainer,
                    styles().pT10,
                    styles().mB10
                  ]}
                >
                  <TextDefault
                    textColor={currentTheme.fontMainColor}
                    style={{
                      ...alignment.MBsmall,
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                    small
                  >
                    {t('condition1')}
                  </TextDefault>
                  <TextDefault
                    textColor={currentTheme.fontSecondColor}
                    style={{
                      ...alignment.MBsmall,
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                    small
                    bold
                  >
                    {t('condition2')}
                  </TextDefault>
                </View>
              </View>
            </ScrollView>

            {!isModalOpen && (
              <View style={styles(currentTheme).buttonContainer}>
                <TouchableOpacity
                  disabled={
                    loadingOrder ||
                    minimumOrder - coupon > calculatePrice(0, true)
                  }
                  activeOpacity={0.7}
                  onPress={() => {
                    if (validateOrder()) {
                      setLoadingOrder(true)
                      onPayment()
                    }
                  }}
                  style={[
                    styles(currentTheme).button,
                    {
                      opacity: loadingOrder ? 0.5 : 1,
                      backgroundColor:
                        loadingOrder ||
                        minimumOrder - coupon > calculatePrice(0, true)
                          ? 'grey'
                          : currentTheme.main
                    }
                  ]}
                >
                  {!loadingOrder && (
                    <TextDefault
                      textColor={currentTheme.color4}
                      style={styles().checkoutBtn}
                      bold
                      H4
                    >
                      {t('placeOrder')}
                    </TextDefault>
                  )}
                  {loadingOrder && <Spinner backColor={'transparent'} />}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Tip Modal */}
        <Modalize
          ref={tipModalRef}
          modalStyle={[styles(currentTheme).modal]}
          overlayStyle={styles(currentTheme).overlay}
          handleStyle={styles(currentTheme).handle}
          modalHeight={550}
          handlePosition='inside'
          openAnimationConfig={{
            timing: { duration: 400 },
            spring: { speed: 20, bounciness: 10 }
          }}
          closeAnimationConfig={{
            timing: { duration: 400 },
            spring: { speed: 20, bounciness: 10 }
          }}
        >
          <View style={styles().modalContainer}>
            <View style={styles().modalHeader}>
              <View activeOpacity={0.7} style={styles().modalheading}>
                <FontAwesome
                  name={paymentMethod?.icon}
                  size={20}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  H4
                  bolder
                  textColor={currentTheme.newFontcolor}
                  center
                >
                  {t('AddTip')}
                </TextDefault>
              </View>
              <Feather
                name='x-circle'
                size={24}
                color={currentTheme.newIconColor}
                onPress={() => onModalClose(tipModalRef)}
              />
            </View>
            <View style={{ gap: 8 }}>
              <TextDefault uppercase bold textColor={currentTheme.gray500}>
                {t('enterCode')}
              </TextDefault>
              <TextInput
                keyboardType='numeric'
                placeholder={t('enterAmount')}
                value={tipAmount}
                onChangeText={(text) => setTipAmount(text)}
                style={styles(currentTheme).modalInput}
              />
            </View>
            <TouchableOpacity
              disabled={!tipAmount}
              activeOpacity={0.7}
              onPress={onTipping}
              style={[styles(currentTheme).button, { height: scale(40) }]}
            >
              <TextDefault
                textColor={currentTheme.black}
                style={styles().checkoutBtn}
                bold
                H4
              >
                {t('apply')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </Modalize>
        {/* Voucher Modal */}
        <Modalize
          ref={voucherModalRef}
          modalStyle={[styles(currentTheme).modal]}
          overlayStyle={styles(currentTheme).overlay}
          handleStyle={styles(currentTheme).handle}
          modalHeight={550}
          handlePosition='inside'
          openAnimationConfig={{
            timing: { duration: 400 },
            spring: { speed: 20, bounciness: 10 }
          }}
          closeAnimationConfig={{
            timing: { duration: 400 },
            spring: { speed: 20, bounciness: 10 }
          }}
        >
          <View style={styles().modalContainer}>
            <View style={styles().modalHeader}>
              <View activeOpacity={0.7} style={styles().modalheading}>
                <MaterialCommunityIcons
                  name='ticket-confirmation-outline'
                  size={24}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  H4
                  bolder
                  textColor={currentTheme.newFontcolor}
                  center
                >
                  {t('applyVoucher')}
                </TextDefault>
              </View>
              <Feather
                name='x-circle'
                size={24}
                color={currentTheme.newIconColor}
                onPress={() => onModalClose(voucherModalRef)}
              />
            </View>
            <View style={{ gap: 8 }}>
              <TextDefault uppercase bold textColor={currentTheme.gray500}>
                {t('enterCode')}
              </TextDefault>
              <TextInput
                label={t('inputCode')}
                placeholder={t('inputCode')}
                value={voucherCode}
                onChangeText={(text) => setVoucherCode(text)}
                style={styles(currentTheme).modalInput}
              />
            </View>
            <TouchableOpacity
              disabled={!voucherCode || couponLoading}
              activeOpacity={0.7}
              onPress={handleApplyCoupon}
              style={[
                styles(currentTheme).button,
                !voucherCode && styles(currentTheme).buttonDisabled,
                { height: scale(40) },
                { opacity: couponLoading ? 0.5 : 1 }
              ]}
            >
              {!couponLoading && (
                <TextDefault
                  textColor={currentTheme.black}
                  style={styles().checkoutBtn}
                  bold
                  H4
                >
                  {t('apply')}
                </TextDefault>
              )}
              {couponLoading && <Spinner backColor={'transparent'} />}
            </TouchableOpacity>
          </View>
        </Modalize>
      </View>
      <View
        style={{
          paddingBottom: inset.bottom,
          backgroundColor: currentTheme.themeBackground
        }}
      />
      <Modalize
        ref={modalRef}
        modalStyle={styles(currentTheme).modal}
        modalHeight={HEIGHT / 2}
        overlayStyle={styles(currentTheme).overlay}
        handleStyle={styles(currentTheme).handle}
        handlePosition='inside'
        openAnimationConfig={{
          timing: { duration: 400 },
          spring: { speed: 20, bounciness: 10 }
        }}
        closeAnimationConfig={{
          timing: { duration: 400 },
          spring: { speed: 20, bounciness: 10 }
        }}
      >
        <PickUp
          minimumTime={restaurant?.deliveryTime}
          setOrderDate={setOrderDate}
          isPickedUp={isPickup}
          setIsPickedUp={setIsPickup}
          orderDate={orderDate}
          pickupTextColor={currentTheme.newFontcolor}
        />
        <TouchableOpacity
          onPress={() => {
            modalRef.current.close()
          }}
          style={styles(currentTheme).pickupButton}
        >
          <Text style={styles(currentTheme).applyButton}>{t('apply')}</Text>
        </TouchableOpacity>
      </Modalize>
    </>
  )
}

export default Checkout
