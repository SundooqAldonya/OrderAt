import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import {
  highestRatingRestaurant,
  nearestRestaurants,
  restaurantsWithOffers,
  searchRestaurants,
  topRatedVendorsInfo
} from '../../../apollo/queries'
import { useQuery } from '@apollo/client'
import { LocationContext } from '../../../context/Location'
import useHomeRestaurants from '../../../ui/hooks/useRestaurantOrderInfo'
import { FlatList } from 'react-native-gesture-handler'
import NewRestaurantCard from '../RestaurantCard/NewRestaurantCard'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { useNavigation } from '@react-navigation/native'
import { moderateScale } from '../../../utils/scaling'
import { useTranslation } from 'react-i18next'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import styles from './styles'
import { AntDesign } from '@expo/vector-icons'

const MiddleRestaurantsSection = () => {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { location, setLocation } = useContext(LocationContext)
  const { orderLoading, orderError, orderData } = useHomeRestaurants()

  const {
    data: dataWithOffers,
    loading: loadingWithOffers,
    error: errorWithOffers
  } = useQuery(restaurantsWithOffers, {
    variables: {
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'no-cache'
  })

  const {
    data: dataHighRating,
    loading: loadingHighRating,
    error: errorHighRating
  } = useQuery(highestRatingRestaurant, {
    variables: {
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'no-cache'
  })

  const {
    data: dataNearestRestaurants,
    loading: loadingNearestRestaurants,
    error: errorNearestRestaurants
  } = useQuery(nearestRestaurants, {
    variables: {
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'no-cache'
  })

  const restaurantsWithOffersData = dataWithOffers?.restaurantsWithOffers || []

  const mostOrderedRestaurantsVar = orderData?.mostOrderedRestaurants || null
  const highestRatingRestaurantData =
    dataHighRating?.highestRatingRestaurant || null
  const nearestRestaurantsData =
    dataNearestRestaurants?.nearestRestaurants || null
  return (
    <View>
      <TouchableOpacity
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10
        }}
        onPress={() =>
          navigation.navigate('MainRestaurantScreen', {
            restaurantData: props?.orders,
            title: props.title
          })
        }
      >
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontFourthColor}
          bolder
          H4
          style={{
            ...styles().ItemTitle,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('businesses_with_offers')}
        </TextDefault>
        <View style={{ ...styles().image, borderRadius: 50, padding: 5 }}>
          <AntDesign
            name={isArabic ? 'arrowleft' : 'arrowright'}
            size={moderateScale(20)}
            color='black'
          />
        </View>
      </TouchableOpacity>
      <FlatList
        data={restaurantsWithOffersData}
        horizontal={false}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NewRestaurantCard {...item} />}
      />
      <TouchableOpacity
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10
        }}
        onPress={() =>
          navigation.navigate('MainRestaurantScreen', {
            restaurantData: props?.orders,
            title: props.title
          })
        }
      >
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontFourthColor}
          bolder
          H4
          style={{
            ...styles().ItemTitle,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('mostOrderedNow')}
        </TextDefault>
        <View style={{ ...styles().image, borderRadius: 50, padding: 5 }}>
          <AntDesign
            name={isArabic ? 'arrowleft' : 'arrowright'}
            size={moderateScale(20)}
            color='black'
          />
        </View>
      </TouchableOpacity>
      <FlatList
        data={mostOrderedRestaurantsVar}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NewRestaurantCard {...item} />}
      />

      <TouchableOpacity
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10
        }}
        onPress={() =>
          navigation.navigate('MainRestaurantScreen', {
            restaurantData: props?.orders,
            title: props.title
          })
        }
      >
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontFourthColor}
          bolder
          H4
          style={{
            ...styles().ItemTitle,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('nearest_to_you')}
        </TextDefault>
        <View style={{ ...styles().image, borderRadius: 50, padding: 5 }}>
          <AntDesign
            name={isArabic ? 'arrowleft' : 'arrowright'}
            size={moderateScale(20)}
            color='black'
          />
        </View>
      </TouchableOpacity>
      <FlatList
        data={nearestRestaurantsData}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NewRestaurantCard {...item} />}
      />
    </View>
  )
}

export default MiddleRestaurantsSection
