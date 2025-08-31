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
  StatusBar,
  Modal
} from 'react-native'
import { AntDesign, Ionicons, SimpleLineIcons } from '@expo/vector-icons' // for icons
import { useNavigation } from '@react-navigation/native'
import MainLoadingUI from '../../components/Main/LoadingUI/MainLoadingUI'
import {
  getBusinessCategoriesCustomer,
  highestRatingRestaurant,
  nearestRestaurants,
  restaurantListPreview,
  restaurantsWithOffers,
  searchRestaurants,
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const isArabic = i18n.language === 'ar'
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { getAddress } = useGeocoding()

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }
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
    error: errorTopRated
  } = useQuery(topRatedVendorsInfo, {
    variables: {
      latitude: location?.latitude,
      longitude: location?.longitude
    },
    fetchPolicy: 'network-only'
  })

  const {
    data: dataSearch,
    loading: loadingSearch,
    error: errorSearch
  } = useQuery(searchRestaurants, {
    variables: {
      search,
      longitude: location.longitude,
      latitude: location.latitude
    },
    fetchPolicy: 'network-only'
  })

  // const businessCategories =
  //   dataBusinessCategories?.getBusinessCategoriesCustomer || null

  const mostOrderedRestaurantsVar = orderData?.mostOrderedRestaurants || null
  const highestRatingRestaurantData =
    dataHighRating?.highestRatingRestaurant || null
  const nearestRestaurantsData =
    dataNearestRestaurants?.nearestRestaurants || null
  const topRatedRestaurants = dataTopRated?.topRatedVendorsPreview || null
  const filteredRestaurants = dataSearch?.searchRestaurants || null

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
      setIsVisible(false)
    })
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

  const renderTopRestaurants = (item) => {
    const businessCategoriesNames =
      (item?.businessCategories || [])
        .map((cat) => cat.name)
        .filter(Boolean)
        .join(', ') || null

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text
            style={{
              ...styles.cardTitle,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {item.name}
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
            <Text style={styles.metaText}>⏱ {item.deliveryTime}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      // stickyHeaderIndices={[1]} // 👈 index of the header child
      // showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
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
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
                transform: [{ scaleX: isArabic ? -1 : 1 }]
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsVisible(true)}>
            <Text style={styles.headerSubtitle}>{t('deliver_to')}</Text>
            <Text style={styles.headerTitle}>{location?.label} ▼</Text>
          </TouchableOpacity>
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
      <View
        style={{
          ...styles.searchBar,
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
      >
        <Ionicons name='search-outline' size={18} color='gray' />
        <TouchableOpacity
          style={styles.inputLike}
          onPress={() => setSearchOpen(true)}
        >
          <Text
            style={{ color: '#bbb', textAlign: isArabic ? 'right' : 'left' }}
          >
            {t('search_for_restaurants')}
          </Text>
        </TouchableOpacity>
        {/* <TextInput
          placeholder={t('search_for_restaurants')}
          style={styles.searchInput}
          placeholderTextColor='gray'
        /> */}
      </View>

      {/* Categories */}
      <BusinessCategories />
      {/* <FlatList
        data={businessCategories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => renderCategory(item)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
      /> */}

      <View style={{ marginTop: 20 }}>
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
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('TopBrandsScreen', {
            topRatedVendorsPreview: dataTopRated?.topRatedVendorsPreview
          })
        }
        style={{
          ...styles.sectionHeader,
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
      >
        <Text style={styles.sectionTitle}>{t('highest_rated')}</Text>
        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Text style={styles.sectionLink}>{t('see_all')} </Text>
          <AntDesign name='arrowleft' size={18} color='black' />
        </View>
      </TouchableOpacity>
      {topRatedRestaurants?.map((item) => renderTopRestaurants(item))}

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

      {/* Search Modal */}
      <Modal visible={searchOpen} animationType='slide'>
        <View style={styles.modalContainer}>
          {/* Search Bar */}
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_for_restaurants')}
            placeholderTextColor={'#999'}
            value={search}
            onChangeText={setSearch}
          />

          {/* Restaurant List */}
          <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderTopRestaurants(item)}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSearchOpen(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff'
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
    padding: 12,
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
