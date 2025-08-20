import React, {
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  useRef
} from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Button
} from 'react-native'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { AntDesign } from '@expo/vector-icons'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import CartItem from '../../components/CartItem/CartItem'
import { getDeliveryCalculationV2, getTipping } from '../../apollo/queries'
import { moderateScale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import { alignment } from '../../utils/alignment'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../../context/Configuration'
import UserContext from '../../context/User'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useRestaurant } from '../../ui/hooks'
import { LocationContext } from '../../context/Location'
import EmptyCart from '../../assets/SVG/imageComponents/EmptyCart'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { DAYS } from '../../utils/enums'
import { textStyles } from '../../utils/textStyles'
import { calculateDistance } from '../../utils/customFunctions'
import analytics from '../../utils/analytics'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { useTranslation } from 'react-i18next'
import WouldYouLikeToAddThese from './Section'
import { SpecialInstructions } from '../../components/Cart/SpecialInstructions'
import { colors } from '../../utils/colors'
import { Fragment } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

// Constants
const TIPPING = gql`
  ${getTipping}
`

function Cart(props) {
  const Analytics = analytics()
  const insets = useSafeAreaInsets()
  const FOOTER_HEIGHT = moderateScale(70)
  const navigation = useNavigation()
  const configuration = useContext(ConfigurationContext)
  const {
    isLoggedIn,
    profile,
    restaurant: cartRestaurant,
    cart,
    cartCount,
    addQuantity,
    removeQuantity,
    isPickup,
    setIsPickup,
    instructions,
    setInstructions,
    populateFood
  } = useContext(UserContext)
  const themeContext = useContext(ThemeContext)
  const { location } = useContext(LocationContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const [loadingData, setLoadingData] = useState(true)
  const [minimumOrder, setMinimumOrder] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState({})
  const [deliveryCharges, setDeliveryCharges] = useState(0)

  const [orderDate, setOrderDate] = useState(new Date())
  const isCartEmpty = cart?.length === 0
  const cartLength = !isCartEmpty ? cart?.length : 0
  const { loading, data } = useRestaurant(cartRestaurant)
  const restaurant = data?.restaurantCustomer || null

  const foods = restaurant?.categories?.map((c) => c.foods.flat()).flat()
  // console.log({ dataHere: data })

  const { loading: loadingTip, data: dataTip } = useQuery(TIPPING, {
    fetchPolicy: 'network-only'
  })

  const {
    data: calcDeliveryData,
    loading: calcLoading,
    error: errorCalc
  } = useQuery(getDeliveryCalculationV2, {
    skip: !data,
    variables: {
      input: {
        destLong: Number(location.longitude),
        destLat: Number(location.latitude),
        originLong: Number(data?.restaurantCustomer.location.coordinates[0]),
        originLat: Number(data?.restaurantCustomer.location.coordinates[1])
      }
    }
  })

  const coupon =
    props.route.params && props.route.params.coupon
      ? props.route.params.coupon
      : null

  const tip =
    props.route.params && props.route.params.tipAmount
      ? props.route.params.tipAmount
      : null

  const [selectedTip, setSelectedTip] = useState()

  useEffect(() => {
    if (calcDeliveryData) {
      const amount = calcDeliveryData.getDeliveryCalculationV2.amount
      setDeliveryCharges(
        amount >= configuration.minimumDeliveryFee
          ? amount
          : configuration.minimumDeliveryFee
      )
    }
  }, [calcDeliveryData])

  useEffect(() => {
    if (tip) {
      setSelectedTip(null)
    } else if (dataTip && !selectedTip) {
      setSelectedTip(dataTip.tips.tipVariations[1])
    }
  }, [tip, data])

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })

  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: t('titleCart'),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        ...textStyles.H4,
        ...textStyles.Bolder
      },
      headerTitleContainerStyle: {
        paddingLeft: moderateScale(25),
        paddingRight: moderateScale(25)
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View
              style={{
                ...alignment.PLsmall,
                alignItems: 'center'
              }}
            >
              <AntDesign
                name='arrowleft'
                size={moderateScale(22)}
                color={currentTheme.newIconColor}
              />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props.navigation])

  useLayoutEffect(() => {
    if (!data) return
    didFocus()
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

  const showAvailablityMessage = () => {
    Alert.alert(
      '',
      `${data?.restaurantCustomer.name} ${t('restaurantClosed')}`,
      [
        {
          text: t('backToRestaurants'),
          onPress: () => {
            props.navigation.navigate({
              name: 'Main',
              merge: true
            })
          },
          style: 'cancel'
        },
        {
          text: t('continueBtn'),
          onPress: () => {},
          style: 'cancel'
        }
      ],
      { cancelable: true }
    )
  }

  function calculatePrice(delivery = 0, withDiscount) {
    let itemTotal = 0
    cart.forEach((cartItem) => {
      const food = populateFood(cartItem)
      if (!food) return
      itemTotal += food.price * food.quantity
    })
    if (withDiscount && coupon && coupon.discount) {
      itemTotal = itemTotal - (coupon.discount / 100) * itemTotal
    }
    const deliveryAmount = delivery > 0 ? deliveryCharges : 0
    return (itemTotal + deliveryAmount).toFixed(2)
  }

  // function taxCalculation() {
  //   const tax = taxValue ?? 0
  //   if (tax === 0) {
  //     return tax.toFixed(2)
  //   }
  //   const delivery = isPickUp ? 0 : deliveryCharges
  //   const amount = +calculatePrice(delivery, true)
  //   const taxAmount = ((amount / 100) * tax).toFixed(2)
  //   console.log('tax:', { taxAmount, deliveryCharges, tax, amount })
  //   return taxAmount
  // }

  function calculateTotal() {
    let total = 0
    const delivery = isPickup ? 0 : deliveryCharges
    total += +calculatePrice(0) // calculatePrice(delivery)
    // total += +taxCalculation()
    // total += +calculateTip()
    return parseFloat(total).toFixed(2)
  }

  const isOpen = () => {
    const date = new Date()
    const day = date.getDay()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const todaysTimings = data?.restaurantCustomer.openingTimes?.find(
      (o) => o.day === DAYS[day]
    )
    const times = todaysTimings?.times?.filter(
      (t) =>
        hours >= Number(t.startTime[0]) &&
        minutes >= Number(t.startTime[1]) &&
        hours <= Number(t.endTime[0]) &&
        minutes <= Number(t.endTime[1])
    )

    return times?.length > 0
  }

  async function didFocus() {
    const { restaurantCustomer } = data
    setSelectedRestaurant(restaurantCustomer)
    setMinimumOrder(restaurantCustomer.minimumOrder)
    setLoadingData(false)
  }

  const showMinimumOrderMessage = () => {
    if (calculatePrice(0, true) < minimumOrder) {
      return (
        <TextDefault
          bolder
          style={{
            color: 'red',
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

  function emptyCart() {
    return (
      <View style={styles().subContainerImage}>
        <View style={styles().imageContainer}>
          <EmptyCart width={moderateScale(200)} height={moderateScale(200)} />
        </View>
        <View style={styles().descriptionEmpty}>
          <TextDefault textColor={currentTheme.fontMainColor} bolder center>
            {t('hungry')}?
          </TextDefault>
          <TextDefault textColor={currentTheme.fontSecondColor} bold center>
            {t('emptyCart')}
          </TextDefault>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles(currentTheme).emptyButton}
          onPress={() =>
            props.navigation.navigate({
              name: 'Main',
              merge: true
            })
          }
        >
          <TextDefault
            textColor={currentTheme.buttonText}
            bolder
            B700
            center
            uppercase
          >
            {t('emptyCartBtn')}
          </TextDefault>
        </TouchableOpacity>
      </View>
    )
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

  // const addons = restaurant?.addons
  // const options = restaurant?.options

  // const foods = restaurant?.categories?.map((c) => c.foods.flat()).flat()

  // function populateFood(cartItem) {
  //   const food = foods?.find((food) => food._id === cartItem._id)
  //   if (!food) return null
  //   const variation = food.variations.find(
  //     (variation) => variation._id === cartItem.variation._id
  //   )
  //   if (!variation) return null

  //   const title = `${food.title}${
  //     variation.title ? `(${variation.title})` : ''
  //   }`
  //   let price = variation.price
  //   const optionsTitle = []
  //   if (cartItem.addons) {
  //     cartItem.addons.forEach((addon) => {
  //       const cartAddon = addons.find((add) => add._id === addon._id)
  //       if (!cartAddon) return null
  //       addon.options.forEach((option) => {
  //         const cartOption = options.find((opt) => opt._id === option._id)
  //         if (!cartOption) return null
  //         price += cartOption.price
  //         optionsTitle.push(cartOption.title)
  //       })
  //     })
  //   }
  //   const populateAddons = addons.filter((addon) =>
  //     food?.variations[0]?.addons?.includes(addon._id)
  //   )
  //   return {
  //     ...cartItem,
  //     optionsTitle,
  //     title: title,
  //     price: price.toFixed(2),
  //     image: food?.image,
  //     addons: populateAddons
  //   }
  // }

  let deliveryTime = Math.floor((orderDate - Date.now()) / 1000 / 60)
  if (deliveryTime < 1) deliveryTime += restaurant?.deliveryTime

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View style={styles(currentTheme).mainContainer}>
        {!cart?.length ? (
          emptyCart()
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={[styles().flex, styles().cartItems]}
              contentContainerStyle={{
                paddingBottom: FOOTER_HEIGHT + insets.bottom + moderateScale(16)
              }}
            >
              <View
                style={{
                  ...alignment.PLsmall,
                  ...alignment.PRsmall,
                  marginTop: 10
                }}
              >
                <SpecialInstructions
                  instructions={instructions}
                  onSubmitInstructions={setInstructions}
                  theme={currentTheme}
                />
              </View>
              <View
                style={{
                  ...alignment.PLsmall,
                  ...alignment.PRsmall,
                  marginTop: 10
                }}
              >
                <View
                  style={[styles(currentTheme).dealContainer, styles().mB10]}
                >
                  <TextDefault
                    textColor={currentTheme.gray500}
                    style={styles().totalOrder}
                    H5
                    bolder
                  >
                    {t('yourOrder')} ({cartLength})
                  </TextDefault>

                  {cart?.map((cartItem, index) => {
                    const food = populateFood(cartItem)
                    console.log({ food })
                    if (!food) return null
                    return (
                      <View
                        key={cartItem._id + index}
                        style={[styles(currentTheme).itemContainer]}
                      >
                        <CartItem
                          itemKey={food.key}
                          quantity={food.quantity}
                          dealName={food.title}
                          optionsTitle={food.optionsTitle}
                          itemImage={food.image}
                          itemAddons={food.addons}
                          cartRestaurant={cartRestaurant}
                          dealPrice={(
                            parseFloat(food.price) * food.quantity
                          ).toFixed(2)}
                          addQuantity={() => {
                            addQuantity(food.key)
                          }}
                          removeQuantity={() => {
                            removeQuantity(food.key)
                          }}
                        />
                      </View>
                    )
                  })}
                </View>
              </View>
              <View style={styles().suggestedItems}>
                <WouldYouLikeToAddThese
                  itemId={foods[0]._id}
                  food={foods[0]}
                  restaurantId={restaurant._id}
                  restaurant={restaurant}
                />
              </View>
            </ScrollView>

            <View
              // style={styles().totalBillContainer}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: FOOTER_HEIGHT  + moderateScale(50),
                backgroundColor: currentTheme.newheaderColor, // or your prop
                paddingHorizontal: moderateScale(16),
                justifyContent: 'center',
                zIndex: 20
              }}
            >
              <View style={styles(currentTheme).buttonContainer}>
                <View style={styles().cartAmount}>
                  {isArabic ? (
                    <TextDefault
                      textColor={currentTheme.black}
                      style={styles().totalBill}
                      bolder
                      H2
                    >
                      {calculateTotal()} {configuration.currencySymbol}
                    </TextDefault>
                  ) : (
                    <TextDefault
                      textColor={currentTheme.black}
                      style={styles().totalBill}
                      bolder
                      H2
                    >
                      {configuration.currencySymbol}
                      {calculateTotal()}
                    </TextDefault>
                  )}
                </View>
                {isLoggedIn && profile ? (
                  <Fragment>
                    {calculateTotal() >= minimumOrder ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          navigation.navigate('Checkout')
                        }}
                        style={styles(currentTheme).button}
                      >
                        <TextDefault
                          textColor={currentTheme.white}
                          style={styles().checkoutBtn}
                          bold
                          H5
                        >
                          {t('checkoutBtn')}
                        </TextDefault>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={{
                          width: '50%'
                        }}
                      >
                        {showMinimumOrderMessage()}
                      </View>
                    )}
                  </Fragment>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      props.navigation.navigate({ name: 'CreateAccount' })
                    }}
                    style={styles(currentTheme).button}
                  >
                    <TextDefault
                      textColor={currentTheme.white}
                      style={{ width: '100%' }}
                      H5
                      bolder
                      center
                    >
                      {t('loginOrSignUp')}
                    </TextDefault>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

export default Cart
