import React, { Fragment, useContext, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView
} from 'react-native'
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons
} from '@expo/vector-icons' // for icons
import { useNavigation } from '@react-navigation/native'
import MainLoadingUI from '../../components/Main/LoadingUI/MainLoadingUI'
import {
  checkDeliveryZone,
  featuredRestaurants,
  getBusinessCategoriesCustomer,
  highestRatingRestaurant,
  nearestRestaurants,
  restaurantListPreview,
  restaurantsWithOffers,
  searchRestaurantsCustomer,
  topRatedVendorsInfo
} from '../../apollo/queries'
import useHomeRestaurants from '../../ui/hooks/useRestaurantOrderInfo'
import { gql, useMutation, useQuery } from '@apollo/client'
import { LocationContext } from '../../context/Location'
import MainRestaurantCard from '../../components/Main/MainRestaurantCard/MainRestaurantCard'
import BusinessCategories from '../../components/BusinessCategories'
import UserContext from '../../context/User'
import { useTranslation } from 'react-i18next'
import { moderateScale } from '../../utils/scaling'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import { selectAddress } from '../../apollo/mutations'
import { colors } from '../../utils/colors'
import { alignment } from '../../utils/alignment'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { StarRatingDisplay } from 'react-native-star-rating-widget'
import JSONTree from 'react-native-json-tree'
import { useLocation } from '../../ui/hooks'
import useGeocoding from '../../ui/hooks/useGeocoding'
import Spinner from '../../components/Spinner/Spinner'
import ErrorView from '../../components/ErrorView/ErrorView'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { Divider } from 'react-native-paper'
import ActiveOrders from '../../components/Main/ActiveOrders/ActiveOrders'
import MiddleRestaurantsSection from '../../components/Main/MiddleRestaurantsSection'
import MainV2Header from '../../components/Main/MainV2Header'
import truncate from '../../utils/helperFun'
import { setRestaurant } from '../../store/restaurantSlice'
import { useDispatch } from 'react-redux'
import ConfigurationContext from '../../context/Configuration'

const RESTAURANTS = gql`
  ${restaurantListPreview}
`

const SELECT_ADDRESS = gql`
  ${selectAddress}
`
export default function FoodTab() {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [busy, setBusy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [hasActiveOrders, setHasActiveOrders] = useState(false)
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const isArabic = i18n.language === 'ar'
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { getAddress } = useGeocoding()
  const configuration = useContext(ConfigurationContext)

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }
  const { location, setLocation } = useContext(LocationContext)
  const {
    cartCount,
    isLoggedIn,
    profile,
    restaurant: restaurantCart,
    clearCart,
    cart
  } = useContext(UserContext)

  console.log({ location })

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

  // console.log({
  //   data: data?.nearByRestaurantsPreview.restaurants[0].deliveryFee
  // })

  const {
    orderLoading,
    orderError,
    orderData,
    refetchRecentOrderRestaurants,
    refetchMostOrderedRestaurants
  } = useHomeRestaurants()
  const {
    data: dataWithOffers,
    loading: loadingWithOffers,
    error: errorWithOffers,
    refetch: refetchOffers
  } = useQuery(restaurantsWithOffers, {
    variables: {
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'no-cache'
  })

  const restaurantsWithOffersData = dataWithOffers?.restaurantsWithOffers || []

  const {
    data: dataHighRating,
    loading: loadingHighRating,
    error: errorHighRating,
    refetch: refetchHighRating
  } = useQuery(highestRatingRestaurant, {
    variables: {
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'no-cache'
  })

  const {
    data: dataFeatured,
    loading: loadingFeatured,
    error: errorFeatured,
    refetch: refetchFeatured
  } = useQuery(featuredRestaurants, {
    variables: {
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'no-cache'
  })
  // const {
  //   data: dataNearestRestaurants,
  //   loading: loadingNearestRestaurants,
  //   error: errorNearestRestaurants,
  //   refetch: refetchNearestRestaurants
  // } = useQuery(nearestRestaurants, {
  //   variables: {
  //     longitude: location.longitude,
  //     latitude: location.latitude
  //   },
  //   fetchPolicy: 'no-cache'
  // })

  // const {
  //   data: dataBusinessCategories,
  //   loading: loadingBusinessCategories,
  //   error: errorBusinessCategories
  // } = useQuery(getBusinessCategoriesCustomer, {
  //   fetchPolicy: 'no-cache'
  // })

  const {
    data: dataTopRated,
    loading: loadingTopRated,
    error: errorTopRated,
    refetch: refetchTopRated
  } = useQuery(topRatedVendorsInfo, {
    variables: {
      latitude: location?.latitude,
      longitude: location?.longitude
    },
    fetchPolicy: 'network-only'
  })

  // const {
  //   data: dataSearch,
  //   loading: loadingSearch,
  //   error: errorSearch
  // } = useQuery(searchRestaurantsCustomer, {
  //   variables: {
  //     search,
  //     longitude: location.longitude,
  //     latitude: location.latitude
  //   },
  //   fetchPolicy: 'network-only'
  // })

  // const businessCategories =
  //   dataBusinessCategories?.getBusinessCategoriesCustomer || null

  const mostOrderedRestaurantsVar = orderData?.mostOrderedRestaurants || null
  const highestRatingRestaurantData =
    dataHighRating?.highestRatingRestaurant || null
  // const nearestRestaurantsData =
  //   dataNearestRestaurants?.nearestRestaurants || null
  // const topRatedRestaurants = dataTopRated?.topRatedVendorsPreview || null
  const allRestaurants = data?.nearByRestaurantsPreview?.restaurants || null
  const featuredRestaurantsVar = dataFeatured?.featuredRestaurants || null
  // const filteredRestaurants = dataSearch?.searchRestaurantsCustomer || null

  const [mutateAddress, { loading: mutationLoading }] = useMutation(
    SELECT_ADDRESS,
    {
      onCompleted: (res) => {
        console.log({ res })
        setLoadingAddress(false)
      },
      onError: (err) => {
        console.error('select_address_error', err)
        setLoadingAddress(false)
      }
    }
  )

  useLayoutEffect(() => {
    // Hide the header
    navigation.setOptions({
      headerShown: false
    })
  }, [])

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
      await mutateAddress({ variables: { id: address._id } })
    } catch (error) {
      console.error('Address select failed:', error)
    }
  }

  const onModalClose = () => {
    setIsVisible(false)
  }

  const setCurrentLocation = async () => {
    setBusy(true)
    setIsVisible(false)
    const { status, canAskAgain } = await getLocationPermission()
    if (status !== 'granted' && !canAskAgain) {
      FlashMessage({
        message: t('locationPermissionMessage'),
        onPress: async () => {
          await Linking.openSettings()
        },
        duration: 10000
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
        mutateAddress({ variables: { addressInput } })
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
      refetchHighRating()
      refetchOffers()
      // refetchNearestRestaurants()
      setIsVisible(false)
    })
  }

  const handleActiveOrdersChange = (activeOrdersExist) => {
    setHasActiveOrders(activeOrdersExist)
  }

  const modalHeader = () => (
    <View style={[styles.addNewAddressbtn]}>
      <View style={styles.addressContainer}>
        <TouchableOpacity
          style={[styles.addButton]}
          activeOpacity={0.7}
          onPress={setCurrentLocation}
          disabled={busy}
        >
          <View style={styles.addressSubContainer}>
            {busy ? (
              <Spinner size='small' />
            ) : (
              <>
                <SimpleLineIcons
                  name='target'
                  size={moderateScale(18)}
                  color={'#fff'}
                />
                <View style={styles.mL5p} />
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

  const modalFooter = () => (
    <View style={styles.addNewAddressbtn}>
      <View style={styles.addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.addButton}
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
          <View
            style={{
              ...styles.addressSubContainer,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <AntDesign
              name='pluscircleo'
              size={moderateScale(20)}
              color={'#fff'}
            />
            <View style={styles.mL5p} />
            <TextDefault bold H4>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.addressTick}></View>
    </View>
  )

  // const renderCategory = (item) => (
  //   <TouchableOpacity style={styles.categoryChip}>
  //     {/* <Text style={styles.categoryIcon}>{item.image}</Text> */}
  //     <View>
  //       <Image
  //         source={{ uri: item.image.url }}
  //         style={{ width: 24, height: 24, borderRadius: 12, marginRight: 6 }}
  //       />
  //     </View>
  //     <Text style={styles.categoryText}>{item.name}</Text>
  //   </TouchableOpacity>
  // )

  const handleShowRestaurant = (item) => {
    if (cart?.length && restaurantCart !== item._id) {
      Alert.alert(
        '',
        t('cartClearWarning'),
        [
          {
            text: t('Cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: t('okText'),
            onPress: async () => {
              clearCart()
              navigation.navigate('Restaurant', { ...item })
            }
          }
        ],
        { cancelable: false }
      )
    } else {
      navigation.navigate('Restaurant', { ...item })
    }
    dispatch(setRestaurant({ restaurantId: item._id }))
  }

  const renderTopRestaurants = (item) => {
    const businessCategoriesNames =
      (item?.businessCategories || [])
        .map((cat) => cat.name)
        .filter(Boolean)
        .join(', ') || null

    return (
      <TouchableOpacity
        onPress={() => handleShowRestaurant(item)}
        style={styles.card}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text
            style={{
              ...styles.cardTitle,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {truncate(item.name, 35)}
          </Text>
          {businessCategoriesNames?.length ? (
            <View>
              <TextDefault
                style={{
                  color: '#000',
                  textAlign: isArabic ? 'right' : 'left'
                }}
              >
                {businessCategoriesNames?.substring(0, 60)}...
              </TextDefault>
            </View>
          ) : null}
          <View
            style={{
              ...styles.cardMeta
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}
            >
              <StarRatingDisplay
                rating={item?.reviewAverage || 0}
                color={'orange'}
                emptyColor='orange'
                enableHalfStar={true}
                starSize={moderateScale(20)}
              />
              <Text style={styles.metaText}>{item.reviewAverage}</Text>
            </View>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <MaterialIcons
                name='directions-bike'
                size={moderateScale(16)}
                color={'#000'}
              />
              <Text style={{ color: '#000', fontSize: moderateScale(12) }}>
                {item.deliveryFee?.amount} {configuration.currency}
              </Text>
            </View>
            <Text style={styles.metaText}>⏱ {item.deliveryTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (error) {
    return (
      <ErrorView
        wentWrong={t('somethingWentWrong')}
        message={t('checkInternet')}
      />
    )
  }

  const onRefresh = () => {
    setRefreshing(true)
    refetchOffers()
    refetchHighRating()
    refetchFeatured()
    refetch()
    refetchRecentOrderRestaurants()
    refetchMostOrderedRestaurants()
    setTimeout(() => setRefreshing(false), 2000) // simulate fetching
  }

  const allErrorsZone =
    errorZone &&
    !restaurantsWithOffersData?.length &&
    !loadingWithOffers &&
    !allRestaurants?.length &&
    !loading &&
    !featuredRestaurantsVar?.length &&
    !loadingFeatured &&
    !mostOrderedRestaurantsVar?.length &&
    !orderLoading

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#fff'
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
        <MainV2Header
          styles={styles}
          setIsVisible={setIsVisible}
          cartCount={cartCount}
          location={location}
        />

        <Fragment>
          {/* Search */}
          <View
            style={{
              ...styles.searchBar,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <Ionicons name='search-outline' size={18} color='gray' />
            <TouchableOpacity
              style={styles.inputLike}
              onPress={() => navigation.navigate('Menu')}
            >
              <Text
                style={{
                  color: '#bbb',
                  textAlign: isArabic ? 'right' : 'left'
                }}
              >
                {t('search_for_restaurants')}{' '}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <BusinessCategories />

          {allErrorsZone ? (
            <ErrorView
              // wentWrong={t('somethingWentWrong')}
              message={t('city_location_no_deliveryzone')}
            >
              <MainModalize
                isVisible={isVisible}
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
            </ErrorView>
          ) : (
            <Fragment>
              {/* Top restaurants section */}
              <MiddleRestaurantsSection
                restaurantsWithOffersData={restaurantsWithOffersData}
                mostOrderedRestaurantsVar={mostOrderedRestaurantsVar}
                // highestRatingRestaurantData={highestRatingRestaurantData}
                // nearestRestaurantsData={nearestRestaurantsData}
                featuredRestaurants={featuredRestaurantsVar}
              />

              {/* Restaurants */}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Menu', {
                    highlight: true,
                    title: 'all_businesses'
                  })
                }}
                style={{
                  ...styles.sectionHeader,
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                }}
              >
                <Text style={styles.sectionTitle}>{t('all_businesses')}</Text>
                <View
                  style={{
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Text style={styles.sectionLink}>{t('see_all')} </Text>
                  <AntDesign
                    name={isArabic ? 'arrowleft' : 'arrowright'}
                    size={18}
                    color='black'
                  />
                </View>
              </TouchableOpacity>
              <View style={{ paddingBottom: hasActiveOrders ? 180 : 0 }}>
                {allRestaurants?.map((item) => renderTopRestaurants(item))}
              </View>
            </Fragment>
          )}
        </Fragment>
        {/* )} */}

        <MainModalize
          isVisible={isVisible}
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
      </ScrollView>
      {isLoggedIn && (
        <ActiveOrders onActiveOrdersChange={handleActiveOrdersChange} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff'
  },
  headerSubtitle: {
    fontSize: moderateScale(14),
    // color: 'tomato',
    color: colors.primary,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600'
  },
  cartWrapper: {
    position: 'relative',
    // backgroundColor: '#000',
    borderRadius: 50
    // padding: 8
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -5,
    // backgroundColor: 'tomato',
    backgroundColor: colors.primary,
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
    marginBottom: 10
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
    marginBottom: 20,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: moderateScale(16),
     fontWeight: '600'
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
    height: 140 // default 160
  },
  cardInfo: {
    padding: 12
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700'
  },
  cardTags: {
    fontSize: moderateScale(13),
    color: 'gray',
    marginVertical: 4
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  metaText: {
    fontSize: moderateScale(12),
    color: 'gray'
  },
  addNewAddressbtn: {
    padding: moderateScale(5),
    ...alignment.PLmedium,
    ...alignment.PRmedium
  },
  addressContainer: {
    width: '100%',
    gap: 5,
    ...alignment.PTsmall,
    ...alignment.PBsmall
  },
  addButton: {
    backgroundColor: colors.primary,
    width: '100%',
    height: moderateScale(40),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  addressSubContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  inputLike: {
    // padding: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    width: '100%'
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  closeButton: {
    backgroundColor: '#ff4d4d', // red background
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
    // marginVetical: 10,
    width: '100%'
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center'
  }
})
