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
import RestaurantLoading from '../../components/RestaurantComponents/RestaurantLoading'
import UserContext from '../../context/User'
import { moderateScale, scale } from '../../utils/scaling'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import ViewCart from '../../components/RestaurantComponents/ViewCart'
import { Feather } from '@expo/vector-icons'
import SearchModal from '../../components/RestaurantComponents/SearchModal'
import ReviewsModal from '../../components/RestaurantComponents/ReviewsModal'
import JSONTree from 'react-native-json-tree'
import { addFavouriteRestaurant } from '../../apollo/mutations'
import {
  configureReanimatedLogger,
  ReanimatedLogLevel
} from 'react-native-reanimated'

const POPULAR_ITEMS = gql`
  ${popularItems}
`

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`

const PROFILE = gql`
  ${profile}
`
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false // Reanimated runs in strict mode by default
})

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
  const { cartCount, profile, calculatePrice } = useContext(UserContext)

  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [allFoods, setAllFoods] = useState([])

  const [isCategoriesSticky, setIsCategoriesSticky] = useState(false)
  const categoriesLayoutY = useRef(0)
  const [categoryOffsets, setCategoryOffsets] = useState({})
  const sectionRefs = useRef({})

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

  const [activeCategory, setActiveCategory] = useState('picks')
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const STICKY_ADJUST = HEADER_COLLAPSED_HEIGHT + 100 // tweak if needed
  const sortedCategoryOffsetsRef = useRef([]) // precomputed sorted array [[id, y], ...]
  const activeCategoryRef = useRef(activeCategory)

  useEffect(() => {
    activeCategoryRef.current = activeCategory
  }, [activeCategory])

  useEffect(() => {
    const entries = Object.entries(categoryOffsets || {})
    // sort by Y position
    entries.sort((a, b) => a[1] - b[1])
    sortedCategoryOffsetsRef.current = entries
  }, [categoryOffsets])

  // const onScroll = Animated.event(
  //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  //   {
  //     useNativeDriver: true,
  //     listener: (event) => {
  //       const y = event.nativeEvent.contentOffset.y

  //       // ---- existing sticky header animation logic ----
  //       setShowStickyHeader(
  //         y > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT
  //       )
  //       const shouldShow = y > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT
  //       Animated.timing(stickyHeaderAnim, {
  //         toValue: shouldShow ? 1 : 0,
  //         duration: 250,
  //         useNativeDriver: true
  //       }).start()

  //       if (categoriesLayoutY.current) {
  //         setIsCategoriesSticky(y >= categoriesLayoutY.current - 60)
  //       }

  //       // ---- NEW: active-category detection ----
  //       const adjustedY = y + STICKY_ADJUST
  //       const sorted = sortedCategoryOffsetsRef.current
  //       if (sorted && sorted.length) {
  //         let newActive = activeCategoryRef.current // start from last known
  //         for (let i = 0; i < sorted.length; i++) {
  //           const [id, offset] = sorted[i]
  //           const nextOffset = sorted[i + 1]?.[1] ?? Number.POSITIVE_INFINITY
  //           if (adjustedY >= offset && adjustedY < nextOffset) {
  //             newActive = id
  //             break
  //           }
  //         }
  //         if (newActive !== activeCategoryRef.current) {
  //           // update both ref and state (state triggers UI update)
  //           activeCategoryRef.current = newActive
  //           setActiveCategory(newActive)
  //         }
  //       }
  //     }
  //   }
  // )

  const restaurantCategories = restaurant?.categories || []

  const categories = [
    {
      _id: 'picks',
      icon: '🔥',
      title: t('picks_for_you'),
      desceription: t('trending_description'),
      food: popularFood || []
    },
    {
      _id: 'offers',
      icon: '💰',
      title: t('offers'),
      description: t('discounted_items'),
      food:
        restaurantCategories
          ?.flatMap((cat) => cat.foods || [])
          .filter((food) =>
            food?.variations?.some(
              (variation) => variation.discounted && variation.discounted > 0
            )
          ) || []
    },
    ...restaurantCategories?.map((cat) => ({
      _id: cat._id,
      title: cat.title,
      food: cat.foods || []
    }))
  ]

  useEffect(() => {
    if (data && categories?.length) {
      const flattened = categories.flatMap((cat) => cat.food)
      const unique = Array.from(
        new Map(flattened.map((item) => [item._id, item])).values()
      )
      setAllFoods(unique)
    }
  }, [data])

  useEffect(() => {
    if (!scrollViewRef.current || !categories?.length) return

    const newOffsets = {}
    let measuredCount = 0

    categories.forEach((cat) => {
      const ref = sectionRefs.current[cat._id]
      if (ref) {
        ref.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            newOffsets[cat._id] = y
            measuredCount += 1
            if (measuredCount === categories.length) {
              setCategoryOffsets(newOffsets)
            }
          },
          (error) => {
            console.warn('Measure failed for', cat._id, error)
          }
        )
      }
    })
  }, [data])

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId)
    const yOffset = categoryOffsets[categoryId]
    console.log({ yOffset })
    if (yOffset !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: yOffset - HEADER_COLLAPSED_HEIGHT - 40,
        animated: true
      })
    }
  }
  const STICKY_HEADER_HEIGHT = 50; // your sticky header height

const handleScroll = (event) => {
  const scrollY = event.nativeEvent.contentOffset.y;

  // Existing sticky header animation logic
  const shouldShow =
    scrollY > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT;
  setShowStickyHeader(shouldShow);
  Animated.timing(stickyHeaderAnim, {
    toValue: shouldShow ? 1 : 0,
    duration: 250,
    useNativeDriver: true,
  }).start();

  if (categoriesLayoutY.current) {
    setIsCategoriesSticky(scrollY >= categoriesLayoutY.current - 60);
  }

  const adjustedScrollY = scrollY + STICKY_HEADER_HEIGHT;

  const sortedCategories = Object.entries(categoryOffsets).sort(
    (a, b) => a[1] - b[1]
  );

  let currentCategory = activeCategory;

  for (let i = 0; i < sortedCategories.length; i++) {
    const [categoryId, offset] = sortedCategories[i];
    const nextOffset = sortedCategories[i + 1]?.[1] ?? Infinity;

    // 💡 This ensures category changes *only when the next one touches sticky header*
    if (
      adjustedScrollY >= offset &&
      adjustedScrollY < nextOffset - STICKY_HEADER_HEIGHT
    ) {
      currentCategory = categoryId;
      break;
    }
  }

  if (currentCategory !== activeCategory) {
    setActiveCategory(currentCategory);
  }
};
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

  const renderItem = ({ item, cat }) => {
    return <PickCards item={item} restaurantCustomer={restaurant} cat={cat} />
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
      {/* Sticky version of categories – appears on top when isCategoriesSticky is true */}
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
          />
        </Animated.View>
      )}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIconContainer}
        >
          <AntDesign name='arrowleft' size={moderateScale(18)} color='black' />
        </TouchableOpacity>
        <View style={styles.iconsWrapper}>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={handleAddToFavorites}
          >
            <MaterialIcons
              name={heart ? 'favorite' : 'favorite-border'}
              size={moderateScale(18)}
              color={heart ? 'red' : 'black'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => setSearchModalVisible(true)}
          >
            <Feather name='search' size={moderateScale(18)} color='black' />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        onScroll={handleScroll}
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
          <Text
            style={{
              ...styles.restaurantTitle,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {restaurant?.name ? restaurant.name : null}
          </Text>
          {restaurant?.businessCategories ? (
            <Text
              style={{
                ...styles.restaurantSubtitle,
                textAlign: isArabic ? 'right' : 'left',
                fontSize: moderateScale(14)
              }}
            >
              {businessCategoriesNames ? businessCategoriesNames : ''}
            </Text>
          ) : null}
          {!isArabic ? (
            <Text
              style={{
                ...styles.deliveryInfo,
                textAlign: 'left'
              }}
            >
              {/* 🚲 {configuration?.currency} {configuration?.minimumDeliveryFee}{' '} */}
              {configuration?.currency} {restaurant?.minimumOrder}{' '}
              {t('minimum_orders')} •{' '}
              {restaurant?.deliveryTime ? restaurant.deliveryTime : 0}{' '}
              {/* {t('minutes')} */}⏱
            </Text>
          ) : (
            <Text
              style={{
                ...styles.deliveryInfo,
                textAlign: 'right'
              }}
            >
              {/* 🚲 {t('minimum')} {configuration?.minimumDeliveryFee}{' '} */}
              {t('minimum_orders')} {restaurant?.minimumOrder}{' '}
              {configuration?.currencySymbol} •{' '}
              {restaurant?.deliveryTime ? restaurant.deliveryTime : 0} ⏱
              {/* {t('minutes')} */}
            </Text>
          )}
          <View
            style={{
              marginTop: 12,
              flexDirection: isArabic ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <StarRatingDisplay
                rating={restaurant?.reviewCount || 0}
                color={'orange'}
                emptyColor='orange'
                enableHalfStar={true}
                starSize={moderateScale(20)}
              />
              {restaurant.reviewCount ? (
                <Text style={{ color: '#000' }}>
                  (
                  {restaurant?.reviewCount
                    ? `${restaurant?.reviewCount} ${t('titleReviews')}`
                    : null}
                  )
                </Text>
              ) : null}
            </View>
            {restaurant?.reviewCount ? (
              <TouchableOpacity onPress={() => setShowReviewsModal(true)}>
                <Text style={{ color: colors.primary }}>
                  {t('see_all_reviews')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowReviewsModal(true)}>
                <Text style={{ color: colors.primary }}>{t('no_reviews')}</Text>
              </TouchableOpacity>
            )}
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
          />
        </View>

        {/* scroll view for included food categories */}
          {categories?.map((cat) => {
            return (
              <View
                key={cat._id}
                ref={(ref) => {
                  if (ref) sectionRefs.current[cat._id] = ref
                }}
                style={styles.menuSection}
              >
                <Text
                  style={{
                    ...styles.sectionTitle,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {cat.title} {cat.icon ? cat.icon : null}
                </Text>
                {cat.desceription ? (
                  <Text
                    style={{
                      ...styles.sectionSubtitle,
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                  >
                    {cat.desceription}
                  </Text>
                ) : null}
                {/* render items for that section */}
                {cat?.food?.length ? (
                  cat?.food?.map((item) => (
                   renderItem({ item, cat })
                  ))) : (
                  <Text
                    style={{
                      color: '#999',
                      marginTop: 10,
                      textAlign: 'center'
                    }}
                  >
                    {t('no_items_in_category')}
                  </Text>
                )}
              </View>
            )
          })}
      </Animated.ScrollView>
      {cartCount > 0 ? (
        <ViewCart
          cartCount={cartCount}
          calculatePrice={calculatePrice}
          minimumOrder={restaurant.minimumOrder}
        />
      ) : null}

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

      {/* {restaurant && restaurant.minimumOrder > calculatePrice() ? (
        <View style={styles.bottomBanner}>
          <Text style={styles.bottomText}>
            {t('add')} {configuration?.currency}{' '}
            {parseFloat(restaurant?.minimumOrder).toFixed(2)}{' '}
            {t('to_start_your_order')}
          </Text>
        </View>
      ) : null} */}
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
    padding: 5,
    zIndex: 100
  },
  iconsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: 110
  },
  headerImage: {
    width: '100%',
    height: moderateScale(HEADER_EXPANDED_HEIGHT + 40),
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
    fontSize: moderateScale(22),
    fontWeight: 'bold'
  },
  restaurantSubtitle: {
    color: '#666',
    marginTop: moderateScale(4)
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
