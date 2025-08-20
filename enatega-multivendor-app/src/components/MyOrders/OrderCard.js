import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import TextDefault from '../Text/TextDefault/TextDefault'
import { colors } from '../../utils/colors'
import { t } from 'i18next'
import ConfigurationContext from '../../context/Configuration'
import { useTranslation } from 'react-i18next'
import Status from './Status'
import { useNavigation } from '@react-navigation/native'
import deliveryImage from '../../assets/delivery_green.png'
import { moderateScale } from '../../utils/scaling'

const OrderCard = ({ item, activeOrders }) => {
  const { _id, restaurant, items, type, orderStatus } = item
  const navigation = useNavigation()
  const configuration = useContext(ConfigurationContext)
  const { currencySymbol, currency } = configuration
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const STATUS_ORDER = [
    t('PENDING'),
    t('ACCEPTED'),
    t('ASSIGNED'),
    t('PICKED'),
    t('DELIVERED'),
    t('COMPLETED')
  ]

  console.log({ orderStatus })
  console.log({ orderStatus: STATUS_ORDER.indexOf(t(orderStatus)) })

  return (
    <TouchableOpacity
      style={{
        ...styles.container,
        backgroundColor: activeOrders ? '#8BC34A' : '#fff'
      }}
      onPress={() => {
        navigation.navigate('OrderDetail', {
          _id
        })
      }}
    >
      <View
        style={{
          ...styles.wrapper,
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
      >
        {/* left */}
        <View style={styles.left}>
          {/* restaurant name */}
          <View>
            <TextDefault
              bolder
              style={{ ...styles.text, textAlign: isArabic ? 'right' : 'left' }}
            >
              {restaurant?._id ? restaurant.name : t('mandoob')}
            </TextDefault>
          </View>
          {/* items count and total price */}
          <View>
            <TextDefault
              style={{ ...styles.text, textAlign: isArabic ? 'right' : 'left' }}
            >
              {items?.length} items | {parseFloat(item.orderAmount).toFixed(2)}{' '}
              {isArabic ? currencySymbol : currency}
            </TextDefault>
          </View>
          {/* status text */}
          <View style={{ width: moderateScale(200) }}>
            <TextDefault
              style={{
                ...styles.text,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {orderStatus === 'PENDING'
                ? t('orderPending')
                : orderStatus === 'ASSIGNED' || orderStatus === 'ACCEPTED'
                  ? t('restaurantDeliver')
                  : orderStatus === 'PICKED'
                    ? t('riderDeliver')
                    : null}
            </TextDefault>
          </View>
          {/* statuses */}
          <View
            style={{
              ...styles.statusContainer,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <Status
              firstCol='#3C8F7C'
              isEta={false}
              first={true}
              last={false}
              isActive={true}
            />
            <Status
              firstCol='#3C8F7C'
              isEta={STATUS_ORDER.indexOf(t(orderStatus)) < 1}
              first={false}
              last={false}
              isActive={true}
            />
            <Status
              firstCol='#3C8F7C'
              isEta={STATUS_ORDER.indexOf(t(orderStatus)) < 2}
              first={false}
              last={false}
              isActive={true}
            />
            <Status
              firstCol='#3C8F7C'
              isEta={STATUS_ORDER.indexOf(t(orderStatus)) < 3}
              first={false}
              last={false}
              isActive={true}
            />
            <Status
              firstCol='#3C8F7C'
              isEta={STATUS_ORDER.indexOf(t(orderStatus)) < 4}
              first={false}
              last={false}
              isActive={true}
            />
          </View>
        </View>
        {/* right - restaurant image */}
        <View style={styles.right}>
          <View
            style={{
              ...styles.imageContainer,
              paddingRight: isArabic ? 10 : 0,
              backgroundColor: 'black'
            }}
          >
            {restaurant?._id && restaurant?.image ? (
              <Image
                source={{
                  uri: restaurant?.image
                }}
                // resizeMode='cover'
                style={styles.image}
              />
            ) : (
              <Image
                source={require('../../assets/delivery_green.png')}
                // resizeMode='cover'
                style={styles.image}
              />
            )}
            {/* {type && type === 'delivery_request' ? (
             
            ) : null} */}
          </View>
        </View>
      </View>
      {/* horizontal line and status container */}
      <View>
        {/* horizontal line */}
        <View style={styles.horizontalLine} />
        {/* status container */}
        <View
          style={{
            ...styles.statusBtn,
            backgroundColor: activeOrders ? '#fff' : '#8BC34A'
          }}
        >
          <TextDefault bolder style={styles.text}>
            {t(orderStatus)}
          </TextDefault>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default OrderCard

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 10,
    backgroundColor: '#8BC34A',
    borderRadius: 8,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 4
  },
  left: {
    gap: 10
  },
  status: {
    backgroundColor: '#3C8F7C'
  },
  horizontalLine: {
    height: 1,
    width: '100%',
    backgroundColor: 'green',
    marginHorizontal: 'auto',
    marginVertical: 10
  },
  wrapper: {
    justifyContent: 'space-between'
    // flexDirection: 'row'
  },
  imageContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: 5,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  text: {
    color: '#000'
  },
  statusContainer: {
    flexDirection: 'row'
  },
  statusBtn: {
    backgroundColor: '#fff',
    width: moderateScale(100),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginHorizontal: 'auto'
  }
})
