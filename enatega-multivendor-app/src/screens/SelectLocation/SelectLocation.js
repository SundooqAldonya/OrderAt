import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
  Fragment
} from 'react'
import {
  View,
  TouchableOpacity,
  StatusBar,
  Linking,
  I18nManager,
  SafeAreaView,
  ScrollView,
  Text,
  Modal,
  StyleSheet,
  Platform
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import styles from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import screenOptions from './screenOptions'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useLocation } from '../../ui/hooks'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { mapStyle } from '../../utils/mapStyle'
import CustomMarker from '../../assets/SVG/imageComponents/CustomMarker'
import analytics from '../../utils/analytics'
import {
  Feather,
  EvilIcons,
  MaterialIcons,
  FontAwesome
} from '@expo/vector-icons'
import { customMapStyle } from '../../utils/customMapStyles'
import { useTranslation } from 'react-i18next'
import ModalDropdown from '../../components/Picker/ModalDropdown'
import Spinner from '../../components/Spinner/Spinner'
import { colors } from '../../utils/colors'
import { LocationContext } from '../../context/Location'
import useGeocoding from '../../ui/hooks/useGeocoding'
import * as Location from 'expo-location'
import UserContext from '../../context/User'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { createAddress } from '../../apollo/mutations'
import { moderateScale } from '../../utils/scaling'
import navigationService from '../../routes/navigationService'
import { HeaderBackButton } from '@react-navigation/elements'
import { Image } from 'react-native'
import useEnvVars from '../../../environment'
import { getCityAreas } from '../../apollo/queries'
import { alignment } from '../../utils/alignment'
import { useSelector } from 'react-redux'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { v4 as uuidv4 } from 'uuid'
import CustomPlacesAutocomplete from '../../components/CustomPlacesAutocomplete'

const CREATE_ADDRESS = gql`
  ${createAddress}
`

const GET_CITIES_AREAS = gql`
  ${getCityAreas}
`
const LATITUDE = 30.04442
const LONGITUDE = 31.235712
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = 0.01

export default function SelectLocation(props) {
  const { i18n, t } = useTranslation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  console.log({ GOOGLE_MAPS_KEY })
  const city = useSelector((state) => state.city.city)
  const isArabic = i18n.language === 'ar'

  // const { longitude, latitude, areaCoords } = props.route.params || {}
  const params = props?.route?.params || {}
  const { longitude, latitude } = params
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()
  const inset = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef()
  const searchRef = useRef()
  const [sessionToken, setSessionToken] = useState(uuidv4())

  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { setLocation } = useContext(LocationContext)
  const { getAddress } = useGeocoding()
  const { isLoggedIn } = useContext(UserContext)

  const [areasModalVisible, setAreasModalVisible] = useState(false)
  const [citiesModalVisible, setCitiesModalVisible] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)

  const [coordinates, setCoordinates] = useState({
    latitude: latitude || 31.1091,
    longitude: longitude || 30.9426,
    latitudeDelta: latitude ? 0.003 : LATITUDE_DELTA,
    longitudeDelta: longitude ? 0.003 : LONGITUDE_DELTA
  })
  const [modalVisible, setModalVisible] = useState(false)

  const [
    fetchAreas,
    { data: dataAreas, loading: loadingAreas, error: errorAreas }
  ] = useLazyQuery(GET_CITIES_AREAS)

  console.log({ dataAreas })

  const areasList = dataAreas?.areasByCity || null

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('set_your_delivery_address'),
      // setCurrentLocation: getCurrentPosition,
      headerLeft: () => {
        // if (isLoggedIn) {
        return (
          <HeaderBackButton
            truncatedLabel=''
            backImage={() => (
              <View>
                <MaterialIcons name='arrow-back' size={moderateScale(20)} color={'black'} />
              </View>
            )}
            style={{ marginLeft: 10 }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
        // }
      },
      headerRight: () => {
        return (
          <View style={{ flexDirection: 'row', marginRight: 10 }}>
            <TouchableOpacity
              onPress={getCurrentPosition}
              style={{ marginRight: 15 }}
            >
              <MaterialIcons name='my-location' size={moderateScale(20)} color='black' />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('SelectLanguageScreen')}
            >
              <FontAwesome name='language' size={moderateScale(20)} color='black' />
            </TouchableOpacity>
          </View>
        )
      },
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        fontWeight: 'bold',
        fontSize: moderateScale(16),
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG,
        elevation: 0,
      }
    })
  }, [])

  // console.log({ areaCoords })

  // useEffect(() => {
  //   if (areaCoords && mapRef?.current) {
  //     const newRegion = {
  //       latitude: areaCoords[1],
  //       longitude: areaCoords[0],
  //       latitudeDelta: 0.01,
  //       longitudeDelta: 0.01
  //     }

  //     // Animate the map
  //     mapRef.current.animateToRegion(newRegion, 1000)

  //     // Update state to match the animated region
  //     setCoordinates(newRegion)
  //   }
  // }, [areaCoords])

  useEffect(() => {
    if (!mapRef.current) return
    const lat = city?.location?.location?.coordinates?.[1]
    const lng = city?.location?.location?.coordinates?.[0]
    if (lat && lng && mapRef.current) {
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }
      mapRef.current.animateToRegion(newRegion, 1000)
      setCoordinates((prev) => ({ ...prev, latitude: lat, longitude: lng }))
    }
  }, [city])

  useEffect(() => {
    StatusBar.setBackgroundColor(colors.primary)
    StatusBar.setBarStyle('light-content')
  }, [])

  useEffect(() => {
    if (!coordinates.latitude) {
      getCurrentPosition()
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setMapLoaded(true), 3000) // fallback
    return () => clearTimeout(timeout)
  }, [])

  const getCurrentPosition = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      console.log({ status })
      if (status !== 'granted') {
        FlashMessage({
          message: 'Location permission denied. Please enable it in settings.',
          onPress: async () => {
            await Linking.openSettings()
          }
        })
        return
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 0,
        timeout: 5000
      })
      console.log('Current Position:', position.coords)
      // const lat =
      // getAddress(coordinates.latitude, coordinates.longitude).then((res) => {
      const newCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }
      setCoordinates((prev) => ({
        ...prev, // Creates a new reference
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }))
      if (mapRef.current) {
        mapRef.current.animateToRegion(newCoordinates, 1000) // Moves the map smoothly
      }
      // })
    } catch (error) {
      console.log('Error fetching location:', error)
      FlashMessage({ message: 'Failed to get current location. Try again.' })
    }
  }

  const [mutate] = useMutation(CREATE_ADDRESS, {
    onCompleted: (data) => {
      console.log({ data })
      navigation.navigate('Main')
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  const setCurrentLocation = async () => {
    setLoading(true)
    const { status, canAskAgain } = await getLocationPermission()
    if (status !== 'granted' && !canAskAgain) {
      FlashMessage({
        message: t('locationPermissionMessage'),
        onPress: async () => {
          await Linking.openSettings()
        }
      })
      setLoading(false)
      return
    }
    const { error, coords, message } = await getCurrentLocation()
    console.log({ coords })
    if (error) {
      FlashMessage({
        message
      })
      setLoading(false)
      return
    }
    setLoading(false)
    // setCoordinates({ latitude: coords.latitude, longitude: coords.longitude })
    try {
      getAddress(coordinates.latitude, coordinates.longitude).then((res) => {
        console.log({ res })
        if (isLoggedIn) {
          // save the location
          const addressInput = {
            _id: '',
            label: 'Home',
            latitude: String(coordinates.latitude),
            longitude: String(coordinates.longitude),
            deliveryAddress: res.formattedAddress,
            details: res.formattedAddress
          }
          mutate({ variables: { addressInput } })
          // set location
          setLocation({
            _id: '',
            label: 'Home',
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            deliveryAddress: res.formattedAddress,
            details: res.formattedAddress
          })
        } else {
          setLocation({
            _id: '',
            label: 'Home',
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            deliveryAddress: res.formattedAddress,
            details: res.formattedAddress
          })
        }
      })
    } catch (err) {
      console.log({ err })
    }
  }

  const setAreaLocation = async () => {
    setLoading(true)
    try {
      getAddress(coordinates.latitude, coordinates.longitude).then((res) => {
        console.log({ res })
        setLocation({
          _id: '',
          label: 'Home',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          deliveryAddress: res.formattedAddress,
          details: res.formattedAddress
        })
      })
      if (isLoggedIn) {
        navigation.navigate('Main')
      }
    } catch (err) {
      console.log({ err })
    }
  }

  const onRegionChangeComplete = (coords) => {
    console.log({ coords })
    setCoordinates({
      ...coordinates,
      longitude: coords.longitude,
      latitude: coords.latitude
    })
  }

  // when press map
  const handleMapPress = (e) => {
    const newCoords = e.nativeEvent.coordinate
    setCoordinates({
      ...coordinates,
      latitude: newCoords.latitude,
      longitude: newCoords.longitude
    })
  }

  console.log()

  const onItemPress = () => {
    setModalVisible(false)
    console.log({ city })
    // setSelectedCity(city)
    fetchAreas({ variables: { id: city._id } })
    setAreasModalVisible(true)
    // navigation.navigate('AddNewAddress', {
    //   city,
    //   prevScreen: props?.route?.params?.prevScreen
    //     ? props.route.params.prevScreen
    //     : null
    // })
  }

  // const selectThisLocation = () => {

  // }

  const handleSaveLocation = () => {
    // if (areaCoords) {
    setAreaLocation()
    // } else {
    //   setCurrentLocation()
    // }
  }

  const handleChooseArea = (area) => {
    setSelectedArea(area)
    const newCoordinates = {
      latitude: area?.location.location.coordinates[1],
      longitude: area?.location.location.coordinates[0],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }
    setCoordinates({ ...newCoordinates })
    mapRef.current.animateToRegion(newCoordinates, 1000)
    setAreasModalVisible(false)
  }

  // console.log({ selectedArea: selectedArea?.location.location })

  // const handleShowAreas = () => {
  //   setAreasModalVisible(true)
  //   fetchAreas({ variables: { id: city._id } })
  // }

  return (
    <Fragment>
      <View style={styles().flex}>
        <View
          style={[
            styles().mapView,
            {
              height: '85%'
            }
          ]}
        >
          {/* {coordinates.latitude ? ( */}
          <Fragment>
            <View style={{ flex: 1 }}>
              <View style={styles1.searchContainer}>
                <CustomPlacesAutocomplete
                  ref={searchRef}
                  placeholder={t('find_place')}
                  predefinedPlaces={[]}
                  predefinedPlacesAlwaysVisible={false}
                  onPress={(data, details = null) => {
                    const lat = details?.geometry?.location?.lat
                    const lng = details?.geometry?.location?.lng

                    if (lat && lng) {
                      const newLocation = { latitude: lat, longitude: lng }
                      // setLocation(newLocation)
                      setCoordinates({ ...coordinates, ...newLocation })
                      mapRef.current.animateToRegion({
                        ...newLocation,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                      })
                    }
                  }}
                  query={{
                    key: GOOGLE_MAPS_KEY,
                    language: isArabic ? 'ar' : 'en',
                    sessiontoken: sessionToken,
                    region: 'EG',
                    components: 'country:eg'
                  }}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  textInputProps={{
                    placeholderTextColor: '#999'
                  }}
                  styles={{
                    textInputContainer: {
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOpacity: 0.2,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 5,
                      zIndex: 999999999
                    },
                    textInput: {
                      paddingVertical: Platform.OS === 'ios' ? moderateScale(16) : 0,
                      color: '#000',
                      fontSize: moderateScale(16),
                      textAlign: isArabic ? 'right' : 'left',
                    },
                    listView: {
                      backgroundColor: '#fff',
                      zIndex: 9999, // crucial
                      elevation: 10
                    }
                  }}
                />
              </View>
              <MapView
                ref={mapRef}
                initialRegion={coordinates}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_GOOGLE}
                onRegionChangeComplete={onRegionChangeComplete}
                onPress={handleMapPress}
                zoomEnabled
                maxZoomLevel={50}
                bounce
                onMapReady={() => {
                  console.log('Map is ready')
                  setMapLoaded(true)
                }}
                // cacheEnabled={true}
              />

              {!mapLoaded && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    zIndex: 1
                  }}
                >
                  {/* <TextDefault style={{ color: '#000' }}>
                  Loading map...
                </TextDefault> */}
                  <Image
                    source={{
                      uri: `https://maps.googleapis.com/maps/api/staticmap?center=30.033333,31.233334&zoom=10&size=600x300&maptype=roadmap%7C30.033333,31.233334&key=AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY
`
                    }} // use Google Static Maps API
                    style={{ width: '100%', height: '100%' }}
                    resizeMode='cover'
                  />
                </View>
              )}
            </View>
            <View
              pointerEvents='none'
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -25 }, { translateY: -50 }], // center the marker
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <View style={styles().deliveryMarker}>
                <View
                  style={[
                    styles().markerBubble,
                    { backgroundColor: '#06C167' }
                  ]}
                >
                  <Text style={styles().markerText}>
                    {t('your_order_delivered_here')}
                  </Text>
                </View>
                <View style={styles().markerPin}>
                  <View
                    style={[styles().pinInner, { backgroundColor: '#06C167' }]}
                  />
                </View>
              </View>
            </View>
            {/* <View style={styles().mainContainer}>
                <CustomMarker
                  width={40}
                  height={40}
                  transform={[{ translateY: -20 }]}
                  translateY={-20}
                />
              </View> */}
          </Fragment>
          {/* ) : null} */}
        </View>
        <SafeAreaView>
          <ScrollView>
            <View style={styles(currentTheme).container}>
              {/* <TextDefault
                textColor={currentTheme.newFontcolor}
                H3
                bolder
                Left
                style={styles().heading}
              >
                {t('choose_delivery_address')}
              </TextDefault>
              <View style={styles(currentTheme).line} /> */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles(currentTheme).solidButton,
                  { flexDirection: isArabic ? 'row-reverse' : 'row', gap: 5 }
                ]}
                onPress={onItemPress}
              >
                <View style={[styles(currentTheme).icon]}>
                  <Feather name='list' size={moderateScale(18)} color='#fff' />
                </View>

                <TextDefault textColor={'#fff'} H5 bold>
                  {t('browse_available_areas')}
                </TextDefault>
              </TouchableOpacity>
              <View style={styles(currentTheme).line} />
              {/* {!isLoggedIn ? ( */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles(currentTheme).solidButton,
                  { flexDirection: isArabic ? 'row-reverse' : 'row', gap: 0 }
                ]}
                onPress={handleSaveLocation}
              >
                <View style={[styles(currentTheme).icon]}>
                  <EvilIcons name='location' size={moderateScale(20)} color='#fff' />
                </View>
                <TextDefault textColor={'#fff'} H5 bold>
                  {t('confirm_address')}
                </TextDefault>
              </TouchableOpacity>
              {/* ) : null} */}
              <View style={styles(currentTheme).line} />
            </View>
            <View style={{ paddingBottom: inset.bottom }} />
          </ScrollView>
        </SafeAreaView>
      </View>

      <ModalDropdown
        theme={currentTheme}
        visible={modalVisible}
        onItemPress={onItemPress}
        onClose={() => setModalVisible(false)}
        isLoggedIn={isLoggedIn}
      />

      {/* areas modal */}
      <Modal visible={areasModalVisible} transparent animationType='slide'>
        <View style={styles1.modalOverlay}>
          <View style={styles1.halfModal}>
            <Text style={styles1.modalTitle}>
              {t('choose_area_in')} {city?.title}
            </Text>

            <ScrollView contentContainerStyle={styles1.scrollContainer}>
              {areasList?.map((area) => (
                <TouchableOpacity
                  key={area._id}
                  onPress={() => handleChooseArea(area)}
                  style={styles1.modalItem}
                >
                  <Text style={styles1.modalItemText}>{area.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setAreasModalVisible(false)}
              style={styles1.cancelButton}
            >
              <Text style={styles1.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Fragment>
  )
}

const styles1 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    direction: 'rtl'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 12
  },
  optionText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#000'
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginTop: 15,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    color: '#000'
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  addressSubContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxHeight: '80%'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  halfModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333'
  },
  scrollContainer: {
    paddingBottom: 20
  },
  modalItem: {
    paddingVertical: moderateScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'right'
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(12)
  },
  cancelText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    color: '#333'
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    right: 20,
    zIndex: 999999999 // ensure it appears on top of the map
  }
})
