import { TouchableOpacity, View, ScrollView, Dimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import styles from './styles'
import React, { useContext, useEffect, useState, useRef } from 'react'
import Spinner from '../../components/Spinner/Spinner'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import TextError from '../../components/Text/TextError/TextError'
import ConfigurationContext from '../../context/Configuration'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import analytics from '../../utils/analytics'
import Detail from '../../components/OrderDetail/Detail/Detail'
import RestaurantMarker from '../../assets/SVG/restaurant-marker'
import CustomerMarker from '../../assets/SVG/customer-marker'
import TrackingRider from '../../components/OrderDetail/TrackingRider/TrackingRider'
import OrdersContext from '../../context/Orders'
import { mapStyle } from '../../utils/mapStyle'
import { useTranslation } from 'react-i18next'
import { HelpButton } from '../../components/Header/HeaderIcons/HeaderIcons'
import {
  ProgressBar,
  checkStatus
} from '../../components/Main/ActiveOrders/ProgressBar'
import { useNavigation } from '@react-navigation/native'
import { PriceRow } from '../../components/OrderDetail/PriceRow'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { CancelModal } from '../../components/OrderDetail/CancelModal'
import Button from '../../components/Button/Button'
import { gql, useMutation, useQuery } from '@apollo/client'
import { cancelOrder as cancelOrderMutation } from '../../apollo/mutations'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { calulateRemainingTime } from '../../utils/customFunctions'
import { Instructions } from '../../components/Checkout/Instructions'
import MapViewDirections from 'react-native-maps-directions'
import useEnvVars from '../../../environment'
import LottieView from 'lottie-react-native'
import { singleOrder } from '../../apollo/queries'
import JSONTree from 'react-native-json-tree'

const { height: HEIGHT, width: WIDTH } = Dimensions.get('screen')

const CANCEL_ORDER = gql`
  ${cancelOrderMutation}
`

const ORDER = gql`
  ${singleOrder}
`

function OrderDetail(props) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  // const Analytics = analytics()
  const id = props.route.params ? props.route.params._id : null
  // const user = props.route.params ? props.route.params.user : null
  const { orders } = useContext(OrdersContext)
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const navigation = useNavigation()
  // const headerRef = useRef(false)
  // const { GOOGLE_MAPS_KEY } = useEnvVars()
  const mapView = useRef(null)
  const [cancelOrder, { loading: loadingCancel }] = useMutation(CANCEL_ORDER, {
    onError,
    variables: { abortOrderId: id }
  })

  const {
    data,
    // called: calledOrders,
    loading: loadingOrders,
    error: errorOrders
    // networkStatus: networkStatusOrders,
    // fetchMore: fetchMoreOrders,
    // subscribeToMore: subscribeToMoreOrders
  } = useQuery(ORDER, {
    variables: { id },
    fetchPolicy: 'network-only',
    onError,
    pollInterval: 10000
  })

  const order = data?.singleOrder

  const cancelModalToggle = () => {
    setCancelModalVisible(!cancelModalVisible)
  }

  function onError(error) {
    FlashMessage({
      message: error.message
    })
  }

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () =>
        HelpButton({
          iconBackground: currentTheme.main,
          navigation,
          t
        }),
      headerTitle: `${order ? order?.deliveryAddress?.deliveryAddress?.substr(0, 15) : ''}...`,
      headerTitleStyle: { color: currentTheme.newFontcolor },
      headerStyle: { backgroundColor: currentTheme.newheaderBG }
    })
  }, [orders])

  if (loadingOrders || !order) {
    return (
      <Spinner
        backColor={currentTheme.themeBackground}
        spinnerColor={currentTheme.main}
      />
    )
  }
  if (errorOrders) return <TextError text={JSON.stringify(errorOrders)} />

  const remainingTime = calulateRemainingTime(order)
  const {
    _id,
    restaurant,
    deliveryAddress,
    items,
    tipping: tip,
    taxationAmount: tax,
    orderAmount: total,
    deliveryCharges,
    originalDeliveryCharges,
    originalPrice,
    originalSubtotal,
    coupon
    // pickupLocation
  } = order

  console.log({ coupon })

  const pickupLocation = order?.pickupLocation || null

  function taxCalculation() {
    const tax = order?.restaurant ? order?.restaurant?.tax : 0
    console.log({ tax })
    if (tax === 0) {
      return tax.toFixed(2)
    }
    const delivery = order.isPickedUp ? 0 : deliveryCharges
    const amount = +calculatePrice(delivery, true)
    console.log({ amount })
    const taxAmount = ((amount / 100) * tax).toFixed(2)
    return taxAmount
  }

  function calculatePrice(delivery = 0, withDiscount) {
    let itemTotal = 0
    order.items.forEach((item) => {
      let total = item.variation.price
      console.log({ total })
      item.addons.forEach((addon) => {
        addon.options.forEach((option) => {
          if (option.selected) {
            total += option.price
          }
        })
      })
      itemTotal += total
    })
    if (withDiscount && order.coupon?.discount) {
      itemTotal -= (order.coupon.discount / 100) * itemTotal
    }
    const deliveryAmount = delivery > 0 ? deliveryCharges : 0
    return (itemTotal + deliveryAmount).toFixed(2)
  }

  const subTotal = total - tip - tax - deliveryCharges

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: currentTheme.themeBackground
          // paddingBottom: scale(150)
        }}
        showsVerticalScrollIndicator={false}
        overScrollMode='never'
      >
        {order &&
          order.rider &&
          order.orderStatus === ORDER_STATUS_ENUM.PICKED && (
            <MapView
              ref={(c) => (mapView.current = c)}
              style={{ flex: 1, height: HEIGHT * 0.3 }}
              showsUserLocation={false}
              initialRegion={{
                latitude: +deliveryAddress?.location?.coordinates[1],
                longitude: +deliveryAddress?.location?.coordinates[0],
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
              zoomEnabled={true}
              zoomControlEnabled={true}
              rotateEnabled={false}
              // customMapStyle={mapStyle}
              provider={PROVIDER_GOOGLE}
            >
              {restaurant && restaurant.location ? (
                <Marker
                  coordinate={{
                    longitude: restaurant
                      ? +restaurant?.location?.coordinates[0]
                      : null,
                    latitude: restaurant
                      ? +restaurant?.location?.coordinates[1]
                      : null
                  }}
                >
                  <RestaurantMarker />
                </Marker>
              ) : (
                <Marker
                  coordinate={{
                    longitude: +pickupLocation?.coordinates[0],
                    latitude: +pickupLocation?.coordinates[1]
                  }}
                >
                  <RestaurantMarker />
                </Marker>
              )}
              <Marker
                coordinate={{
                  latitude: +deliveryAddress?.location?.coordinates[1],
                  longitude: +deliveryAddress?.location?.coordinates[0]
                }}
              >
                <CustomerMarker />
              </Marker>
              {/* <MapViewDirections
                origin={{
                  longitude: restaurant
                    ? +restaurant?.location?.coordinates[0]
                    : +pickupLocation?.coordinates[0],
                  latitude: restaurant
                    ? +restaurant?.location?.coordinates[1]
                    : +pickupLocation?.coordinates[1]
                }}
                destination={{
                  latitude: +deliveryAddress?.location?.coordinates[1],
                  longitude: +deliveryAddress?.location?.coordinates[0]
                }}
                apikey={GOOGLE_MAPS_KEY}
                strokeWidth={6}
                strokeColor={currentTheme.main}
                optimizeWaypoints={true}
                onReady={(result) => {
                  // result.distance} km
                  // Duration: ${result.duration} min.
                  if (result.coordinates) {
                    mapView?.current?.fitToCoordinates(result.coordinates, {
                      edgePadding: {
                        right: WIDTH / 20,
                        bottom: HEIGHT / 20,
                        left: WIDTH / 20,
                        top: HEIGHT / 20
                      }
                    })
                  }
                }}
                onError={(error) => {
                  console.log('onerror', error)
                }}
              /> */}
              {order.rider && <TrackingRider id={order.rider._id} />}
            </MapView>
          )}
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            ...alignment.Pmedium
          }}
        >
          <OrderStatusImage status={order.orderStatus} />
          {order.orderStatus !== ORDER_STATUS_ENUM.DELIVERED && (
            <View
              style={{
                ...alignment.MTxSmall,
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {![
                ORDER_STATUS_ENUM.PENDING,
                ORDER_STATUS_ENUM.CANCELLED
              ].includes(order.orderStatus) && (
                <>
                  <TextDefault
                    style={{ ...alignment.MTxSmall }}
                    textColor={currentTheme.gray500}
                    H5
                  >
                    {t('estimatedDeliveryTime')}
                  </TextDefault>
                  <TextDefault
                    style={{ ...alignment.MTxSmall }}
                    Regular
                    textColor={currentTheme.gray900}
                    H1
                    bolder
                  >
                    {remainingTime}-{remainingTime + 5} {t('mins')}
                  </TextDefault>
                  <ProgressBar
                    configuration={configuration}
                    currentTheme={currentTheme}
                    item={order}
                    navigation={navigation}
                  />
                </>
              )}
              <TextDefault
                H5
                style={{ ...alignment.Mmedium, textAlign: 'center' }}
                textColor={currentTheme.gray600}
                bold
              >
                {' '}
                {t(checkStatus(order.orderStatus).statusText)}
              </TextDefault>
            </View>
          )}
        </View>
        <Instructions
          title={'Instructions'}
          theme={currentTheme}
          message={order.instructions}
        />
        <Detail
          _id={order?._id}
          navigation={props.navigation}
          currencySymbol={configuration.currencySymbol}
          items={items}
          from={restaurant?.name}
          type={order?.type ? order.type : null}
          mandoobSpecialInstructions={
            order?.mandoobSpecialInstructions
              ? order.mandoobSpecialInstructions
              : null
          }
          orderNo={order.orderId}
          deliveryAddress={deliveryAddress}
          subTotal={subTotal}
          tip={tip}
          tax={tax}
          deliveryCharges={deliveryCharges}
          total={total}
          // originalPrice={originalPrice}
          // originalSubtotal={originalSubtotal}
          // originalDeliveryCharges={originalDeliveryCharges}
          theme={currentTheme}
          id={_id}
          rider={order.rider}
          orderStatus={order.orderStatus}
          restaurant={order?.restaurant ? order.restaurant : null}
          pickupAddress={order?.pickupAddress ? order.pickupAddress : null}
          pickupLabel={order?.pickupLabel ? order.pickupLabel : null}
          pickupLocation={
            order?.restaurant?._id
              ? order.restaurant.location
              : order?.pickupLocation
                ? order.pickupLocation
                : null
          }
        />
        <View style={styles().bottomContainer(currentTheme)}>
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

            {/* <View style={styles(currentTheme).horizontalLine2} /> */}
            <View style={{ marginBottom: 20 }}>
              {!order.isPickedUp && (
                <>
                  <View
                    style={{
                      ...styles().billsec,
                      flexDirection: isArabic ? 'row-reverse' : 'row',
                      justifyContent: 'space-between',
                      marginBottom: 10
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
                    <View
                      style={{
                        flexDirection: isArabic ? 'row-reverse' : 'row',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      {coupon?.rules?.applies_to.includes('delivery') ? (
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                          style={{ textDecorationLine: 'line-through' }}
                        >
                          {parseFloat(originalDeliveryCharges).toFixed(2)}
                          {isArabic
                            ? configuration.currencySymbol
                            : configuration.currency}
                        </TextDefault>
                      ) : null}
                      <TextDefault
                        numberOfLines={1}
                        textColor={currentTheme.fontFourthColor}
                        normal
                        bold
                      >
                        {deliveryCharges.toFixed(2)}{' '}
                        {configuration.currencySymbol}
                      </TextDefault>
                    </View>
                  </View>
                  <View style={styles(currentTheme).horizontalLine2} />
                </>
              )}

              <View
                style={{
                  ...styles().billsec,
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  justifyContent: 'space-between'
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
                  {taxCalculation()} {configuration.currencySymbol}
                </TextDefault>
              </View>
            </View>
            {/* <View style={styles(currentTheme).horizontalLine2} /> */}
          </View>
          <PriceRow
            isArabic={isArabic}
            theme={currentTheme}
            title={t('total')}
            currency={configuration.currencySymbol}
            price={total.toFixed(2)}
            originalPrice={originalPrice}
            coupon={coupon}
          />
          {order.orderStatus === ORDER_STATUS_ENUM.PENDING && (
            <View style={{ margin: scale(20) }}>
              <TouchableOpacity
                onPress={cancelModalToggle}
                style={styles().cancelButtonContainer(currentTheme)}
              >
                <TextDefault
                  style={{
                    ...alignment.Pmedium,
                    color: currentTheme.red600,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {t('cancelOrder')}
                </TextDefault>
              </TouchableOpacity>
              {/* <Button
                text={t('cancelOrder')}
                buttonProps={{ onPress: cancelModalToggle }}
                buttonStyles={{
                  ...styles().cancelButtonContainer(currentTheme)
                }}
                textProps={{ textColor: currentTheme.red600 }}
                textStyles={{
                  ...alignment.Pmedium,
                  textAlign: isArabic ? 'right' : 'left'
                }}
              /> */}
            </View>
          )}
        </View>
      </ScrollView>

      <CancelModal
        theme={currentTheme}
        modalVisible={cancelModalVisible}
        setModalVisible={cancelModalToggle}
        cancelOrder={cancelOrder}
        loading={loadingCancel}
        orderStatus={order.orderStatus}
      />
    </View>
  )
}

export const OrderStatusImage = ({ status }) => {
  let imagePath = null
  switch (status) {
    case ORDER_STATUS_ENUM.PENDING:
      imagePath = require('../../assets/SVG/order-placed.json')
      break
    case ORDER_STATUS_ENUM.ACCEPTED:
      imagePath = require('../../assets/SVG/order-tracking-preparing.json')
      break
    case ORDER_STATUS_ENUM.ASSIGNED:
      imagePath = require('../../assets/SVG/food-picked.json')
      break
    case ORDER_STATUS_ENUM.COMPLETED:
      imagePath = require('../../assets/SVG/place-order.json')
      break
    case ORDER_STATUS_ENUM.DELIVERED:
      imagePath = require('../../assets/SVG/place-order.json')
      break
  }

  if (!imagePath) return null

  return (
    <LottieView
      style={{
        width: 250,
        height: 250
      }}
      source={imagePath}
      autoPlay
      loop
    />
  )
}

export default OrderDetail
