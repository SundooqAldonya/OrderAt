import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
  findNodeHandle,
  Platform,
  Touchable
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RestaurantHeader from '../../components/RestaurantComponents/RestaurantHeader'
import { HEADER_COLLAPSED_HEIGHT, HEADER_EXPANDED_HEIGHT } from './helpers'
import PickCards from '../../components/RestaurantComponents/PickCards'
import AntDesign from '@expo/vector-icons/AntDesign'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Entypo from '@expo/vector-icons/Entypo'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import Categories from '../../components/RestaurantComponents/Categories'
import { colors } from '../../utils/colors'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useRestaurant } from '../../ui/hooks'
import ConfigurationContext from '../../context/Configuration'
import { useTranslation } from 'react-i18next'
import { food, popularItems, profile } from '../../apollo/queries'
import { StarRatingDisplay } from 'react-native-star-rating-widget'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/client'
import SkeletonBox from '../../components/SkeletonBox'
import RestaurantLoading from '../../components/RestaurantComponents/RestaurantLoading'
import UserContext from '../../context/User'
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'
import { scale } from '../../utils/scaling'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import ViewCart from '../../components/RestaurantComponents/ViewCart'
import { Feather } from '@expo/vector-icons'
import SearchModal from '../../components/RestaurantComponents/SearchModal'
import ReviewsModal from '../../components/RestaurantComponents/ReviewsModal'
import JSONTree from 'react-native-json-tree'
import { addFavouriteRestaurant } from '../../apollo/mutations'

const POPULAR_ITEMS = gql`
  ${popularItems}
`

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`

const PROFILE = gql`
  ${profile}
`
const ITEM_HEIGHT = 150
const CATEGORY_HEADER_HEIGHT = 50
const CATEGORY_PADDING = 10

const RestaurantDetailsV2 = () => {
  const configuration = useContext(ConfigurationContext)
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const scrollY = new Animated.Value(0)
  const stickyHeaderAnim = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef({})
  const route = useRoute()
  const { _id: restaurantId } = route.params
  const { cartCount, profile } = useContext(UserContext)
  const [businessCategories, setBusinessCategories] = useState(null)
  // const [businessCategoriesNames, setBusinessCategoriesNames] = useState(null)
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [allFoods, setAllFoods] = useState([])

  const [isCategoriesSticky, setIsCategoriesSticky] = useState(false)
  const categoriesLayoutY = useRef(0)

  // const heart = profile ? profile.favourite.includes(restaurantId) : false
  const [heart, setHeart] = useState(
    profile ? profile.favourite.includes(restaurantId) : false
  )

  const { data, refetch, networkStatus, loading, error } =
    useRestaurant(restaurantId)

  const restaurant = data?.restaurantCustomer || null
  const businessCategoriesNames =
    (restaurant?.businessCategories || [])
      .map((cat) => cat.name)
      .filter(Boolean)
      .join(', ') || 'غير مصنف'

  const { data: dataPopularItems } = useQuery(POPULAR_ITEMS, {
    variables: { restaurantId },
    nextFetchPolicy: 'network-only',
    skip: !restaurantId
  })

  const popularFood = dataPopularItems?.popularItems || null

  const [sectionPositions, setSectionPositions] = useState({})
  const [activeCategory, setActiveCategory] = useState('picks')
  const [showStickyHeader, setShowStickyHeader] = useState(false)

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const y = event.nativeEvent.contentOffset.y
        setShowStickyHeader(
          y > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT
        )
        const shouldShow = y > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT
        // Animate the sticky header visibility
        Animated.timing(stickyHeaderAnim, {
          // Animate the sticky header visibility
          toValue: shouldShow ? 1 : 0,
          duration: 250,
          useNativeDriver: true
        }).start()
        // Check if the categories section is sticky
        if (categoriesLayoutY.current) {
          if (y >= categoriesLayoutY.current - 60) {
            setIsCategoriesSticky(true)
          } else {
            setIsCategoriesSticky(false)
          }
        }
      }
    }
  )

  const restaurantCategories = restaurant?.categories || []

  const categories = [
    {
      _id: 'picks',
      icon: '🔥',
      title: t('picks_for_you'),
      desceription: "Trending items we think you'll love",
      food: popularFood || []
    },
    ...restaurantCategories.map((cat) => ({
      _id: cat._id,
      title: cat.title,
      food: cat.foods || []
    }))
  ]

  useEffect(() => {
    if (data && categories?.length) {
      const flattened = categories.flatMap((cat) => cat.food)
      setAllFoods(flattened)
    }
  }, [data])

  const getScrollOffsetForCategory = (targetCategoryId) => {
    let offset = 0

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      const itemsInThisCategory = categories[cat._id]?.length || 0

      offset += CATEGORY_HEADER_HEIGHT
      offset += itemsInThisCategory * ITEM_HEIGHT
      offset += CATEGORY_PADDING
      if (cat._id === targetCategoryId) break
    }

    return offset
  }

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId)
    const y = getScrollOffsetForCategory(categoryId)
    // Scroll to the section of the selected category

    scrollViewRef.current?.scrollTo({
      // y: sectionPositions[categoryId] + y,
      y: y,
      animated: true
    })
  }

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y

    let current = categories[0]._id
    for (let i = 0; i < categories.length; i++) {
      const _id = categories[i]._id
      const nextId = categories[i + 1]?._id
      const currentY = sectionPositions[_id]
      const nextY = sectionPositions[nextId] ?? Infinity

      if (yOffset >= currentY && yOffset < nextY) {
        current = _id
        break
      }
    }
    setActiveCategory(current)
  }

  const [mutateAddToFavorites, { loading: loadingMutation }] = useMutation(
    ADD_FAVOURITE,
    {
      refetchQueries: [{ query: PROFILE }],
      onCompleted: (res) => {
        console.log('Added to favorites:', res)
      },
      onError: (err) => {
        console.error('Error adding to favorites:', err)
      }
    }
  )

  const handleAddToFavorites = () => {
    if (restaurant) {
      setHeart((prev) => !prev)
      mutateAddToFavorites({ variables: { id: restaurantId } })
    }
  }

  if (loading) {
    return <RestaurantLoading />
  }

  const renderItem = ({ item }) => {
    return <PickCards item={item} restaurantCustomer={restaurant} />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle='dark-content'
      />

      {showStickyHeader && (
        <RestaurantHeader
          title={restaurant?.name}
          stickyHeaderAnim={stickyHeaderAnim}
        />
      )}
      {/* Sticky version – appears on top when isCategoriesSticky is true */}
      {isCategoriesSticky && (
        <Animated.View
          style={[
            styles.stickyCategories,
            { opacity: stickyHeaderAnim, top: HEADER_COLLAPSED_HEIGHT }
          ]}
        >
          <Categories
            categories={categories}
            activeCategory={activeCategory}
            onCategoryPress={handleCategoryPress}
            sectionPositions={sectionPositions}
          />
        </Animated.View>
      )}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIconContainer}
        >
          <AntDesign name='arrowleft' size={18} color='black' />
        </TouchableOpacity>
        <View style={styles.iconsWrapper}>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={handleAddToFavorites}
          >
            <MaterialIcons
              name={heart ? 'favorite' : 'favorite-border'}
              size={18}
              color={heart ? 'red' : 'black'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => setSearchModalVisible(true)}
          >
            <Feather name='search' size={18} color='black' />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Image
          source={
            restaurant?.image
              ? { uri: restaurant?.image }
              : require('../../assets/restaurant/header_kebab.jpg')
          }
          style={styles.headerImage}
        />

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantTitle}>
            {restaurant?.name ? restaurant.name : null}
          </Text>
          {restaurant?.businessCategories ? (
            <Text style={styles.restaurantSubtitle}>
              {businessCategoriesNames ? businessCategoriesNames : ''}
            </Text>
          ) : null}
          <Text style={styles.deliveryInfo}>
            🚲 {configuration?.currency} {configuration?.minimumDeliveryFee}{' '}
            {t('minimum')} •{' '}
            {restaurant?.deliveryTime ? restaurant.deliveryTime : 0} mins
          </Text>
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <StarRatingDisplay
                rating={restaurant?.reviewCount || 0}
                color={'orange'}
                emptyColor='orange'
                enableHalfStar={true}
                starSize={20}
              />
              <Text style={{ color: '#000' }}>
                (
                {restaurant?.reviewCount
                  ? `${restaurant?.reviewCount} ${t('titleReviews')}`
                  : null}
                )
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowReviewsModal(true)}>
              <Text style={{ color: colors.primary }}>
                {t('see_all_reviews')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* food categories */}

        {/* Normal scrollable version of categories */}
        <View
          onLayout={(event) => {
            categoriesLayoutY.current = event.nativeEvent.layout.y
          }}
        >
          <Categories
            categories={categories}
            activeCategory={activeCategory}
            onCategoryPress={handleCategoryPress}
            sectionPositions={sectionPositions}
          />
        </View>

        {/* scroll view for included food categories */}
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {categories?.map((cat) => (
            <View
              key={cat._id}
              onLayout={(event) => {
                const y = event.nativeEvent.layout.y
                setSectionPositions((prev) => ({ ...prev, [cat._id]: y }))
              }}
              style={styles.menuSection}
            >
              <Text style={styles.sectionTitle}>
                {cat.title} {cat.icon ? cat.icon : null}
              </Text>
              {cat.desceription ? (
                <Text style={styles.sectionSubtitle}>{cat.desceription}</Text>
              ) : null}
              {/* render items for that section */}
              {cat?.food?.length ? (
                <FlatList
                  data={cat.food}
                  renderItem={renderItem}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={{ color: '#999', marginTop: 10 }}>
                  {t('no_items_in_category')}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.ScrollView>
      {cartCount > 0 && <ViewCart cartCount={cartCount} />}

      {/* search modal */}
      <SearchModal
        searchModalVisible={searchModalVisible}
        setSearchModalVisible={setSearchModalVisible}
        restaurant={restaurant}
        allFoods={allFoods}
      />

      {/* reviews modal */}
      <ReviewsModal
        reviewModalVisible={showReviewsModal}
        setReviewModalVisible={setShowReviewsModal}
        restaurantId={restaurant?._id}
      />

      <View style={styles.bottomBanner}>
        <Text style={styles.bottomText}>
          Add EGP {parseFloat(restaurant?.minimumOrder).toFixed(2)} to start
          your order
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  topHeader: {
    position: 'absolute',
    zIndex: 20,
    top: 35,
    left: 15,
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 50,
    padding: 5
  },
  iconsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: 110
  },
  headerImage: {
    width: '100%',
    height: HEADER_EXPANDED_HEIGHT + 40,
    resizeMode: 'cover'
  },

  restaurantInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 10,
    overflow: 'hidden',
    marginTop: -50
  },
  restaurantTitle: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  restaurantSubtitle: {
    color: '#666',
    marginTop: 4
  },
  deliveryInfo: {
    marginTop: 8
  },
  proButton: {
    backgroundColor: '#eaffe8ff',
    marginTop: 12,
    padding: 10,
    borderRadius: 8
  },
  proButtonText: {
    color: colors.primary,
    fontWeight: '500'
  },
  discountBanner: {
    backgroundColor: '#ffeecf',
    padding: 10,
    borderRadius: 8,
    marginTop: 16
  },
  menuSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  sectionSubtitle: {
    color: '#999',
    marginBottom: 12
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    paddingHorizontal: 16
  },
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 12,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  bottomText: {
    fontWeight: '500'
  },
  stickyCategories: {
    position: 'absolute',
    top: HEADER_COLLAPSED_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'white',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  }
})

export default RestaurantDetailsV2
