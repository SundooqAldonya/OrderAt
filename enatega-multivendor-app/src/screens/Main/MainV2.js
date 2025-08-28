import React, { useContext, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  StatusBar
} from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons' // for icons
import { useNavigation } from '@react-navigation/native'
import MainLoadingUI from '../../components/Main/LoadingUI/MainLoadingUI'
import {
  getBusinessCategoriesCustomer,
  highestRatingRestaurant,
  nearestRestaurants,
  restaurantListPreview,
  restaurantsWithOffers
} from '../../apollo/queries'
import useHomeRestaurants from '../../ui/hooks/useRestaurantOrderInfo'
import { gql, useQuery } from '@apollo/client'
import { LocationContext } from '../../context/Location'
import MainRestaurantCard from '../../components/Main/MainRestaurantCard/MainRestaurantCard'
import BusinessCategories from '../../components/BusinessCategories'
import UserContext from '../../context/User'
import { useTranslation } from 'react-i18next'
import { moderateScale } from '../../utils/scaling'

const RESTAURANTS = gql`
  ${restaurantListPreview}
`

const categories = [
  { id: '1', title: 'All', icon: '🔥' },
  { id: '2', title: 'Hot Dog', icon: '🌭' },
  { id: '3', title: 'Burger', icon: '🍔' },
  { id: '4', title: 'Pizza', icon: '🍕' }
]

const restaurants = [
  {
    id: '1',
    name: 'Rose Garden Restaurant',
    tags: 'Burger • Chicken • Wings',
    rating: 4.7,
    fee: 'Free',
    time: '20 min',
    image:
      'https://images.unsplash.com/photo-1560053608-13721e0d69e8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '2',
    name: 'Green Bowl',
    tags: 'Healthy • Vegan • Salads',
    rating: 4.5,
    fee: '$2.99',
    time: '15 min',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
]

export default function FoodTab() {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { location, setLocation } = useContext(LocationContext)
  const { cartCount, isLoggedIn, profile } = useContext(UserContext)

  const { data, refetch, networkStatus, loading, error } = useQuery(
    RESTAURANTS,
    {
      variables: {
        longitude: Number(location.longitude) || null,
        latitude: Number(location.latitude) || null,
        shopType: null,
        ip: null
      },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  )

  console.log({ location })

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

  const restaurantsWithOffersData = dataWithOffers?.restaurantsWithOffers || []
  console.log({ restaurantsWithOffersData })

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

  const {
    data: dataBusinessCategories,
    loading: loadingBusinessCategories,
    error: errorBusinessCategories
  } = useQuery(getBusinessCategoriesCustomer, {
    fetchPolicy: 'no-cache'
  })

  const businessCategories =
    dataBusinessCategories?.getBusinessCategoriesCustomer || null

  const mostOrderedRestaurantsVar = orderData?.mostOrderedRestaurants || null
  const highestRatingRestaurantData =
    dataHighRating?.highestRatingRestaurant || null
  const nearestRestaurantsData =
    dataNearestRestaurants?.nearestRestaurants || null

  useLayoutEffect(() => {
    // Hide the header
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  const renderCategory = (item) => (
    <TouchableOpacity style={styles.categoryChip}>
      {/* <Text style={styles.categoryIcon}>{item.image}</Text> */}
      <View>
        <Image
          source={{ uri: item.image.url }}
          style={{ width: 24, height: 24, borderRadius: 12, marginRight: 6 }}
        />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  )

  const renderRestaurant = (item) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardTags}>{item.tags}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>⭐ {item.rating}</Text>
          <Text style={styles.metaText}>🚚 {item.fee}</Text>
          <Text style={styles.metaText}>⏱ {item.time}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      <View
        style={{
          ...styles.header,
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
      >
        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 20
          }}
        >
          {/* <Ionicons name='menu-outline' size={24} color='black' /> */}
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ width: 40, height: 40 }}
          >
            <Image
              source={require('../../assets/hamburger_btn.png')}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>{t('deliver_to')}</Text>
            <Text style={styles.headerTitle}>{location?.label} ▼</Text>
          </View>
        </View>
        <View style={styles.cartWrapper}>
          <Ionicons name='cart-outline' size={24} color='black' />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        </View>
      </View>

      {/* Greeting */}
      {profile ? (
        <Text
          style={{ ...styles.greeting, textAlign: isArabic ? 'right' : 'left' }}
        >
          {t('hey')} {profile?.name}
          {i18n.language === 'en' && (
            <Text style={{ fontWeight: '700' }}>, {t('good_afternoon')}</Text>
          )}
        </Text>
      ) : null}

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name='search-outline' size={18} color='gray' />
        <TextInput
          placeholder='Search dishes, restaurants'
          style={styles.searchInput}
          placeholderTextColor='gray'
        />
      </View>

      {/* Categories */}
      <TouchableOpacity
        // onPress={() => navigation.navigate('SearchScreen')}
        style={{
          ...styles.sectionHeader,
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
      >
        <Text style={styles.sectionTitle}>{t('all_categories')}</Text>
        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: moderateScale(5)
          }}
        >
          <Text style={styles.sectionLink}>
            {i18n.language === 'en' && t('see_all')}
          </Text>
          {/* <Ionicons name='chevron-forward' size={16} color='gray' /> */}
          <AntDesign
            name={isArabic ? 'arrowleft' : 'arrowright'}
            size={moderateScale(20)}
            color='black'
          />
        </View>
      </TouchableOpacity>
      <BusinessCategories />
      {/* <FlatList
        data={businessCategories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => renderCategory(item)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
      /> */}

      <View style={{ marginTop: 10 }}>
        <View>
          {restaurantsWithOffersData &&
            restaurantsWithOffersData.length > 0 && (
              <>
                {orderLoading ? (
                  <MainLoadingUI />
                ) : (
                  <MainRestaurantCard
                    orders={[...restaurantsWithOffersData]}
                    loading={orderLoading}
                    error={orderError}
                    title={'businesses_with_offers'}
                  />
                )}
              </>
            )}
        </View>
      </View>
      <View style={{ marginTop: 0 }}>
        <View>
          {mostOrderedRestaurantsVar &&
            mostOrderedRestaurantsVar.length > 0 && (
              <>
                {orderLoading ? (
                  <MainLoadingUI />
                ) : (
                  <MainRestaurantCard
                    orders={mostOrderedRestaurantsVar}
                    loading={orderLoading}
                    error={orderError}
                    title={'mostOrderedNow'}
                  />
                )}
              </>
            )}
        </View>
      </View>
      {/* heighest rating */}
      <View style={{ marginTop: 0 }}>
        <View>
          {highestRatingRestaurantData &&
            highestRatingRestaurantData.length > 0 && (
              <>
                {loadingHighRating ? (
                  <MainLoadingUI />
                ) : (
                  <MainRestaurantCard
                    orders={highestRatingRestaurantData}
                    loading={loadingHighRating}
                    error={errorHighRating}
                    title={'highest_rated'}
                  />
                )}
              </>
            )}
        </View>
      </View>
      {/* nearest restaurants */}
      <View style={{ marginTop: 0 }}>
        <View>
          {nearestRestaurantsData && nearestRestaurantsData.length > 0 && (
            <>
              {loadingNearestRestaurants ? (
                <MainLoadingUI />
              ) : (
                <MainRestaurantCard
                  orders={nearestRestaurantsData}
                  loading={loadingNearestRestaurants}
                  error={errorNearestRestaurants}
                  title={'nearest_to_you'}
                />
              )}
            </>
          )}
        </View>
      </View>

      {/* Restaurants */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Open Restaurants</Text>
        <Text style={styles.sectionLink}>See All →</Text>
      </View>
      {restaurants.map((item) => renderRestaurant(item))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'tomato',
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  cartWrapper: {
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: 'tomato',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700'
  },
  greeting: {
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 12,
    marginBottom: 20
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray'
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500'
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: 160
  },
  cardInfo: {
    padding: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  cardTags: {
    fontSize: 13,
    color: 'gray',
    marginVertical: 4
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  metaText: {
    fontSize: 12,
    color: 'gray'
  }
})
