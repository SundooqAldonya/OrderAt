import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { Fragment, useContext } from 'react'
import {
  highestRatingRestaurant,
  nearestRestaurants,
  restaurantsWithOffers,
  // searchRestaurants,
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
import { Divider } from 'react-native-paper'

const MiddleRestaurantsSection = ({
  restaurantsWithOffersData,
  mostOrderedRestaurantsVar,
  // highestRatingRestaurantData,
  // nearestRestaurantsData,
  featuredRestaurants
}) => {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const ITEM_HEIGHT = 65 // fixed height of item component
  const getItemLayout = (data, index) => {
    return {
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index
    }
  }

  const renderItem = ({ item }) => {
    console.log({ isOpen: item.isOpen })
    return <NewRestaurantCard {...item} />
  }

  return (
    <View>
      <TouchableOpacity
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginHorizontal: 10
        }}
        onPress={() => {
          navigation.navigate('Menu', {
            highlight: true,
            title: 'businesses_with_offers'
          })
        }}
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
        <View
          style={{ ...styles(isArabic).image, borderRadius: 50, padding: 5 }}
        >
          <Text style={styles.sectionLink}>{t('see_all')} </Text>
          <AntDesign
            name={isArabic ? 'arrowleft' : 'arrowright'}
            size={moderateScale(20)}
            color='black'
          />
        </View>
      </TouchableOpacity>
      <FlatList
        getItemLayout={getItemLayout}
        data={
          isArabic
            ? restaurantsWithOffersData?.slice().reverse()
            : restaurantsWithOffersData
        }
        contentContainerStyle={{
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
        horizontal={true}
        // inverted={isArabic}
        // numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
      <Divider style={{ marginBottom: 5, marginTop: 12 }} />
      <TouchableOpacity
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginHorizontal: 10
        }}
        onPress={() => {
          navigation.navigate('Menu', {
            highlight: true,
            title: 'mostOrderedNow'
          })
          // navigation.navigate('MainRestaurantScreen', {
          //   restaurantData: mostOrderedRestaurantsVar,
          //   title: 'mostOrderedNow'
          // })
        }}
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
        <View
          style={{
            ...styles(isArabic).image,
            borderRadius: 50,
            padding: 5
          }}
        >
          <Text style={styles.sectionLink}>{t('see_all')} </Text>
          <AntDesign
            name={isArabic ? 'arrowleft' : 'arrowright'}
            size={moderateScale(20)}
            color='black'
          />
        </View>
      </TouchableOpacity>
      <FlatList
        // getItemLayout={getItemLayout}
        data={
          isArabic
            ? mostOrderedRestaurantsVar?.slice().reverse()
            : mostOrderedRestaurantsVar
        }
        contentContainerStyle={{
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
        horizontal={true}
        // inverted={isArabic}
        // numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
      <Divider style={{ marginBottom: 5, marginTop: 12 }} />
      {featuredRestaurants?.length ? (
        <Fragment>
          <TouchableOpacity
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              marginHorizontal: 10
            }}
            onPress={() => {
              navigation.navigate('Menu', {
                highlight: true,
                title: 'featured'
              })
              // navigation.navigate('MainRestaurantScreen', {
              //   restaurantData: nearestRestaurantsData,
              //   title: 'nearest_to_you'
              // })
            }}
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
              {t('featured')}
            </TextDefault>
            <View
              style={{
                ...styles(isArabic).image,
                borderRadius: 50,
                padding: 5
              }}
            >
              <Text style={styles.sectionLink}>{t('see_all')} </Text>
              <AntDesign
                name={isArabic ? 'arrowleft' : 'arrowright'}
                size={moderateScale(20)}
                color='black'
              />
            </View>
          </TouchableOpacity>
          <FlatList
            getItemLayout={getItemLayout}
            data={
              isArabic
                ? featuredRestaurants?.slice().reverse()
                : featuredRestaurants
            }
            contentContainerStyle={{
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
            horizontal={true}
            // inverted={isArabic}
            // numColumns={2}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
          <Divider style={{ marginBottom: 5, marginTop: 12 }} />
        </Fragment>
      ) : null}
    </View>
  )
}

export default MiddleRestaurantsSection
