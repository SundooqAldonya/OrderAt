import { View, TouchableOpacity, Alert, Modal } from 'react-native'
import React, { useState, useEffect, Fragment } from 'react'
import styles from './style'
import TextDefault from '../../Text/TextDefault/TextDefault'
import colors from '../../../utilities/colors'
import Spinner from '../../Spinner/Spinner'
import TextError from '../../Text/TextError/TextError'
import CountDown from 'react-native-countdown-component'
import useDetails from './useDetails'
import { useTranslation } from 'react-i18next'
import { callNumber } from '../../../utilities/callNumber'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { openGoogleMaps } from '../../../utilities/callMaps'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRef } from 'react'
import { StyleSheet } from 'react-native'
import { Image } from 'react-native'

const Details = ({ orderData, navigation, itemId, distance, duration }) => {
  const [captureCamera, setCaptureCamera] = useState(false)
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

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

  if (!order) return null

  const captureReceipt = () => {
    setCaptureCamera(false)
    navigation.navigate('CameraCaptureReceipt', {
      itemId: order._id
    })
  }

  const handlePickedPress = () => {
    setCaptureCamera(true)
  }

  const handlePickedSubmit = () => {
    setCaptureCamera(false)
    mutateOrderStatus({
      variables: { id: itemId, status: 'PICKED', file: null }
    })
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={captureCamera}
        onRequestClose={() => {
          setCaptureCamera(!captureCamera)
        }}>
        <View style={modalStyle.centeredView}>
          <View style={modalStyle.modalView}>
            {/* <TextDefault style={modalStyle.modalText}>
              {t('capture_receipt_title')}
            </TextDefault> */}
            <View
              style={{
                gap: 10
              }}>
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonClose]}
                onPress={() => captureReceipt()}>
                <TextDefault style={modalStyle.textStyle}>
                  {t('capture_receipt_title')}
                </TextDefault>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonCancel]}
                onPress={() => handlePickedSubmit()}>
                <TextDefault style={modalStyle.textStyle}>
                  {t('without_capture_receipt_title')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
                onPress={() => handlePickedPress()}
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
          {t('customer_name')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ ...styles.col2, textTransform: 'capitalize' }}>
          {order.user.name}
        </TextDefault>
      </View>
      <TouchableOpacity
        style={[
          styles.rowDisplay,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}
        onPress={() => callNumber(order.user.phone)}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
          {t('user_phone')}
        </TextDefault>
        <View
          style={{
            display: 'flex',
            flex: 2.5,
            flexDirection: isArabic ? 'row' : 'row-reverse',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ ...styles.col2, textTransform: 'capitalize' }}>
            {order.user.phone}
          </TextDefault>
          <EvilIcons
            size={24}
            name="external-link"
            style={{
              color: '#000',
              marginTop: -20
            }}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          openGoogleMaps({
            latitude: order?.restaurant?.location?.coordinates
              ? order?.restaurant?.location?.coordinates[1]
              : null,
            longitude: order?.restaurant?.location?.coordinates
              ? order?.restaurant?.location?.coordinates[0]
              : null
          })
        }>
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
            {order?.type && order.type === 'delivery_request'
              ? order?.user?.name
              : order?.restaurant?.name}
          </TextDefault>
        </View>
      </TouchableOpacity>
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
        style={{
          height: 1,
          backgroundColor: '#000',
          width: '100%'
        }}></View>
      <View
        style={[
          styles.rowDisplay,
          {
            flexDirection: isArabic ? 'row-reverse' : 'row',
            marginVertical: 20
          }
        ]}>
        <TextDefault
          textColor={colors.black}
          bold
          H5
          style={{
            ...styles.col1,
            textAlign: isArabic ? 'right' : 'left',
            fontSize: 20
          }}>
          {t('delivery_section')}
        </TextDefault>
      </View>
      <View
        style={[
          styles.rowDisplay,
          // { flexDirection: isArabic ? 'row-reverse' : 'row' }
          { flexDirection: 'column' }
        ]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{
            ...styles.col1,
            textAlign: isArabic ? 'right' : 'left',
            flex: 4
          }}>
          {t('delivery_label')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ ...styles.col2, textAlign: isArabic ? 'right' : 'left' }}>
          {order.deliveryAddress.label ? order.deliveryAddress.label : 'N/A'}
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
              latitude: order?.restaurant?.location?.coordinates
                ? order?.restaurant?.location?.coordinates[1]
                : null,
              longitude: order?.restaurant?.location?.coordinates
                ? order?.restaurant?.location?.coordinates[0]
                : null
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
      <View style={[styles.rowDisplay, { flexDirection: 'column' }]}>
        <TextDefault
          textColor={colors.fontSecondColor}
          bold
          H5
          style={{ ...styles.col1, textAlign: isArabic ? 'right' : 'left' }}>
          {t('delivery_details')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ ...styles.col2, textAlign: isArabic ? 'right' : 'left' }}>
          {`(${
            order.deliveryAddress.details
              ? order.deliveryAddress.details
              : 'N/A'
          })`}
        </TextDefault>
      </View>
      {order?.type && order?.type === 'delivery_request' ? (
        <Fragment>
          <View style={[styles.rowDisplay, { flexDirection: 'column' }]}>
            <TextDefault
              textColor={colors.fontSecondColor}
              bold
              H5
              style={{
                ...styles.col1,
                textAlign: isArabic ? 'right' : 'left'
              }}>
              {t('customer_notes')}
            </TextDefault>
            <TextDefault
              bolder
              H5
              textColor={colors.black}
              style={{
                ...styles.col2,
                textAlign: isArabic ? 'right' : 'left'
              }}>
              {order?.mandoobSpecialInstructions
                ? `${order?.mandoobSpecialInstructions}`
                : 'N/A'}
            </TextDefault>
          </View>
        </Fragment>
      ) : null}
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
  }, [subTotalZero, subTotal])

  if (loading) return <Spinner />
  if (error) return <TextError text={t('errorText')} />

  return (
    <View style={styles.orderDetails}>
      {order.items.map(item => {
        console.log({ itemVariationPrice: item.variation.price })
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
            ? `${subTotal ? Math.abs(subTotal) : Math.abs(subTotalZero)} ${
                dataConfig.configuration.currencySymbol
              }`
            : `${dataConfig.configuration.currencySymbol} ${
                subTotal ? Math.abs(subTotal) : Math.abs(subTotalZero)
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
          phoneNumber: order?.user?.phone,
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

const modalStyle = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: '#F194FF'
  },
  buttonClose: {
    backgroundColor: '#2196F3'
  },
  buttonCancel: {
    backgroundColor: 'red'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  }
})

export default Details
