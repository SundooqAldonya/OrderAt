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
  TextInput,
  Alert
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import styles from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import screenOptions from './screenOptions'
import { useNavigation } from '@react-navigation/native'
import { useLocation } from '../../ui/hooks'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { mapStyle } from '../../utils/mapStyle'
import CustomMarker from '../../assets/SVG/imageComponents/CustomMarker'
import analytics from '../../utils/analytics'
import {
  Feather,
  EvilIcons,
  createIconSetFromFontello,
  Entypo
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
import { gql, useMutation } from '@apollo/client'
import { createAddress } from '../../apollo/mutations'

const CREATE_ADDRESS = gql`
  ${createAddress}
`

// const LATITUDE = 30.04442
// const LONGITUDE = 31.235712
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = 0.01

export default function AddNewAddressUser(props) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { longitude, latitude, area } = props.route.params || {}
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()
  const inset = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [addressDetails, setAddressDetails] = useState('')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const mapRef = useRef()
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { location, setLocation } = useContext(LocationContext)
  const { getAddress } = useGeocoding()
  const { isLoggedIn } = useContext(UserContext)

  const [coordinates, setCoordinates] = useState({
    latitude: latitude || null,
    longitude: longitude || null,
    latitudeDelta: latitude ? 0.003 : LATITUDE_DELTA,
    longitudeDelta: longitude ? 0.003 : LONGITUDE_DELTA
  })

  const [modalVisible, setModalVisible] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions(
      screenOptions({
        title: t('setLocation'),
        fontColor: currentTheme.newFontcolor,
        backColor: currentTheme.newheaderBG,
        iconColor: currentTheme.newIconColor,
        lineColor: currentTheme.newIconColor,
        setCurrentLocation: getCurrentPositionNav
      })
    )
  })

  useEffect(() => {
    if (!coordinates.latitude) {
      getCurrentPositionNav()
    }
  }, [coordinates.latitude])

  useEffect(() => {
    if (area) {
      getCurrentPosition({
        longitude: area.location.location.coordinates[0],
        latitude: area.location.location.coordinates[1]
      })
      const newCoordinates = {
        latitude: area.location.location.coordinates[1],
        longitude: area.location.location.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }

      if (mapRef.current) {
        mapRef.current.animateToRegion(newCoordinates, 1000) // Moves the map smoothly
      }
    }
  }, [area])

  StatusBar.setBackgroundColor(colors.primary)
  StatusBar.setBarStyle('light-content')

  const getCurrentPositionNav = async () => {
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
      setCoordinates({
        ...coordinates,
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      })
      getAddress(position.coords.latitude, position.coords.longitude).then(
        (res) => {
          setSelectedAddress({
            _id: '',
            label: 'Home',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            deliveryAddress: res.formattedAddress,
            details: addressDetails
          })
          const newCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }

          if (mapRef.current) {
            mapRef.current.animateToRegion(newCoordinates, 1000) // Moves the map smoothly
          }
        }
      )
    } catch (error) {
      console.log('Error fetching location:', error)
      FlashMessage({ message: 'Failed to get current location. Try again.' })
    }
  }

  const getCurrentPosition = async ({ longitude, latitude }) => {
    const lat = latitude ? latitude : coordinates.latitude
    const lng = longitude ? longitude : coordinates.longitude
    getAddress(lat, lng).then((res) => {
      console.log({ res })
      setSelectedAddress({
        _id: '',
        label: 'Home',
        latitude: lat,
        longitude: lng,
        deliveryAddress: res.formattedAddress,
        details: addressDetails
      })
      // setCoordinates({
      //   ...coordinates,
      //   longitude: position.coords.longitude,
      //   latitude: position.coords.latitude
      // })
    })
    // setCoordinates({
    //   ...coordinates,
    //   longitude: position.coords.longitude,
    //   latitude: position.coords.latitude
    // })
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

  const handleCurrentLocation = async () => {
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
    // const { error, coords, message } = await getCurrentLocation()
    // if (error) {
    //   FlashMessage({
    //     message
    //   })
    //   setLoading(false)
    //   return
    // }
    setLoading(false)
    getAddress(coordinates.latitude, coordinates.longitude).then((res) => {
      console.log({ res })
      if (isLoggedIn) {
        // save the location
        // if (!addressDetails) {
        //   Alert.alert(
        //     'Address details is required',
        //     'Please add address details'
        //   )
        //   return
        // }
        const addressInput = {
          _id: '',
          label: 'Home',
          latitude: String(coordinates.latitude),
          longitude: String(coordinates.longitude),
          deliveryAddress: res.formattedAddress,
          details: addressDetails
        }
        mutate({ variables: { addressInput } })
        // set location
        setLocation({
          _id: '',
          label: 'Home',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          deliveryAddress: res.formattedAddress,
          details: addressDetails
        })
      }
    })

    // navigation.navigate('AddNewAddress', {
    //   latitude: coords.latitude,
    //   longitude: coords.longitude,
    //   prevScreen: props?.route?.params?.prevScreen
    //     ? props.route.params.prevScreen
    //     : null
    // })
  }

  const onRegionChangeComplete = (coords) => {
    console.log({ coords })
    getCurrentPosition({ ...coords })
    setCoordinates((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude
    }))
  }

  const onItemPress = (city) => {
    setModalVisible(false)
    navigation.navigate('AddNewAddress', {
      // latitude: +city.latitude,
      // longitude: +city.longitude,
      city,
      prevScreen: props?.route?.params?.prevScreen
        ? props.route.params.prevScreen
        : null
    })
  }

  const handleNavArea = () => {
    navigation.navigate('SelectLocation', {
      isLoggedIn: true
    })
  }

  return (
    <>
      <View style={styles().flex}>
        <View style={styles().mapView}>
          {coordinates.latitude ? (
            <Fragment>
              <MapView
                ref={mapRef}
                initialRegion={coordinates}
                // region={coordinates}
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                showsTraffic={false}
                maxZoomLevel={15}
                // customMapStyle={
                //   themeContext.ThemeValue === 'Dark' ? mapStyle : customMapStyle
                // }
                onRegionChangeComplete={onRegionChangeComplete}
                bounce
              />
              <View style={styles().mainContainer}>
                <CustomMarker
                  width={40}
                  height={40}
                  transform={[{ translateY: -20 }]}
                  translateY={-20}
                />
              </View>
            </Fragment>
          ) : null}
        </View>

        <View style={styles(currentTheme).container}>
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              justifyContent: 'space-around'
            }}
          >
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.newFontcolor
                // marginTop: 20
              }}
              onPress={handleNavArea}
            >
              <TextDefault
                textColor={currentTheme.newFontcolor}
                bolder
                Left
                style={{ ...styles().heading, paddingLeft: 0 }}
              >
                {t('choose_nearest_area')}
              </TextDefault>
              <Entypo
                name='location'
                size={15}
                color={currentTheme.newFontcolor}
                style={{ marginTop: -20 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.newFontcolor
              }}
              onPress={getCurrentPositionNav}
            >
              <TextDefault
                textColor={currentTheme.newFontcolor}
                bolder
                Left
                style={{ ...styles().heading, paddingLeft: 0 }}
              >
                {t('useCurrentLocation')}
              </TextDefault>
              <Entypo
                name='location'
                size={15}
                color={currentTheme.newFontcolor}
                style={{ marginTop: -20 }}
              />
            </TouchableOpacity>
          </View>
          <TextDefault
            textColor={currentTheme.newFontcolor}
            H3
            bolder
            Left
            style={{ ...styles().heading, marginBottom: 0, marginTop: 10 }}
          >
            {t('selectLocation')}
          </TextDefault>
          <View
            style={{ ...styles(currentTheme).button, height: 50 }}
            // onPress={() => setModalVisible(true)}
          >
            <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
              {selectedAddress?.deliveryAddress
                ? selectedAddress.deliveryAddress
                : null}
            </TextDefault>
          </View>
          <View style={[styles(currentTheme).textInput]}>
            <TextInput
              value={addressDetails}
              onChangeText={(text) => setAddressDetails(text)}
              placeholder={t('address_details')}
              placeholderTextColor={
                themeContext.ThemeValue === 'Dark' ? '#fff' : '#000'
              }
              style={{
                color: themeContext.ThemeValue === 'Dark' ? '#fff' : '#000'
              }}
            />
          </View>
          <View style={styles(currentTheme).line} />
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              ...styles(currentTheme).button,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={handleCurrentLocation}
          >
            <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
              {t('save')}
            </TextDefault>
            {loading && (
              <Spinner
                size={'small'}
                backColor={currentTheme.themeBackground}
                spinnerColor={currentTheme.main}
              />
            )}
          </TouchableOpacity>
          <View style={styles(currentTheme).line} />
        </View>
        <View style={{ paddingBottom: inset.bottom }} />
      </View>

      {/* <ModalDropdown
        theme={currentTheme}
        visible={modalVisible}
        onItemPress={onItemPress}
        onClose={() => setModalVisible(false)}
      /> */}
    </>
  )
}
