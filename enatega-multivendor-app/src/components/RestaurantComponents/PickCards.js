import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { Fragment, useContext } from 'react'
import ConfigurationContext from '../../context/Configuration'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { DAYS } from '../../utils/enums'
import UserContext from '../../context/User'
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { moderateScale } from '../../utils/scaling'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { colors } from '../../utils/colors'
import { formatNumber } from '../../utils/formatNumber'
import { scale } from '../../utils/scaling'

const PickCards = ({ item, restaurantCustomer, cat }) => {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const configuration = useContext(ConfigurationContext)
  const {
    restaurant: restaurantCart,
    setCartRestaurant,
    cartCount,
    addCartItem,
    addQuantity,
    clearCart,
    checkItemCart
  } = useContext(UserContext)

  const scaleValue = useSharedValue(1)

  function animate() {
    scaleValue.value = withRepeat(withTiming(1.5, { duration: 250 }), 2, true)
  }

  const isOpen = () => {
    if (restaurantCustomer) {
      if (restaurantCustomer?.openingTimes?.length < 1) return false
      const date = new Date()
      const day = date.getDay()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const todaysTimings = restaurantCustomer?.openingTimes?.find(
        (o) => o.day === DAYS[day]
      )
      if (todaysTimings === undefined) return false
      const times = todaysTimings.times.filter(
        (t) =>
          hours >= Number(t.startTime[0]) &&
          minutes >= Number(t.startTime[1]) &&
          hours <= Number(t.endTime[0]) &&
          minutes <= Number(t.endTime[1])
      )

      return times?.length > 0
    } else {
      return false
    }
  }

  const addToCart = async (food, clearFlag) => {
    if (
      food?.variations?.length === 1 &&
      food?.variations[0].addons?.length === 0
    ) {
      await setCartRestaurant(food.restaurant)
      const result = checkItemCart(food._id)
      if (result.exist) await addQuantity(result.key)
      else await addCartItem(food._id, food.variations[0]._id, 1, [], clearFlag)
      animate()
    } else {
      if (clearFlag) await clearCart()
      navigation.navigate('ItemDetail', {
        food,
        addons: restaurantCustomer.addons,
        options: restaurantCustomer.options,
        restaurant: restaurantCustomer._id
      })
    }
  }

  const onPressItem = async (food) => {
    console.log('onPressItem', food)
    if (!restaurantCustomer) {
      Alert.alert(t('error'), t('restaurantNotFound'))
      return
    }
    if (!restaurantCustomer.isAvailable || !isOpen()) {
      Alert.alert(
        '',
        t('restaurantClosed'),
        [
          {
            text: t('backToRestaurants'),
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          },
          {
            text: t('seeMenu'),
            onPress: () => console.log('see menu')
          }
        ],
        { cancelable: false }
      )
      return
    }
    if (!restaurantCart || food.restaurant === restaurantCart) {
      await addToCart(food, food.restaurant !== restaurantCart)
    } else if (food.restaurant !== restaurantCart) {
      Alert.alert(
        '',
        t('clearCartText'),
        [
          {
            text: t('Cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: t('okText'),
            onPress: async () => {
              await addToCart(food, true)
            }
          }
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <TouchableOpacity
      onPress={() => {
        onPressItem({
          ...item,
          restaurant: restaurantCustomer?._id,
          restaurantName: restaurantCustomer?.name
        })
      }}
      style={[
        styles.card,
        cat._id === 'picks'
          ? styles.cardVertical
          : {
              ...styles.cardHorizontal,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }
      ]}
    >
      <View
        style={
          cat._id === 'picks'
            ? styles.cartTop
            : isArabic
              ? { ...styles.cartIconArabic }
              : { ...styles.cartIcon }
        }
      >
        <FontAwesome5 name='cart-plus' size={moderateScale(18)} color={colors.primary} />
      </View>
      <Image
        source={
          item.image?.trim()
            ? { uri: item.image }
            : require('../../assets/food_placeholder.jpeg')
        }
        style={cat === 'picks' ? styles.imageVertical : styles.imageHorizontal}
      />
      <View style={styles.cardContent}>
        <Text
          style={{ ...styles.foodName, textAlign: isArabic ? 'right' : 'left' }}
        >
          {item?.title}
        </Text>
        <View style={{ maxWidth: 200 }}>
          {item.description ? (
            <Text
              style={{
                ...styles.foodDescription,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {isArabic
                ? `...${item?.description?.substring(0, 60)}`
                : `${item?.description?.substring(0, 60)}...`}
            </Text>
          ) : (
            <Text style={styles.foodDescription}></Text>
          )}
        </View>
        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            gap: 5
          }}
        >
          {item?.variations[0]?.discounted > 0 && (
            <Fragment>
              {isArabic ? (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: moderateScale(12),
                    textDecorationLine: 'line-through',
                    textAlign: 'right'
                  }}
                >
                  {` ${formatNumber(parseFloat(item?.variations[0]?.price + item?.variations[0]?.discounted).toFixed(0))} ${configuration?.currencySymbol}`}
                </Text>
              ) : (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: moderateScale(12),
                    textDecorationLine: 'line-through',
                    textAlign: 'left'
                  }}
                >
                  {`${configuration?.currencySymbol} ${formatNumber(parseFloat(item?.variations[0]?.price + item?.variations[0]?.discounted).toFixed(0))}`}
                </Text>
              )}
            </Fragment>
          )}
          <View
            style={{
              ...styles.priceContainer
            }}
          >
            <Text style={{ ...styles.foodPrice }}>
              {isArabic ? configuration.currencySymbol : configuration.currency}
            </Text>
            <Text style={{ ...styles.foodPrice }}>
              {parseFloat(item.variations[0].price).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default PickCards

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    overflow: 'hidden'
  },
  cartTop: {
    position: 'absolute',
    top: 5,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10
  },
  cartIcon: {
    position: 'absolute',
    top: 25,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10
  },
  cartIconArabic: {
    position: 'absolute',
    top: 25,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10
  },
  cardVertical: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '48%' // so 2 fit side by side
  },
  cardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  imageVertical: {
    width: '100%',
    height: moderateScale(120)
  },
  imageHorizontal: {
    width: 100,
    height: 100,
    marginInlineStart: 12
  },
  cardContent: {
    padding: 8
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary
  },
  foodDescription: {
    fontSize: 14,
    color: '#555',
    flexWrap: 'wrap'
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 5
  },
  foodPrice: {
    fontSize: moderateScale(12)
  }
})
