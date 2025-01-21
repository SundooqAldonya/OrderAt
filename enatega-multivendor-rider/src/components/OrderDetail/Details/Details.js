import { View, TouchableOpacity, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import styles from './style'
import TextDefault from '../../Text/TextDefault/TextDefault'
import colors from '../../../utilities/colors'
import Spinner from '../../Spinner/Spinner'
import TextError from '../../Text/TextError/TextError'
import CountDown from 'react-native-countdown-component'
import useDetails from './useDetails'
import { useTranslation } from 'react-i18next'
import useOrderDetail from '../../../screens/OrderDetail/useOrderDetail'

const Details = ({ orderData, navigation, itemId, distance, duration }) => {
  const {
    active,
    order,
    dataConfig,
    loadingConfig,
    errorConfig,
    preparationSeconds,
    currentSeconds,
    mutateAssignOrder,
    mutateOrderStatus,
    loadingAssignOrder,
    loadingOrderStatus
  } = useDetails(orderData)
  const { t } = useTranslation()

  if (!order) return null

  return (
    <View style={styles.container}>
      {order.orderStatus !== 'DELIVERED' ? (
        <>
          <View>
            <TextDefault H3 bolder center textColor={colors.black}>
              {t('preparing')}
            </TextDefault>
          </View>
          <View style={styles.horizontalLine} />
          <View style={styles.timeContainer}>
            <TextDefault center bold H5 textColor={colors.fontSecondColor}>
              {t('timeLeftForMeal')}
            </TextDefault>
            <CountDown
              until={preparationSeconds - currentSeconds}
              size={20}
              timeToShow={['H', 'M', 'S']}
              timeLabels={{ h: null, m: null, s: null }}
              digitStyle={{ backgroundColor: colors.white, width: 50 }}
              digitTxtStyle={{ color: colors.black, fontSize: 30 }}
              showSeparator={true}
            />
          </View>
          {distance !== null ? (
            <View style={styles.timeContainer}>
              <TextDefault center bold H5 textColor={colors.fontSecondColor}>
                {t('distanceToDestination')}
              </TextDefault>
              <TextDefault center bolder H2>
                {`${distance.toFixed(2)} km`}
              </TextDefault>
            </View>
          ) : null}
          {duration !== null ? (
            <View style={styles.timeContainer}>
              <TextDefault center bold H5 textColor={colors.fontSecondColor}>
                {t('durationToDestination')}
              </TextDefault>
              <TextDefault center bolder H2>
                {`${duration.toFixed(0)} mins`}
              </TextDefault>
            </View>
          ) : null}
          {active === 'NewOrders' ? (
            <View style={styles.btnContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  mutateAssignOrder({ variables: { id: itemId } })
                }}
                style={[styles.btn, { backgroundColor: colors.black }]}>
                <TextDefault center H5 bold textColor={colors.white}>
                  {loadingAssignOrder ? (
                    <Spinner size="small" />
                  ) : (
                    t('assignMe')
                  )}
                </TextDefault>
              </TouchableOpacity>
            </View>
          ) : order.orderStatus === 'ASSIGNED' ? (
            <View style={styles.btnContainer}>
              <ChatWithCustomerButton navigation={navigation} order={order} />
              <TouchableOpacity
                onPress={() => {
                  mutateOrderStatus({
                    variables: { id: itemId, status: 'PICKED' }
                  })
                }}
                activeOpacity={0.8}
                style={[styles.btn, { backgroundColor: colors.black }]}>
                <TextDefault center bold H5 textColor={colors.white}>
                  {loadingOrderStatus ? <Spinner size="small" /> : t('pick')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          ) : order.orderStatus === 'PICKED' ? (
            <View style={styles.btnContainer}>
              <ChatWithCustomerButton navigation={navigation} order={order} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  mutateOrderStatus({
                    variables: { id: itemId, status: 'DELIVERED' }
                  })
                }}
                style={[styles.btn, { backgroundColor: colors.primary }]}>
                <TextDefault center H5 bold textColor={colors.black}>
                  {loadingOrderStatus ? (
                    <Spinner size="small" color="transparent" />
                  ) : (
                    t('markAsDelivered')
                  )}
                </TextDefault>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      ) : null}

      <View style={styles.heading}>
        <TextDefault bolder H1 center textColor={colors.primary}>
          {t('OrderDetail')}
        </TextDefault>
      </View>
      <OrderDetails order={order} />
      <ItemDetails
        order={order}
        dataConfig={dataConfig}
        loading={loadingConfig}
        error={errorConfig}
      />
    </View>
  )
}

const OrderDetails = ({ order }) => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const openGoogleMaps = ({ latitude, longitude }) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url)
        } else {
          Alert.alert('Error', 'Unable to open Google Maps')
        }
      })
      .catch(err => console.error('An error occurred', err))
  }

  return (
    <View style={styles.orderDetails}>
      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
          {t('username')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ ...styles.col2, textTransform: 'capitalize' }}>
          {order.user.name}
        </TextDefault>
      </View>
      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
          {t('user_phone')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ ...styles.col2, textTransform: 'capitalize' }}>
          {order.user.phone}
        </TextDefault>
      </View>
      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
          {t('yourOrderFrom')}
        </TextDefault>
        <TextDefault bolder H5 textColor={colors.black} style={styles.col2}>
          {order.restaurant.name}
        </TextDefault>
      </View>
      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
          {t('orderNo')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={[styles.col2, isArabic ? { paddingLeft: 80 } : null]}>
          {order.orderId}
        </TextDefault>
      </View>
      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TouchableOpacity
          onPress={() =>
            openGoogleMaps({
              latitude: order.deliveryAddress.location.coordinates[1],
              longitude: order.deliveryAddress.location.coordinates[0]
            })
          }>
          <TextDefault
            textColor={colors.fontSecondColor}
            bold
            H5
            style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
            {t('deliveryAddress')}
          </TextDefault>
          <TextDefault bolder H5 textColor={colors.black} style={styles.col2}>
            {order.deliveryAddress.deliveryAddress}
          </TextDefault>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const ItemDetails = ({ order, dataConfig, loading, error }) => {
  let subTotal = 0
  const [subTotalZero, setSubTotalZero] = useState(0)
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  useEffect(() => {
    if (!subTotal) {
      setSubTotalZero(
        order.orderAmount - order.deliveryCharges - order.taxationAmount
      )
    }
  }, [subTotal, subTotalZero])

  if (loading) return <Spinner />
  if (error) return <TextError text={t('errorText')} />

  return (
    <View style={styles.orderDetails}>
      {order.items.map(item => {
        subTotal = subTotal + item.variation.price
        return (
          <View
            key={item._id}
            style={[
              styles.rowDisplay,
              { flexDirection: isArabic ? 'row-reverse' : 'row' }
            ]}>
            <TextDefault bolder H4 style={styles.coll1}>
              {isArabic ? `X${item.quantity}` : `${item.quantity}X`}
            </TextDefault>
            <View style={styles.coll2}>
              <TextDefault textColor={colors.fontSecondColor} bold H5>
                {item.title}
              </TextDefault>
              {item.addons.length
                ? item.addons.map(addon => (
                    <View key={addon._id} style={{ marginTop: 15 }}>
                      <TextDefault
                        textColor={colors.fontSecondColor}
                        bold
                        style={{ fontWeight: 'bold' }}>
                        {addon.title}
                      </TextDefault>
                      {addon.options.length
                        ? addon.options.map(option => {
                            subTotal += option.price
                            return (
                              <View
                                key={option._id}
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-around',
                                  marginInlineStart: 25
                                }}>
                                <TextDefault
                                  textColor={colors.fontSecondColor}
                                  bold>
                                  {option.title}
                                </TextDefault>
                                <TextDefault
                                  key={addon._id}
                                  textColor={colors.fontSecondColor}
                                  bold>
                                  {option.price}
                                </TextDefault>
                              </View>
                            )
                          })
                        : null}
                    </View>
                  ))
                : null}
            </View>
            <TextDefault
              bolder
              H5
              textColor={colors.black}
              style={styles.coll3}>
              {isArabic
                ? `${item.variation.price} ${dataConfig.configuration.currencySymbol}`
                : `${dataConfig.configuration.currencySymbol} ${item.variation.price}`}
            </TextDefault>
          </View>
        )
      })}

      <View style={styles.horizontalLine2} />

      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={[styles.coll2, { flex: 9 }]}>
          {t('subTotal')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={[styles.coll3, { flex: 3 }]}>
          {isArabic
            ? `${subTotal} ${dataConfig.configuration.currencySymbol}`
            : `${dataConfig.configuration.currencySymbol} ${
                subTotal ? subTotal : subTotalZero
              }`}
        </TextDefault>
      </View>

      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={[styles.coll2, { flex: 9 }]}>
          {t('tip')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={[styles.coll3, { flex: 3 }]}>
          {isArabic
            ? `${order.tipping} ${dataConfig.configuration.currencySymbol}`
            : `${dataConfig.configuration.currencySymbol} ${order.tipping}`}
        </TextDefault>
      </View>

      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={[styles.coll2, { flex: 9 }]}>
          {t('taxCharges')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={[styles.coll3, { flex: 3 }]}>
          {isArabic
            ? `${order.taxationAmount} ${dataConfig.configuration.currencySymbol}`
            : `${dataConfig.configuration.currencySymbol} ${order.taxationAmount}`}
        </TextDefault>
      </View>

      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={[styles.coll2, { flex: 9 }]}>
          {t('delvieryCharges')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={[styles.coll3, { flex: 3 }]}>
          {isArabic
            ? `${order.deliveryCharges} ${dataConfig.configuration.currencySymbol}`
            : `${dataConfig.configuration.currencySymbol} ${order.deliveryCharges}`}
        </TextDefault>
      </View>

      <View style={styles.horizontalLine2} />

      <View
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={[styles.coll2, { flex: 9 }]}>
          {t('total')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={[styles.coll3, { flex: 3 }]}>
          {isArabic
            ? `${order.orderAmount} ${dataConfig.configuration.currencySymbol}`
            : `${dataConfig.configuration.currencySymbol} ${order.orderAmount}`}
          {console.log({ orderAmount: order.orderAmount })}
        </TextDefault>
      </View>
    </View>
  )
}

const ChatWithCustomerButton = ({ navigation, order }) => {
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ChatWithCustomer', {
          phoneNumber: order?.user.phone,
          id: order?._id
        })
      }
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: colors.black }]}>
      <TextDefault center H5 bold textColor={colors.white}>
        {t('chatWithCustomer')}
      </TextDefault>
    </TouchableOpacity>
  )
}
export default Details
