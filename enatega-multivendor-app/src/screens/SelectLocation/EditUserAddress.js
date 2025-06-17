import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef
} from 'react'
import {
  View,
  TouchableOpacity,
  StatusBar,
  Linking,
  TextInput,
  Text
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
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
import { Feather, EvilIcons, Entypo, MaterialIcons } from '@expo/vector-icons'
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
import { editAddress } from '../../apollo/mutations'
import navigationService from '../../routes/navigationService'
import { HeaderBackButton } from '@react-navigation/elements'
import { scale } from '../../utils/scaling'
import { Image } from 'react-native'

const EDIT_ADDRESS = gql`
  ${editAddress}
`

// const LATITUDE = 30.04442
// const LONGITUDE = 31.235712
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = 0.01

export default function EditUserAddress(props) {
  const { t } = useTranslation()
  const { longitude, latitude, address } = props.route.params || {}
  // TODO: add the address presaved information
  console.log({ address })
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()
  const inset = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [locationChangeLoading, setLocationChangeLoading] = useState(false)
  const [addressDetails, setAddressDetails] = useState('')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef()
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { location, setLocation } = useContext(LocationContext)
  const { getAddress } = useGeocoding()
  const { isLoggedIn, refetchProfile } = useContext(UserContext)
  const [label, setLabel] = useState('')

  console.log({ address })

  const [coordinates, setCoordinates] = useState({
    latitude: latitude || null,
    longitude: longitude || null,
    latitudeDelta: latitude ? 0.01 : LATITUDE_DELTA,
    longitudeDelta: longitude ? 0.01 : LONGITUDE_DELTA
  })
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (address) {
      setAddressDetails(address.details)
      setSelectedAddress({
        _id: address._id,
        label: address.label,
        latitude: String(address.location.coordinates[1]),
        longitude: String(address.location.coordinates[0]),
        deliveryAddress: address.deliveryAddress,
        details: address.details
      })
      setLabel(address.label)

      setCoordinates({
        ...coordinates,
        latitude: address.location.coordinates[1],
        longitude: address.location.coordinates[0]
      })
    }
  }, [address])

  // useEffect(() => {
  //   // if (mapRef && mapRef.current) {
  //   console.log('zooming in')
  //   if (address?.location && mapRef?.current) {
  //     zoomIn()
  //   } else {
  //     // Retry after a short delay if mapRef is not available yet
  //     const timeout = setTimeout(() => {
  //       if (mapRef.current) {
  //         console.log('zooming in after delay')
  //         zoomIn()
  //       }
  //     }, 500) // Adjust delay if needed

  //     return () => clearTimeout(timeout)
  //   }
  // }, [mapRef])

  useEffect(() => {
    mapRef.current.animateToRegion(coordinates, 1000)
  }, [coordinates])

  const zoomIn = () => {
    const newCoordinates = {
      latitude: address.location.coordinates[1],
      longitude: address.location.coordinates[0],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }
    if (mapRef?.current) {
      mapRef.current.animateToRegion(newCoordinates, 1000) // Moves the map smoothly
    }
  }

  // useLayoutEffect(() => {
  //   navigation.setOptions(
  //     screenOptions({
  //       title: t('setLocation'),
  //       fontColor: currentTheme.newFontcolor,
  //       backColor: currentTheme.newheaderBG,
  //       iconColor: currentTheme.newIconColor,
  //       lineColor: currentTheme.newIconColor
  //       // setCurrentLocation: getCurrentPositionNav
  //     })
  //   )
  // })
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('setLocation'),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        fontWeight: 'bold'
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG,
        elevation: 0
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View>
              <MaterialIcons
                name='arrow-back'
                size={30}
                color={currentTheme.newIconColor}
              />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [])

  StatusBar.setBackgroundColor(colors.primary)
  StatusBar.setBarStyle('light-content')

  const [mutate] = useMutation(EDIT_ADDRESS, {
    onCompleted: (data) => {
      console.log({ data })
      refetchProfile()
      navigation.goBack()
    },
    onError: (err) => {
      console.log({ err })
    }
  })

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
        maximumAge: 1000,
        timeout: 1000
      })
      console.log('Current Position:', position.coords)

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
    const { error, coords, message } = await getCurrentLocation()
    if (error) {
      FlashMessage({
        message
      })
      setLoading(false)
      return
    }
    setLoading(false)
    getAddress(coordinates.latitude, coordinates.longitude).then((res) => {
      console.log({ res })
      if (isLoggedIn) {
        // save the location
        const addressInput = {
          _id: address?._id,
          label,
          latitude: String(coordinates.latitude),
          longitude: String(coordinates.longitude),
          deliveryAddress: res.formattedAddress,
          details: addressDetails
        }
        mutate({ variables: { addressInput } })
        // set location
        setLocation({
          _id: address._id,
          label: address.label,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          deliveryAddress: res.formattedAddress,
          details: addressDetails
        })
      }
    })
  }

  const onRegionChangeComplete = (coords) => {
    console.log({ coords })

    setCoordinates({
      ...coordinates,
      longitude: coords.longitude,
      latitude: coords.latitude
    })
    getAddress(coords.latitude, coords.longitude).then((res) => {
      console.log({ res })
      // set location
      setSelectedAddress({
        _id: address._id,
        label: address.label,
        latitude: coords.latitude,
        longitude: coords.longitude,
        deliveryAddress: res.formattedAddress,
        details: addressDetails
      })
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
  // Assuming coordinates comes from somewhere as strings
  // const fixedCoordinates = {
  //   latitude:
  //     typeof coordinates.latitude === 'string'
  //       ? parseFloat(coordinates.latitude)
  //       : coordinates.latitude,
  //   longitude:
  //     typeof coordinates.longitude === 'string'
  //       ? parseFloat(coordinates.longitude)
  //       : coordinates.longitude,
  //   latitudeDelta: coordinates.latitudeDelta,
  //   longitudeDelta: coordinates.longitudeDelta
  // }
  return (
    <>
      <View style={styles().flex}>
        <View
          style={[
            styles().mapView,
            {
              height: '60%'
            }
          ]}
        >
          <MapView
            ref={mapRef}
            initialRegion={coordinates}
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            onMapReady={zoomIn}
            onRegionChangeComplete={onRegionChangeComplete}
            // onPress={handleMapPress}
            zoomEnabled
            maxZoomLevel={50}
            bounce
            onMapLoaded={() => setMapLoaded(true)}
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
                  uri: `https://maps.googleapis.com/maps/api/staticmap?center=30.033333,31.233334&zoom=10&size=600x300&maptype=roadmap%7C30.033333,31.233334&key=AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY`
                }} // use Google Static Maps API
                style={{ width: '100%', height: '100%' }}
                resizeMode='cover'
              />
            </View>
          )}
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
                style={[styles().markerBubble, { backgroundColor: '#06C167' }]}
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
          {/* <MapView
            ref={mapRef}
            initialRegion={coordinates}
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            showsTraffic={false}
            zoomEnabled
            onMapReady={() => {
              zoomIn()
            }}
            maxZoomLevel={50}
            onRegionChangeComplete={onRegionChangeComplete}
            bounce
          >
            <Marker
              style={{
                borderRadius: 16,
                backgroundColor: ''
              }}
              coordinate={coordinates}
              title={t('your_order_will_send_here')}
            >
              <View style={styles().deliveryMarker}>
                <View
                  style={[
                    styles().markerBubble,
                    { backgroundColor: '#06C167' }
                  ]}
                >
                  <Text style={styles().markerText}>{t('your_location')}</Text>
                </View>

                <View style={styles().markerPin}>
                  <View
                    style={[styles().pinInner, { backgroundColor: '#06C167' }]}
                  />
                </View>
              </View>
            </Marker>
          </MapView> */}
        </View>
        <View style={styles(currentTheme).container}>
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

          {/* <TextDefault
            textColor={currentTheme.newFontcolor}
            H3
            bolder
            Left
            style={styles().heading}
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
           */}
          <View style={[styles(currentTheme).textInput, { height: 50 }]}>
            <TextInput
              value={label}
              onChangeText={(text) => setLabel(text)}
              placeholder={t('address_label_placeholder')}
              placeholderTextColor={
                themeContext.ThemeValue === 'Dark' ? '#fff' : 'grey'
              }
              style={[
                {
                  color: themeContext.ThemeValue === 'Dark' ? '#fff' : '#000',
                  textAlignVertical: 'top' // Aligns text to the top (important for Android)
                }
              ]}
              blurOnSubmit={true} // Keyboard will dismiss when submit is pressed
              returnKeyType='done' // Changes return key to "done" on iOS
            />
          </View>
          <View style={[styles(currentTheme).textInput, { height: 50 }]}>
            <TextInput
              value={addressDetails}
              onChangeText={(text) => setAddressDetails(text)}
              placeholder={t('better_place_description')}
              placeholderTextColor={
                themeContext.ThemeValue === 'Dark' ? '#fff' : 'grey'
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
              justifyContent: 'center',
              backgroundColor: colors.secondaryGreen
            }}
            onPress={handleCurrentLocation}
          >
            {!loading && (
              <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
                {t('save')}
              </TextDefault>
            )}
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
