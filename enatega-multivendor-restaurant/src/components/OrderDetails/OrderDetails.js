import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { TextDefault } from '..'
import styles from './styles'
import { colors } from '../../utilities'
import { Configuration } from '../../ui/context'
import { useTranslation } from 'react-i18next'

export default function OrderDetails({ orderData }) {
  const { orderId, user, deliveryAddress } = orderData
  const { t } = useTranslation()
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.cardContainer}>
        <View style={styles.row}>
          <Text style={styles.heading}>{t('orderNo')}.</Text>
          <Text style={styles.text} selectable>
            {orderId}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.heading}>{t('email')}</Text>
          <Text style={styles.text} selectable>
            {user.email}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.heading}>{t('contact')}</Text>
          <Text style={styles.text} selectable>
            {user.phone}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.heading}>{t('address')}</Text>
          <Text style={styles.text} selectable>
            {deliveryAddress.deliveryAddress}
          </Text>
        </View>
      </View>
      <OrderItems orderData={orderData} />
    </View>
  )
}

function OrderItems({ orderData }) {
  const { t } = useTranslation()
  console.log('order@@@@@@@@', orderData)
  const {
    items,
    orderAmount,
    tipping,
    deliveryCharges,
    taxationAmount
  } = orderData
  const configuration = useContext(Configuration.Context)
  let subTotal = orderAmount - deliveryCharges - tipping - taxationAmount
  return (
    <View style={[styles.cardContainer, { marginTop: 30, marginBottom: 45 }]}>
      {items &&
        items.map((item, index) => {
          console.log({ itemAddon: item })
          return (
            <View>
              <View style={styles.itemRowBar} key={index}>
                <TextDefault
                  H5
                  textColor={colors.fontSecondColor}
                  bold>{`${item.quantity}x ${item.title} ${item.variation.title}`}</TextDefault>
                <TextDefault
                  bold>{`${configuration.currencySymbol}${item.variation.price}`}</TextDefault>
              </View>
              {item.addons?.map((addon, index) => {
                console.log({ addon })
                return (
                  <View key={addon._id}>
                    <TextDefault H5 style={{ marginVertical: 10 }}>
                      {addon.title}
                    </TextDefault>
                    {addon?.options?.map(option => {
                      return (
                        <View
                          key={option._id}
                          style={{
                            flexDirection: 'row',
                            paddingInlineStart: 20,
                            justifyContent: 'space-between'
                          }}>
                          <TextDefault H6>{option.title}</TextDefault>
                          <TextDefault
                            H6>{`${configuration.currencySymbol}${option.price}`}</TextDefault>
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </View>
          )
        })}
      <View style={styles.itemRow}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={styles.itemHeading}>
          {t('subT')}
        </TextDefault>
        <TextDefault bold style={styles.itemText}>
          {`${configuration.currencySymbol}${subTotal.toFixed(2)}`}
        </TextDefault>
      </View>
      <View style={styles.itemRow}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={styles.itemHeading}>
          {t('tip')}
        </TextDefault>
        <TextDefault bold style={styles.itemText}>
          {`${configuration.currencySymbol}${tipping}`}
        </TextDefault>
      </View>
      <View style={styles.itemRow}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={styles.itemHeading}>
          {t('taxCharges')}
        </TextDefault>
        <TextDefault bold style={styles.itemText}>
          {`${configuration.currencySymbol}${taxationAmount}`}
        </TextDefault>
      </View>
      <View style={styles.itemRow}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={styles.itemHeading}>
          {t('deliveryCharges')}
        </TextDefault>
        <TextDefault bold style={styles.itemText}>
          {`${configuration.currencySymbol}${deliveryCharges}`}
        </TextDefault>
      </View>

      <View style={[styles.itemRow, { marginTop: 30 }]}>
        <TextDefault
          H6
          textColor={colors.fontSecondColor}
          bold
          style={styles.itemHeading}>
          {t('total')}
        </TextDefault>
        <TextDefault bold style={styles.itemText}>
          {`${configuration.currencySymbol}${orderAmount}`}
        </TextDefault>
      </View>
    </View>
  )
}
