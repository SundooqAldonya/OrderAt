import React, { useContext } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { TextDefault } from '..'
import styles from './styles'
import { colors } from '../../utilities'
import { Configuration } from '../../ui/context'
import { useTranslation } from 'react-i18next'
import { EvilIcons } from '@expo/vector-icons'
import { callNumber } from '../../utilities/callNumber'

export default function OrderDetails({ orderData }) {
  const { orderId, user, deliveryAddress } = orderData
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const directionStyle = { flexDirection: isRtl ? 'row-reverse' : 'row' }
  const textAlignStyle = isRtl ? { textAlign: 'right' } : {}
  const phone = orderData?.rider?.phone?.includes('+2')
    ? orderData?.rider?.phone?.replace('+2', '')
    : orderData?.rider?.phone
  return (
    <View style={{ flex: 1 }}>
      {orderData.rider ? (
        <View style={styles.cardContainer}>
          <Text style={[styles.heading, textAlignStyle]}>
            {t('rider_details')}
          </Text>
          <TextDefault
            style={[
              styles.text,
              textAlignStyle,
              {
                textAlign: isRtl ? 'right' : 'left',
                textTransform: 'capitalize'
              }
            ]}>
            {t('name')}: {orderData.rider.name ? orderData.rider.name : null}
          </TextDefault>
          <TouchableOpacity
            style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              alignItems: 'center'
            }}
            onPress={() => callNumber(orderData.rider.phone)}>
            <TextDefault
              style={[
                styles.text,
                textAlignStyle,
                {
                  textAlign: isRtl ? 'right' : 'left',
                  textTransform: 'capitalize',
                  alignItems: 'center'
                }
              ]}>
              {t('phone')}: {orderData.rider.phone ? phone : null}{' '}
            </TextDefault>
            <EvilIcons
              name="external-link"
              size={24}
              style={{
                marginTop: 10,
                marginInlineStart: !isRtl ? -100 : '',
                marginInlineEnd: isRtl ? -140 : ''
              }}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.cardContainer}>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('orderNo')}</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {orderId}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('fullname')}</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {user.name}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('contact')}</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {user?.phone?.replace('+2', '')}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('address')}</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {deliveryAddress?.deliveryAddress
              ? deliveryAddress?.deliveryAddress
              : null}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>
            {t('delivery_label')}
          </Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {deliveryAddress?.label ? deliveryAddress?.label : null}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>
            {t('delivery_details')}
          </Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {deliveryAddress?.details ? deliveryAddress?.details : null}
          </Text>
        </View>
      </View>
      <OrderItems orderData={orderData} />
    </View>
  )
}

function OrderItems({ orderData }) {
  const { t, i18n } = useTranslation()

  const {
    items,
    orderAmount,
    tipping,
    deliveryCharges,
    taxationAmount,
    originalDeliveryCharges,
    originalSubtotal,
    originalPrice
  } = orderData

  const configuration = useContext(Configuration.Context)
  const isRtl = i18n.language === 'ar'
  const directionStyle = { flexDirection: isRtl ? 'row-reverse' : 'row' }
  const textAlignStyle = isRtl ? { textAlign: 'right' } : {}

  let subTotal = Math.abs(
    orderAmount - deliveryCharges - tipping - taxationAmount
  )

  const formatAmount = amount => {
    return isRtl
      ? `${amount}${configuration.currencySymbol}`
      : `${configuration.currencySymbol}${amount}`
  }

  const isArabic = i18n.language === 'ar'

  return (
    <View style={[styles.cardContainer, { marginTop: 30, marginBottom: 45 }]}>
      {items
        ? items.map((item, index) => {
            return (
              <View
                style={
                  ([styles.itemRowBar, directionStyle],
                  {
                    flexDirection: 'column',
                    marginBottom: 20
                  })
                }
                key={index}>
                <View
                  style={{
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    justifyContent: 'space-between'
                  }}>
                  <TextDefault
                    H5
                    textColor={colors.fontSecondColor}
                    bold>{`${item.quantity} x ${item.title}`}</TextDefault>
                  <TextDefault bold>
                    {formatAmount(item.variation.price)}
                  </TextDefault>
                </View>
                {item.addons?.length
                  ? item.addons.map((addon, index) => {
                      return (
                        <View
                          key={index}
                          style={{
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            marginInlineEnd: 20
                          }}>
                          <TextDefault
                            H6
                            style={{
                              textAlign: isArabic ? 'right' : 'left',
                              fontSize: 20,
                              textWeight: 'bold'
                            }}>
                            {addon.title}
                          </TextDefault>
                          {addon?.options?.length
                            ? addon?.options?.map(option => {
                                return (
                                  <View
                                    key={option._id}
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      flexDirection: isArabic
                                        ? 'row-reverse'
                                        : 'row',
                                      marginInlineEnd: 30,
                                      gap: 10
                                    }}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        gap: 5
                                      }}>
                                      {/* <TextDefault>-</TextDefault> */}
                                      <TextDefault H6>
                                        {option.title}
                                      </TextDefault>
                                    </View>
                                    <TextDefault H6>
                                      {formatAmount(option.price)}
                                    </TextDefault>
                                  </View>
                                )
                              })
                            : null}
                        </View>
                      )
                    })
                  : null}
                {item.specialInstructions && item.specialInstructions.length ? (
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: 'column',
                      marginInlineEnd: 20
                    }}>
                    <TextDefault
                      H6
                      style={{ textAlign: isArabic ? 'right' : 'left' }}>
                      {t('instructions')}
                    </TextDefault>
                    <TextDefault
                      style={{
                        marginInlineEnd: 30,
                        textAlign: isArabic ? 'right' : 'left'
                      }}>
                      {item.specialInstructions}
                    </TextDefault>
                  </View>
                ) : null}
              </View>
            )
          })
        : null}
      <View style={[styles.itemRow, directionStyle]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={[styles.itemHeading, textAlignStyle]}>
          {t('subT')}
        </TextDefault>
        <View
          style={{ flexDirection: isArabic ? 'row' : 'row-reverse', gap: 10 }}>
          <TextDefault bold style={[styles.itemText, textAlignStyle]}>
            {formatAmount(subTotal.toFixed(2))}
          </TextDefault>
          {originalSubtotal > subTotal ? (
            <TextDefault
              bold
              style={[
                styles.itemText,
                textAlignStyle,
                { textDecorationLine: 'line-through' }
              ]}>
              {formatAmount(originalSubtotal.toFixed(2))}
            </TextDefault>
          ) : null}
        </View>
      </View>
      <View style={[styles.itemRow, directionStyle]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={[styles.itemHeading, textAlignStyle]}>
          {t('tip')}
        </TextDefault>
        <TextDefault bold style={[styles.itemText, textAlignStyle]}>
          {formatAmount(tipping)}
        </TextDefault>
      </View>
      <View style={[styles.itemRow, directionStyle]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={[styles.itemHeading, textAlignStyle]}>
          {t('taxCharges')}
        </TextDefault>
        <TextDefault bold style={[styles.itemText, textAlignStyle]}>
          {formatAmount(taxationAmount)}
        </TextDefault>
      </View>
      <View style={[styles.itemRow, directionStyle]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={[styles.itemHeading, textAlignStyle]}>
          {t('deliveryCharges')}
        </TextDefault>
        <View
          style={{ flexDirection: isArabic ? 'row' : 'row-reverse', gap: 10 }}>
          <TextDefault bold style={[styles.itemText, textAlignStyle]}>
            {formatAmount(deliveryCharges)}
          </TextDefault>
          {originalDeliveryCharges > deliveryCharges ? (
            <TextDefault
              bold
              style={[
                styles.itemText,
                textAlignStyle,
                { textDecorationLine: 'line-through' }
              ]}>
              {formatAmount(originalDeliveryCharges.toFixed(2))}
            </TextDefault>
          ) : null}
        </View>
      </View>

      <View style={[styles.itemRow, { marginTop: 30 }, directionStyle]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={[styles.itemHeading, textAlignStyle]}>
          {t('total')}
        </TextDefault>
        <View
          style={{ flexDirection: isArabic ? 'row' : 'row-reverse', gap: 10 }}>
          <TextDefault bold style={[styles.itemText, textAlignStyle]}>
            {formatAmount(orderAmount)}
          </TextDefault>
          {originalPrice > orderAmount ? (
            <TextDefault
              bold
              style={[
                styles.itemText,
                textAlignStyle,
                { textDecorationLine: 'line-through' }
              ]}>
              {formatAmount(originalPrice.toFixed(2))}
            </TextDefault>
          ) : null}
        </View>
      </View>
    </View>
  )
}
