/* eslint-disable react/display-name */
import React, {
  useRef,
  useContext,
  useLayoutEffect,
  useState,
  useEffect
} from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  Animated,
  RefreshControl,
  Linking,
  FlatList
} from 'react-native'
import { MaterialIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import { useMutation, useQuery, gql, useLazyQuery } from '@apollo/client'
import { useCollapsibleSubHeader } from 'react-navigation-collapsible'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import { useLocation } from '../../ui/hooks'
import Search from '../../components/Main/Search/Search'
import UserContext from '../../context/User'
import {
  checkDeliveryZone,
  getBusinessCategoriesCustomer,
  highestRatingRestaurant,
  nearestRestaurants,
  restaurantList,
  restaurantListPreview,
  restaurantsWithOffers
} from '../../apollo/queries'
import { createAddress, selectAddress } from '../../apollo/mutations'
import { moderateScale, scale } from '../../utils/scaling'
import styles from './styles'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import navigationOptions from './navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import { alignment } from '../../utils/alignment'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import MainRestaurantCard from '../../components/Main/MainRestaurantCard/MainRestaurantCard'
import { TopBrands } from '../../components/Main/TopBrands'
import Item from '../../components/Main/Item/Item'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import useHomeRestaurants from '../../ui/hooks/useRestaurantOrderInfo'
import ErrorView from '../../components/ErrorView/ErrorView'
import ActiveOrders from '../../components/Main/ActiveOrders/ActiveOrders'
import MainLoadingUI from '../../components/Main/LoadingUI/MainLoadingUI'
import TopBrandsLoadingUI from '../../components/Main/LoadingUI/TopBrandsLoadingUI'
import Spinner from '../../components/Spinner/Spinner'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import { escapeRegExp } from '../../utils/regex'
import { colors } from '../../utils/colors'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import DeliveryIcon from '../../assets/delivery_home.png'
import BusinessCategories from '../../components/BusinessCategories'

const RESTAURANTS = gql`
  ${restaurantListPreview}
`

// const RESTAURANTS_OFFERS = gql`
//   ${restaurantsWithOffers}
// `
const SELECT_ADDRESS = gql`
  ${selectAddress}
`

const CREATE_ADDRESS = gql`
  ${createAddress}
`

function Main(props) {
  const Analytics = analytics()

  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const [busy, setBusy] = useState(false)
  const { loadingOrders, isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [search, setSearch] = useState('')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef(null)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { getAddress } = useGeocoding()

  const locationData = location
  const [hasActiveOrders, setHasActiveOrders] = useState(false)

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

  // console.log({ location })

  const { loading: loadingZone, error: errorZone } = useQuery(
    checkDeliveryZone,
    {
      variables: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }
  )

  console.log({ errorZone })

  const [selectedType, setSelectedType] = useState('restaurant')

  const [mutate, { loading: mutationLoading }] = useMutation(SELECT_ADDRESS, {
    onCompleted: (res) => {
      console.log('selected_address')
      console.log({ res })
      // requestAnimationFrame(() => {
      // modalRef.current?.close()
      setLoadingAddress(false)
      // })
    },
    onError
  })
  // const recentOrderRestaurantsVar = orderData?.recentOrderRestaurants
  const mostOrderedRestaurantsVar = orderData?.mostOrderedRestaurants
  // console.log({
  //   mostOrderedRestaurantsVar:
  //     mostOrderedRestaurantsVar[0].businessCategories[0]
  // })
  // console.log({
  //   recentOrderRestaurantsVar: recentOrderRestaurantsVar[1].businessCategories
  // })
  const newheaderColor = currentTheme.newheaderColor
  const highestRatingRestaurantData =
    dataHighRating?.highestRatingRestaurant || null
  const nearestRestaurantsData =
    dataNearestRestaurants?.nearestRestaurants || null

  const handleActiveOrdersChange = (activeOrdersExist) => {
    setHasActiveOrders(activeOrdersExist)
  }

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })

  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MAIN)
    }
    Track()
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions(
      navigationOptions({
        headerMenuBackground: currentTheme.newheaderColor,
        fontMainColor: currentTheme.darkBgFont,
        iconColorPink: currentTheme.black,
        open: onOpen,
        navigation
      })
    )
  }, [navigation, currentTheme])

  console.log({ profile })

  const onOpen = () => {
    setIsVisible(true)
    // const modal = modalRef.current
    // if (modal) {
    //   modal.open()
    // }
  }

  function onError(error) {
    console.log(error)
  }

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const {
    onScroll /* Event handler */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */
  } = useCollapsibleSubHeader()

  // const [mutateCreateAddress] = useMutation(CREATE_ADDRESS, {
  //   onCompleted: (data) => {
  //     console.log({ data })
  //     refetchProfile()
  //     dispatch(resetAddNewAddress())
  //     navigation.navigate('Main')
  //   },
  //   onError: (err) => {
  //     console.log({ err })
  //   }
  // })

  // useEffect(() => {
  //   if (profile?.firstTimeLogin) {
  //     saveFirstLoginAddress()
  //   }
  // }, [])

  // const saveFirstLoginAddress = () => {
  //   const addressInput = {
  //     _id: '',
  //     label: location.label,
  //     latitude: String(location.latitude),
  //     longitude: String(location.longitude),
  //     deliveryAddress: location.deliveryAddress,
  //     details: location.details
  //   }
  //   mutateCreateAddress({ variables: { addressInput } })
  // }

  const setAddressLocation = async (address) => {
    console.log('Selected address:', address)

    // Optional: show loading or disable button
    setLoadingAddress(true)
    setIsVisible(false)
    try {
      // Update location context
      setLocation({
        _id: address._id,
        label: address.label,
        latitude: Number(address.location.coordinates[1]),
        longitude: Number(address.location.coordinates[0]),
        deliveryAddress: address.deliveryAddress,
        details: address.details
      })

      // Trigger any side-effects if needed (optional)
      await mutate({ variables: { id: address._id } })
    } catch (error) {
      console.error('Address select failed:', error)
    }
  }
  // async function getAddress(lat, lon) {
  //   const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
  //   try {
  //     const response = await fetch(url)
  //     const data = await response.json()
  //     console.log(data)
  //     return data
  //   } catch (error) {
  //     console.error('Error fetching address:', error)
  //   }
  // }

  // const setCurrentLocation = async () => {
  //   setBusy(true)
  //   const { error, coords } = await getCurrentLocation()
  //   console.log(coords)
  //   const data = getAddress(coords.latitude, coords.longitude)
  //   console.log(data, 'data')
  //   if (data.error) {
  //     console.log('Reverse geocoding request failed:', data.error)
  //   } else {
  //     let address = data.display_name
  //     if (address.length > 21) {
  //       address = address.substring(0, 21) + '...'
  //     }

  //     if (error) navigation.navigate('SelectLocation')
  //     else {
  //       modalRef.current.close()
  //       setLocation({
  //         label: 'currentLocation',
  //         latitude: coords.latitude,
  //         longitude: coords.longitude,
  //         deliveryAddress: address
  //       })
  //       setBusy(false)
  //     }
  //     console.log(address)
  //   }
  //   console.error('Error fetching reverse geocoding data:', error)
  // }
  const setCurrentLocation = async () => {
    setBusy(true)
    const { status, canAskAgain } = await getLocationPermission()
    if (status !== 'granted' && !canAskAgain) {
      FlashMessage({
        message: t('locationPermissionMessage'),
        onPress: async () => {
          await Linking.openSettings()
        }
      })
      setBusy(false)
      return
    }
    const { error, coords, message } = await getCurrentLocation()
    console.log({ coords })
    if (error) {
      FlashMessage({
        message
      })
      setBusy(false)
      return
    }
    setBusy(false)
    getAddress(coords.latitude, coords.longitude).then((res) => {
      console.log({ res })
      if (isLoggedIn) {
        // save the location
        const addressInput = {
          _id: '',
          label: 'Home',
          latitude: String(coords.latitude),
          longitude: String(coords.longitude),
          deliveryAddress: res.formattedAddress,
          details: res.formattedAddress
        }
        mutate({ variables: { addressInput } })
        // set location
        setLocation({
          _id: '',
          label: 'Home',
          latitude: coords.latitude,
          longitude: coords.longitude,
          deliveryAddress: res.formattedAddress,
          details: res.formattedAddress
        })
      } else {
        setLocation({
          _id: '',
          label: 'Home',
          latitude: coords.latitude,
          longitude: coords.longitude,
          deliveryAddress: res.formattedAddress,
          details: res.formattedAddress
        })
      }
      refetch()
      setIsVisible(false)
    })
  }

  const modalHeader = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          style={[styles(currentTheme).addButton]}
          activeOpacity={0.7}
          onPress={setCurrentLocation}
          disabled={busy}
        >
          <View style={styles().addressSubContainer}>
            {busy ? (
              <Spinner size='small' />
            ) : (
              <>
                <SimpleLineIcons
                  name='target'
                  size={moderateScale(18)}
                  color={currentTheme.white}
                />
                <View style={styles().mL5p} />
                {/* <TextDefault bold H4>
                  {t('currentLocation')}
                </TextDefault> */}
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  const emptyView = () => {
    if (loading || mutationLoading || loadingOrders) return <MainLoadingUI />
    else {
      return (
        <View style={styles(currentTheme).emptyViewContainer}>
          <View style={styles(currentTheme).emptyViewBox}>
            <TextDefault bold H4 center textColor={currentTheme.fontMainColor}>
              {t('notAvailableinYourArea')}
            </TextDefault>
            <TextDefault textColor={currentTheme.fontGrayNew} center>
              {t('noRestaurant')}
            </TextDefault>
          </View>
        </View>
      )
    }
  }

  const modalFooter = () => (
    <View style={styles().addNewAddressbtn}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles(currentTheme).addButton}
          onPress={() => {
            if (isLoggedIn) {
              // navigation.navigate('AddNewAddressUser')
              navigation.navigate('AddressNewVersion')
            } else {
              navigation.navigate('Login')
            }
            setIsVisible(false)
            // const modal = modalRef.current
            // modal?.close()
          }}
        >
          <View style={styles().addressSubContainer}>
            <AntDesign
              name='pluscircleo'
              size={moderateScale(20)}
              color={currentTheme.white}
            />
            <View style={styles().mL5p} />
            <TextDefault bold H4>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles().addressTick}></View>
    </View>
  )

  const restaurants = data?.nearByRestaurantsPreview?.restaurants

  const searchAllShops = (searchText) => {
    if (!searchText) return []

    const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
    const regex = new RegExp(escapedSearchText, 'i')

    return restaurants.filter((restaurant) => regex.test(restaurant.name))
  }

  const onModalClose = () => {
    setIsVisible(false)
  }

  if (error)
    return (
      <ErrorView
        wentWrong={t('somethingWentWrong')}
        message={t('checkInternet')}
      />
    )

  // if (errorZone)
  //   return (
  //     <ErrorView
  //       // wentWrong={t('somethingWentWrong')}
  //       message={t('city_location_no_deliveryzone')}
  //     >
  //       <MainModalize
  //         isVisible={isVisible}
  //         isLoggedIn={isLoggedIn}
  //         addressIcons={addressIcons}
  //         modalHeader={modalHeader}
  //         modalFooter={modalFooter}
  //         setAddressLocation={setAddressLocation}
  //         profile={profile}
  //         location={location}
  //         loading={loadingAddress}
  //         onClose={onModalClose}
  //         otlobMandoob={false}
  //       />
  //     </ErrorView>
  //   )

  return (
    <>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles().flex}>
        <View
          style={[
            styles().flex,
            styles(currentTheme).screenBackground
            // { paddingBottom: 120 }
          ]}
        >
          <View style={styles().flex}>
            <View style={styles().mainContentContainer}>
              <View style={[styles().flex, styles().subContainer]}>
                <View
                  style={[
                    styles(currentTheme).searchbar,
                    { backgroundColor: colors.primary }
                  ]}
                >
                  <Search
                    setSearch={setSearch}
                    search={search}
                    newheaderColor={newheaderColor}
                    placeHolder={t('searchRestaurant')}
                  />
                </View>
                {search ? (
                  <View
                    style={{
                      ...styles().searchList
                    }}
                  >
                    <Animated.FlatList
                      contentInset={{
                        top: containerPaddingTop
                      }}
                      contentContainerStyle={{
                        paddingTop:
                          Platform.OS === 'ios' ? 0 : containerPaddingTop
                      }}
                      contentOffset={{
                        y: -containerPaddingTop
                      }}
                      onScroll={onScroll}
                      scrollIndicatorInsets={{
                        top: scrollIndicatorInsetTop
                      }}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={emptyView()}
                      keyExtractor={(item, index) => index.toString()}
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
                      data={searchAllShops(search)}
                      renderItem={({ item }) => <Item item={item} />}
                    />
                  </View>
                ) : (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {/* business categories */}
                    <BusinessCategories />

                    <View
                      style={{
                        marginVertical: 20,
                        marginHorizontal: 20,
                        flexDirection: isArabic ? 'row-reverse' : 'row',
                        gap: 20
                      }}
                    >
                      <TouchableOpacity
                        style={styles().mainItem}
                        onPress={() =>
                          navigation.navigate('Menu', {
                            selectedType: 'restaurant'
                          })
                        }
                      >
                        <View>
                          <TextDefault
                            H4
                            bolder
                            textColor={currentTheme.fontThirdColor}
                            style={{
                              ...styles().ItemName,
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            {t('foodDelivery')}
                          </TextDefault>
                          <TextDefault
                            Normal
                            textColor={currentTheme.fontThirdColor}
                            style={{
                              ...styles().ItemDescription,
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            {t('OrderfoodLove')}
                          </TextDefault>
                        </View>
                        <Image
                          source={require('../../assets/images/ItemsList/menu_new.png')}
                          style={styles().popularMenuImg}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles().mainItem}
                        onPress={() => {
                          if (!isLoggedIn) {
                            navigation.navigate('Login')
                          } else {
                            navigation.navigate('RequestDelivery')
                          }
                        }}
                      >
                        <View>
                          <TextDefault
                            H4
                            bolder
                            textColor={currentTheme.fontThirdColor}
                            style={{
                              ...styles().ItemName,
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            {t('RequestDelivery')}
                          </TextDefault>
                          <TextDefault
                            Normal
                            textColor={currentTheme.fontThirdColor}
                            style={{
                              ...styles().ItemDescription,
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            {t('order_from_anywhere')}
                          </TextDefault>
                        </View>
                        <Image
                          source={DeliveryIcon}
                          style={{
                            ...styles().popularMenuImg
                            // marginInline: 'auto'
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                    {/* the second section */}

                    <View style={{ marginTop: 0 }}>
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
                        {nearestRestaurantsData &&
                          nearestRestaurantsData.length > 0 && (
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

                    {/* the therd section */}
                    <View
                      style={{
                        ...styles(currentTheme, hasActiveOrders)
                          .topBrandsMargin,
                        marginTop: 20
                      }}
                    >
                      {orderLoading ? <TopBrandsLoadingUI /> : <TopBrands />}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
          {isLoggedIn && (
            <ActiveOrders onActiveOrdersChange={handleActiveOrdersChange} />
          )}

          <MainModalize
            isVisible={isVisible}
            // currentTheme={currentTheme}
            isLoggedIn={isLoggedIn}
            addressIcons={addressIcons}
            modalHeader={modalHeader}
            modalFooter={modalFooter}
            setAddressLocation={setAddressLocation}
            profile={profile}
            location={location}
            loading={loadingAddress}
            onClose={onModalClose}
            otlobMandoob={false}
          />
        </View>
      </SafeAreaView>
    </>
  )
}

export default Main
