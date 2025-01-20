import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { TextDefault } from '..'
import styles from './styles'
import { colors } from '../../utilities'
import { Configuration } from '../../ui/context'
import { useTranslation } from 'react-i18next'

export default function OrderDetails({ orderData }) {
  const { orderId, user, deliveryAddress } = orderData
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const directionStyle = { flexDirection: isRtl ? 'row-reverse' : 'row' }
  const textAlignStyle = isRtl ? { textAlign: 'right' } : {}

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.cardContainer}>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('orderNo')}.</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {orderId}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('email')}</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {user.email}
          </Text>
        </View>
        <View style={[styles.row, directionStyle]}>
          <Text style={[styles.heading, textAlignStyle]}>{t('contact')}</Text>
          <Text style={[styles.text, textAlignStyle]} selectable>
            {user.phone}
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
            {t('Delivery Details')}
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
    taxationAmount
  } = orderData
  console.log({ items })
  const configuration = useContext(Configuration.Context)
  const isRtl = i18n.language === 'ar'
  const directionStyle = { flexDirection: isRtl ? 'row-reverse' : 'row' }
  const textAlignStyle = isRtl ? { textAlign: 'right' } : {}

  let subTotal = orderAmount - deliveryCharges - tipping - taxationAmount

  const formatAmount = amount => {
    return isRtl
      ? `${amount}${configuration.currencySymbol}`
      : `${configuration.currencySymbol}${amount}`
  }

  return (
    <View style={[styles.cardContainer, { marginTop: 30, marginBottom: 45 }]}>
      {items
        ? items.map((item, index) => {
            return (
              <View
                style={
                  ([styles.itemRowBar, directionStyle],
                  { flexDirection: 'column' })
                }
                key={index}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10
                  }}>
                  <TextDefault
                    H5
                    textColor={colors.fontSecondColor}
                    bold>{`${item.quantity}x ${item.title}`}</TextDefault>
                  <TextDefault bold>
                    {formatAmount(item.variation.price)}
                  </TextDefault>
                </View>
                {item.addons?.length
                  ? item.addons.map((addon, index) => {
                      return (
                        <View>
                          <TextDefault H6>{addon.title}</TextDefault>
                          {addon?.options?.length
                            ? addon?.options?.map(option => {
                                return (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      marginInlineStart: 20
                                    }}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        gap: 5
                                      }}>
                                      <TextDefault>-</TextDefault>
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
                <View style={{ marginTop: 20 }}>
                  <TextDefault H6>Instructions</TextDefault>
                  <TextDefault style={{ marginInlineStart: 20 }}>
                    - {item.specialInstructions}
                  </TextDefault>
                </View>
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
        <TextDefault bold style={[styles.itemText, textAlignStyle]}>
          {formatAmount(subTotal.toFixed(2))}
        </TextDefault>
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
        <TextDefault bold style={[styles.itemText, textAlignStyle]}>
          {formatAmount(deliveryCharges)}
        </TextDefault>
      </View>

      <View style={[styles.itemRow, { marginTop: 30 }, directionStyle]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={[styles.itemHeading, textAlignStyle]}>
          {t('total')}
        </TextDefault>
        <TextDefault bold style={[styles.itemText, textAlignStyle]}>
          {formatAmount(orderAmount)}
        </TextDefault>
      </View>
    </View>
  )
}
