import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useContext } from 'react'
import ConfigurationContext from '../../context/Configuration'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { DAYS } from '../../utils/enums'
import UserContext from '../../context/User'
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { moderateScale } from '../../utils/scaling'

const PickCards = ({ item, restaurantCustomer }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
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
      style={styles.itemContainer}
    >
      <Image
        source={
          item.image?.trim()
            ? { uri: item.image }
            : require('../../assets/food_placeholder.jpeg')
        }
        style={styles.foodImage}
      />
      {item.topRated && <Text style={styles.topRated}>Top rated</Text>}
      <Text style={[styles.foodTitle, {fontSize: moderateScale(12)}]}>{item.title}</Text>
      <Text style={[styles.foodPrice, {fontSize: moderateScale(12)}]}>
        {parseFloat(item.variations[0].price).toFixed(2)}{' '}
        {configuration.currency}
      </Text>
    </TouchableOpacity>
  )
}

export default PickCards

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: 8,
    alignItems: 'center'
  },
  foodImage: {
    width: moderateScale(150),
    height: moderateScale(100),
    borderRadius: 8
  },
  foodTitle: {
    fontWeight: '600',
    marginTop: 8
  },
  foodPrice: {
    color: '#555',
    marginTop: 4
  },
  topRated: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#ffa726',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12
  }
})
