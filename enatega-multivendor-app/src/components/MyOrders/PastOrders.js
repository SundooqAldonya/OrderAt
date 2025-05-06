import React, { Fragment, useContext, useState } from 'react'
import { View, TouchableOpacity, Image, FlatList } from 'react-native'
import { useSubscription } from '@apollo/client'
import gql from 'graphql-tag'
import { subscriptionOrder } from '../../apollo/subscriptions'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import TextDefault from '../Text/TextDefault/TextDefault'
import TextError from '../Text/TextError/TextError'
import { alignment } from '../../utils/alignment'
import styles from './styles'
import SearchFood from '../../assets/SVG/imageComponents/SearchFood'
import Spinner from '../../components/Spinner/Spinner'
import OrdersContext from '../../context/Orders'
import { useTranslation } from 'react-i18next'
import ConfigurationContext from '../../context/Configuration'
import StarIcon from '../../../src/assets/SVG/imageComponents/starIcon'
import { scale } from '../../utils/scaling'
import EmptyView from '../EmptyView/EmptyView'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { colors } from '../../utils/colors'
import OrderCard from './OrderCard'

function emptyViewPastOrders() {
  const orderStatusActive = ['PENDING', 'PICKED', 'ACCEPTED', 'ASSIGNED']
  const orderStatusInactive = ['DELIVERED', 'COMPLETED']
  const { orders, loadingOrders, errorOrders } = useContext(OrdersContext)
  if (loadingOrders)
    return (
      <Spinner
        visible={loadingOrders}
        backColor='transparent'
        spinnerColor={currentTheme.main}
      />
    )
  if (errorOrders) return <TextError text={errorOrders.message} />
  else {
    const hasActiveOrders =
      orders.filter((o) => orderStatusActive.includes(o.orderStatus)).length > 0

    const hasPastOrders =
      orders.filter((o) => orderStatusInactive.includes(o.orderStatus)).length >
      0
    if (hasActiveOrders || hasPastOrders) return null
    return (
      <EmptyView
        title={'titleEmptyPastOrders'}
        description={'emptyPastOrdersDesc'}
        buttonText={'emptyPastOrdersBtn'}
      />
    )
  }
}

const PastOrders = ({
  navigation,
  loading,
  error,
  pastOrders,
  onPressReview
}) => {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const { reFetchOrders, fetchMoreOrdersFunc, networkStatusOrders } =
    useContext(OrdersContext)

  const renderItem = ({ item }) => {
    return (
      <Fragment>
        <OrderCard item={item} />
        {/* <Item
        item={item}
        navigation={navigation}
        currentTheme={currentTheme}
        configuration={configuration}
        onPressReview={onPressReview}
      /> */}
      </Fragment>
    )
  }

  if (loading) {
    return <></>
  }
  if (error) return <TextError text={error.message} />

  return (
    <FlatList
      data={pastOrders}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      ListEmptyComponent={emptyViewPastOrders()}
      refreshing={networkStatusOrders === 4}
      onRefresh={() => networkStatusOrders === 7 && reFetchOrders()}
      onEndReached={fetchMoreOrdersFunc}
    />
  )
}

const formatDeliveredAt = (deliveredAt) => {
  // Convert deliveredAt string to a Date object
  const deliveryDate = new Date(deliveredAt)

  // Define months array for formatting
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  // Getting components of the date
  const day = deliveryDate.getDate()
  const month = months[deliveryDate.getMonth()]
  const hours = deliveryDate.getHours()
  const minutes = deliveryDate.getMinutes()

  // Padding single digits with 0
  const formattedDay = day < 10 ? '0' + day : day
  const formattedHours = hours < 10 ? '0' + hours : hours
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes

  // Formatting the date and time
  return `${formattedDay} ${month} ${formattedHours}:${formattedMinutes}`
}
const getItems = (items) => {
  return items
    .map(
      (item) =>
        `${item.quantity}x ${item.title}${
          item.variation.title ? `(${item.variation.title})` : ''
        }`
    )
    .join('\n')
}

const Item = ({
  item,
  navigation,
  currentTheme,
  configuration,
  onPressReview
}) => {
  useSubscription(
    gql`
      ${subscriptionOrder}
    `,
    {
      variables: { id: item._id },
      skip: item.orderStatus === ORDER_STATUS_ENUM.DELIVERED
    }
  )
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'

  return (
    <View style={{ ...alignment.MBsmall }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('OrderDetail', {
            _id: item._id,
            currencySymbol: configuration.currencySymbol,
            restaurant: item.restaurant,
            user: item.user
          })
        }
      >
        <View style={styles(currentTheme).subContainer}>
          <View>
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                justifyContent: 'space-between'
              }}
            >
              {/* image */}
              <View>
                <Image
                  style={styles(currentTheme).restaurantImage}
                  resizeMode='cover'
                  source={{ uri: item.restaurant.image }}
                />
              </View>
              {/* restaurant name */}
              <View>
                <TextDefault
                  textColor={currentTheme.fontMainColor}
                  uppercase
                  bolder
                  numberOfLines={2}
                  style={{
                    ...styles(currentTheme).restaurantName,
                    textAlign: isArabic ? 'right' : 'left',
                    marginInlineStart: !isArabic ? 10 : 0
                  }}
                >
                  {item.restaurant.name}
                </TextDefault>
              </View>
              {/* order total */}
              <View>
                {!isArabic ? (
                  <TextDefault textColor={currentTheme.fontMainColor} bolder>
                    {configuration.currencySymbol}
                    {parseFloat(item.orderAmount).toFixed(2)}
                  </TextDefault>
                ) : (
                  <TextDefault textColor={currentTheme.fontMainColor} bolder>
                    {parseFloat(item.orderAmount).toFixed(2)}
                    {configuration.currencySymbol}
                  </TextDefault>
                )}
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              <TextDefault
                numberOfLines={1}
                textColor={colors.dark}
                style={{
                  textAlign: isArabic ? 'right' : 'left',
                  marginInlineEnd: isArabic ? 10 : 0,
                  marginInlineStart: !isArabic ? 10 : 0
                }}
              >
                {t('deliveredOn')} {formatDeliveredAt(item.deliveredAt)}
              </TextDefault>
              {item.items?.length ? (
                <TextDefault
                  numberOfLines={1}
                  style={{
                    ...alignment.MTxSmall,
                    textAlign: isArabic ? 'right' : 'left',
                    marginInlineEnd: isArabic ? 10 : 0,
                    marginInlineStart: !isArabic ? 10 : 0
                  }}
                  textColor={'#fff'}
                >
                  {getItems(item.items)}
                </TextDefault>
              ) : null}
            </View>
            {/* <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}>
              <View>
                <Image
                  style={styles(currentTheme).restaurantImage}
                  resizeMode='cover'
                  source={{ uri: item.restaurant.image }}
                />
              </View>
              <View>
                <View
                  style={{
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    paddingInlineEnd: !isArabic ? 50 : 0
                  }}
                >
                  <View>
                    <TextDefault
                      textColor={currentTheme.fontMainColor}
                      uppercase
                      bolder
                      numberOfLines={2}
                      style={{
                        ...styles(currentTheme).restaurantName,
                        textAlign: isArabic ? 'right' : 'left',
                        marginInlineStart: !isArabic ? 10 : 0
                      }}
                    >
                      {item.restaurant.name}
                    </TextDefault>
                  </View>
                  <View style={styles(currentTheme).subContainerRight}>
                    <TextDefault textColor={currentTheme.fontMainColor} bolder>
                      {configuration.currencySymbol}
                      {parseFloat(item.orderAmount).toFixed(2)}
                    </TextDefault>
                  </View>
                </View>
                <View style={{ marginTop: 'auto' }}>
                  <TextDefault
                    numberOfLines={1}
                    textColor={currentTheme.secondaryText}
                    style={{
                      textAlign: isArabic ? 'right' : 'left',
                      marginInlineEnd: isArabic ? 10 : 0,
                      marginInlineStart: !isArabic ? 10 : 0
                    }}
                  >
                    {t('deliveredOn')} {formatDeliveredAt(item.deliveredAt)}
                  </TextDefault>
                  <TextDefault
                    numberOfLines={1}
                    style={{
                      ...alignment.MTxSmall,
                      textAlign: isArabic ? 'right' : 'left',
                      marginInlineEnd: isArabic ? 10 : 0,
                      marginInlineStart: !isArabic ? 10 : 0
                    }}
                    textColor={currentTheme.secondaryText}
                  >
                    {getItems(item.items)}
                  </TextDefault>
                </View>
              </View>
            </View> */}
          </View>

          <View style={styles().rateOrderContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles(currentTheme).subContainerButton}
              onPress={() => navigation.navigate('Reorder', { item })}
            >
              <TextDefault textColor={currentTheme.black} H4 bolder B700 center>
                {' '}
                {t('reOrder')}
              </TextDefault>
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...styles(currentTheme).starsContainer,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <View>
              <TextDefault H5 bolder textColor={currentTheme.newFontcolor}>
                {t('tapToRate')}
              </TextDefault>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((index) => (
                <StarIcon
                  disabled={Boolean(item?.review)}
                  key={`star-icon-${index}`}
                  isFilled={index <= item?.review?.rating}
                  onPress={() => onPressReview(item, index)}
                />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default PastOrders
