/* eslint-disable react/display-name */
import React, {
  // useRef,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback
} from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  RefreshControl,
  FlatList
} from 'react-native'
import {
  // MaterialIcons,
  // SimpleLineIcons,
  AntDesign
  // MaterialCommunityIcons,
  // Ionicons
} from '@expo/vector-icons'
import { useQuery, useLazyQuery } from '@apollo/client'
import {
  useCollapsibleSubHeader,
  CollapsibleSubHeaderAnimator
} from 'react-navigation-collapsible'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import gql from 'graphql-tag'
// import { useLocation } from '../../ui/hooks'
import Search from '../../components/Main/Search/Search'
import Item from '../../components/Main/Item/Item'
import UserContext from '../../context/User'
import {
  featuredRestaurants,
  getBusinessCategoriesCustomer,
  getRestaurantsBusinessCategories,
  mostOrderedRestaurantsQuery,
  // getCuisines,
  // highestRatingRestaurant,
  // nearestRestaurants,
  recentOrderRestaurantsQuery,
  restaurantListPreview,
  restaurantsWithOffers,
  searchRestaurantsCustomer
} from '../../apollo/queries'
// import { selectAddress } from '../../apollo/mutations'
// import { moderateScale } from '../../utils/scaling'
import styles from './styles'
// import TextError from '../../components/Text/TextError/TextError'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
// import navigationOptions from '../Main/navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import { ActiveOrdersAndSections } from '../../components/Main/ActiveOrdersAndSections'
// import { alignment } from '../../utils/alignment'
// import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import Filters from '../../components/Filter/FilterSlider'
import { FILTER_TYPE } from '../../utils/enums'
// import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
// import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
// import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
// import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import ErrorView from '../../components/ErrorView/ErrorView'
// import Spinner from '../../components/Spinner/Spinner'
// import MainModalize from '../../components/Main/Modalize/MainModalize'

// import { escapeRegExp } from '../../utils/regex'
// import { colors } from '../../utils/colors'
import { debounce } from 'lodash'
import { moderateScale } from '../../utils/scaling'

const RESTAURANTS = gql`
  ${restaurantListPreview}
`
// const SELECT_ADDRESS = gql`
//   ${selectAddress}
// `

// const GET_CUISINES = gql`
//   ${getCuisines}
// `

export const FILTER_VALUES = {
  // Sort: {
  //   type: FILTER_TYPE.RADIO,
  //   values: ['Relevance (Default)', 'Fast Delivery', 'Distance'],
  //   selected: []
  // },
  // Offers: {
  //   selected: [],
  //   type: FILTER_TYPE.CHECKBOX,
  //   values: ['Free Delivery', 'Accept Vouchers', 'Deal']
  // },
  Highlights: {
    type: FILTER_TYPE.RADIO, // only one can be selected
    selected: [],
    values: ['businesses_with_offers', 'mostOrderedNow', 'featured']
  },
  Rating: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['3+ Rating', '4+ Rating', '5 star Rating']
  }
}

function Menu({ route, props }) {
  // const Analytics = analytics()
  const { selectedType } = route.params || { selectedType: 'restaurant' }
  const { highlight, title } = route.params || {}
  const filteredItem = route.params?.filteredItem || null
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  // const [busy, setBusy] = useState(false)
  const { loadingOrders, isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(FILTER_VALUES)
  const [restaurantData, setRestaurantData] = useState([])
  const [resultSearchData, setResultSearchData] = useState([])
  const [sectionData, setSectionData] = useState([])
  const [highlightMain, setHighlightMain] = useState(false)
  const [titleMain, setTitleMain] = useState('')
  const [titleUI, setTitleUI] = useState('')
  // const modalRef = useRef(null)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  // const { getCurrentLocation } = useLocation()
  // const locationData = location

  console.log({ highlight, title, titleMain })

  useEffect(() => {
    if (highlight || title) {
      setHighlightMain(true)
      setTitleMain(title)
      setTitleUI(title)
    }
  }, [highlight, title])

  // const { data, refetch, networkStatus, loading, error } = useQuery(
  //   RESTAURANTS,
  //   {
  //     variables: {
  //       longitude: location.longitude || null,
  //       latitude: location.latitude || null,
  //       shopType: selectedType || null,
  //       ip: null
  //     },
  //     onCompleted: (data) => {
  //       console.log({ nearByRestaurantsPreview: data.nearByRestaurantsPreview })
  //       setRestaurantData(data.nearByRestaurantsPreview.restaurants)
  //       setSectionData(data.nearByRestaurantsPreview.sections)
  //     },
  //     fetchPolicy: 'no-cache'
  //   }
  // )

  const [fetchAllBusinesses, { data, refetch, networkStatus, loading, error }] =
    useLazyQuery(RESTAURANTS)

  useEffect(() => {
    // Clear old list immediately when params change
    initialFun()
  }, [route.params])

  const initialFun = async () => {
    setRestaurantData([])
    setResultSearchData([])
    setFilters(FILTER_VALUES)
    generateBusinessCategories()
    // then trigger refetch
    if (titleMain === 'all_businesses' || !title) {
      // refetch()
      const res = await fetchAllBusinesses({
        variables: {
          longitude: location.longitude || null,
          latitude: location.latitude || null,
          shopType: selectedType || null,
          ip: null
        }
      })
      console.log({ res: res.data })
      setRestaurantData(res.data.nearByRestaurantsPreview?.restaurants)
      setSectionData(res.data.nearByRestaurantsPreview?.sections)
    }
  }

  // console.log({ restaurantData })

  // const [mutate, { loading: mutationLoading }] = useMutation(SELECT_ADDRESS, {
  //   onError
  // })

  // const { data: allCuisines } = useQuery(GET_CUISINES)

  const {
    data: dataBusinessCategories,
    loading: loadingBusinessCategories,
    error: errorBusinessCategories
  } = useQuery(getBusinessCategoriesCustomer, {
    fetchPolicy: 'no-cache'
  })

  // to get the highlights filter values
  const [
    fetchOffersRestaurants,
    { data: dataWithOffers, loading: loadingWithOffers, error: errorWithOffers }
  ] = useLazyQuery(restaurantsWithOffers)
  // const [
  //   fetchHighRatingRestaurants,
  //   { data: dataHighRating, loading: loadingHighRating, error: errorHighRating }
  // ] = useLazyQuery(highestRatingRestaurant)
  // const [
  //   fetchNearestRestaurants,
  //   { data: dataNearest, loading: loadingNearest, error: errorNearest }
  // ] = useLazyQuery(nearestRestaurants)
  const [
    fetchFeaturedRestaurants,
    { data: dataFeatured, loading: loadingFeatured, error: errorFeatured }
  ] = useLazyQuery(featuredRestaurants)

  const [
    fetchRestaurantsBusinessCategories,
    {
      data: dataRestaurantsWithBusinessCategories,
      loading: loadingWithBusinessCats,
      error: errorWithBusinessCats
    }
  ] = useLazyQuery(getRestaurantsBusinessCategories)

  const [
    fetchMostOrderedRestaurants,
    {
      data: dataMostOrdered,
      loading: loadingMostOrdered,
      error: errorMostOrdered
    }
  ] = useLazyQuery(mostOrderedRestaurantsQuery)

  const [fetchSearchRestaurants, { loading: loadingSearch }] = useLazyQuery(
    searchRestaurantsCustomer
    // {
    //   variables: {
    //     search,
    //     longitude: location.longitude,
    //     latitude: location.latitude
    //   },
    //   fetchPolicy: 'network-only'
    // }
  )

  const searchRestaurants = async (searchText) => {
    const res = await fetchSearchRestaurants({
      variables: {
        search: searchText,
        longitude: location.longitude,
        latitude: location.latitude
      }
    })
    setResultSearchData(res.data?.searchRestaurantsCustomer || [])
  }

  const handleSearch = useCallback(
    debounce((text) => {
      console.log('Searching for:', text)
      // call API here
      searchRestaurants(text)
    }, 500),
    []
  )

  const businessCategories =
    dataBusinessCategories?.getBusinessCategoriesCustomer || null

  const newheaderColor = currentTheme.newheaderColor

  const {
    // onScroll /* Event handler */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */,
    translateY
  } = useCollapsibleSubHeader()

  const searchPlaceholderText =
    selectedType === 'restaurant' ? t('searchRestaurant') : t('searchGrocery')
  const menuPageHeading =
    selectedType === 'restaurant' ? t('allRestaurant') : t('allGrocery')
  const emptyViewDesc =
    selectedType === 'restaurant' ? t('noRestaurant') : t('noGrocery')

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#fff')
    }
    StatusBar.setBarStyle('dark-content')
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  })

  useEffect(() => {
    if (highlightMain && titleMain) {
      const updatedFilters = { ...filters }
      updatedFilters.Highlights.selected = [titleMain]
      fetchHighlightsData()
    }
  }, [highlightMain, titleMain, restaurantData])

  const fetchHighlightsData = useCallback(async () => {
    console.log('fetchHighlightsData called')
    const variables = {
      longitude: location.longitude,
      latitude: location.latitude
    }
    if (titleMain === 'all_businesses' || !title) {
      // refetch()
      const res = await fetchAllBusinesses({
        variables: {
          longitude: location.longitude || null,
          latitude: location.latitude || null,
          shopType: selectedType || null,
          ip: null
        }
      })
      console.log({ res: res.data })
      setRestaurantData(res.data.nearByRestaurantsPreview?.restaurants)
      setSectionData(res.data.nearByRestaurantsPreview?.sections)
    } else if (titleMain === 'businesses_with_offers') {
      fetchOffersRestaurants({ variables }).then((res) => {
        setRestaurantData(res?.data?.restaurantsWithOffers || [])
      })
    } else if (titleMain === 'mostOrderedNow') {
      fetchMostOrderedRestaurants({ variables }).then((res) => {
        setRestaurantData(res?.data?.mostOrderedRestaurantsPreview || [])
      })
    } else if (titleMain === 'featured') {
      fetchFeaturedRestaurants({ variables }).then((res) => {
        setRestaurantData(res?.data?.featuredRestaurants || [])
      })
    }
  }, [highlight, titleMain])

  // useEffect(() => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     Cuisines: {
  //       selected: [],
  //       type: FILTER_TYPE.CHECKBOX,
  //       values: allCuisines?.cuisines?.map((item) => item.name)
  //     }
  //   }))
  // }, [allCuisines])

  useEffect(() => {
    generateBusinessCategories()
  }, [businessCategories])

  // to generate business categories filter values
  const generateBusinessCategories = () => {
    if (businessCategories?.length) {
      setFilters((prev) => ({
        ...prev,
        categories: {
          selected: [],
          type: FILTER_TYPE.CHECKBOX,
          values: businessCategories?.map((item) => item)
        }
      }))
    }
  }

  console.log({ filtersCategories: filters?.categories?.selected })

  useEffect(() => {
    if (titleMain === 'businessCategory' && filteredItem) {
      fetchRestaurantsBusinessCategories({
        variables: {
          longitude: location.longitude,
          latitude: location.latitude,
          businessCategoryIds: [filteredItem._id]
        }
      }).then((res) => {
        setRestaurantData(res?.data?.getRestaurantsBusinessCategories || [])
      })
    }
  }, [route.params, filters.categories, titleMain, filteredItem])

  const emptyView = () => {
    if (
      loading ||
      // mutationLoading ||
      loadingOrders ||
      loadingWithOffers ||
      loadingFeatured ||
      loadingMostOrdered
    ) {
      return loadingScreen()
    } else {
      return (
        <View style={styles().emptyViewContainer}>
          <View style={styles(currentTheme).emptyViewBox}>
            <TextDefault bold H4 center textColor={currentTheme.fontMainColor}>
              {/* {t('notAvailableinYourArea')} */}
              {t('no_search_result')}
            </TextDefault>
            {/* <TextDefault textColor={currentTheme.fontMainColor} center>
              {emptyViewDesc}
            </TextDefault> */}
          </View>
        </View>
      )
    }
  }

  function loadingScreen() {
    return (
      <View style={styles(currentTheme).screenBackground}>
        {/* <View style={styles(currentTheme).searchbar}>
          <Search
            search={''}
            setSearch={() => {}}
            newheaderColor={newheaderColor}
            placeHolder={searchPlaceholderText}
          />
        </View> */}

        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
      </View>
    )
  }

  if (error) return <ErrorView />

  if (
    loading ||
    loadingOrders ||
    loadingMostOrdered ||
    loadingFeatured ||
    loadingWithOffers
  )
    return loadingScreen()

  // Flatten the array. That is important for data sequence
  const restaurantSections = sectionData?.map((sec) => ({
    ...sec,
    restaurants: sec?.restaurants
      ?.map((id) => restaurantData?.filter((res) => res._id === id))
      .flat()
  }))

  const extractRating = (ratingString) => parseInt(ratingString)

  // console.log({ dataHighRating })

  const applyFilters = async () => {
    setRestaurantData([])
    // let filteredData = [...data.nearByRestaurantsPreview.restaurants]
    let filteredData = []

    const ratings = filters.Rating
    const sort = filters.Sort
    // const offers = filters.Offers
    const cuisines = filters.Cuisines
    const businessCategories = filters.categories
    const highlights = filters.Highlights
    const variables = {
      longitude: location.longitude,
      latitude: location.latitude
    }
    // Apply filters incrementally
    // Ratings filter
    if (ratings?.selected?.length > 0) {
      const numericRatings = ratings.selected?.map(extractRating)
      filteredData = filteredData.filter(
        (item) => item?.reviewData?.ratings >= Math.min(...numericRatings)
      )
    }

    // Sort filter
    if (sort?.selected?.length > 0) {
      if (sort.selected[0] === 'Fast Delivery') {
        filteredData.sort((a, b) => a.deliveryTime - b.deliveryTime)
      } else if (sort.selected[0] === 'Distance') {
        filteredData.sort(
          (a, b) =>
            a.distanceWithCurrentLocation - b.distanceWithCurrentLocation
        )
      }
    }

    // Offers filter
    // if (offers?.selected?.length > 0) {
    //   if (offers.selected.includes('Free Delivery')) {
    //     filteredData = filteredData.filter((item) => item?.freeDelivery)
    //   }
    //   if (offers.selected.includes('Accept Vouchers')) {
    //     filteredData = filteredData.filter((item) => item?.acceptVouchers)
    //   }
    // }

    // Cuisine filter
    if (cuisines?.selected?.length > 0) {
      filteredData = filteredData.filter((item) =>
        item.cuisines.some((cuisine) => cuisines?.selected?.includes(cuisine))
      )
    }

    if (highlights?.selected?.length) {
      setTitleMain('')

      if (highlights.selected[0] === 'businesses_with_offers') {
        const res = await fetchOffersRestaurants({ variables })
        setRestaurantData(res.data?.restaurantsWithOffers || [])
        setTitleUI('businesses_with_offers')
        return
      }

      if (highlights.selected[0] === 'mostOrderedNow') {
        const res = await fetchMostOrderedRestaurants({ variables })
        setRestaurantData(res.data?.mostOrderedRestaurantsPreview || [])
        setTitleUI('mostOrderedNow')
        return
      }

      if (highlights.selected[0] === 'featured') {
        const res = await fetchFeaturedRestaurants({ variables })
        setRestaurantData(res.data?.featuredRestaurants || [])
        setTitleUI('featured')
        return
      }
    }

    if (businessCategories?.selected?.length > 0) {
      fetchRestaurantsBusinessCategories({
        variables: {
          ...variables,
          businessCategoryIds: [...businessCategories?.selected]
        }
      }).then((res) => {
        setRestaurantData(res?.data?.getRestaurantsBusinessCategories || [])
      })
      // filteredData = filteredData.filter((item) =>
      //   item.businessCategories.some((category) => {
      //     return businessCategories?.selected?.includes(category._id)
      //   })
      // )
    }

    // Set filtered data
    setRestaurantData(filteredData)
  }

  return (
    <SafeAreaView style={[styles().flex, { backgroundColor: '#fff' }]}>
      <CollapsibleSubHeaderAnimator translateY={translateY}>
        <View style={styles(currentTheme).searchbar}>
          <View
            style={{
              marginVertical: 10,
              flexDirection: isArabic ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20
            }}
          >
            <TextDefault bold H3 style={{ color: '#000', textAlign: 'right' }}>
              {t('search')}
            </TextDefault>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign
                name={isArabic ? 'arrowleft' : 'arrowright'}
                size={24}
                color='black'
              />
            </TouchableOpacity>
          </View>
          <Search
            backgroundColor={'#fff'}
            setSearch={setSearch}
            search={search}
            handleSearch={handleSearch}
            newheaderColor={newheaderColor}
            placeHolder={searchPlaceholderText}
          />
        </View>

        <Filters
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          filteredItem={filteredItem}
        />
      </CollapsibleSubHeaderAnimator>

      {/* Scrollable List */}
      <View style={{ marginTop: moderateScale(190) }}>
        <FlatList
          data={search ? resultSearchData : restaurantData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Item item={item} />}
          // onScroll={onScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            // paddingTop: containerPaddingTop, // consistent padding
            paddingBottom: 140, // give space for footer/modal
            flexGrow: 1
          }}
          style={{
            flexGrow: 1
          }}
          ListHeaderComponent={
            search || restaurantData.length === 0 ? null : (
              <ActiveOrdersAndSections
                sections={restaurantSections}
                menuPageHeading={t('results') || menuPageHeading}
                restaurantLength={
                  search ? resultSearchData.length : restaurantData.length
                }
              />
            )
          }
          ListEmptyComponent={emptyView()}
          refreshControl={
            <RefreshControl
              progressViewOffset={containerPaddingTop}
              colors={[currentTheme.iconColorPink]}
              refreshing={networkStatus === 4}
              onRefresh={() => {
                if (networkStatus === 7) {
                  refetch()
                }
              }}
            />
          }
          scrollIndicatorInsets={{ top: scrollIndicatorInsetTop }}
        />
      </View>
    </SafeAreaView>
  )
}

export default Menu
