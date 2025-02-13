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
  TextInput
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
import { Feather, EvilIcons } from '@expo/vector-icons'
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
import { createAddress, editAddress } from '../../apollo/mutations'

const EDIT_ADDRESS = gql`
  ${editAddress}
`

const LATITUDE = 30.04442
const LONGITUDE = 31.235712
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
  const [addressDetails, setAddressDetails] = useState('')
  const mapRef = useRef()
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { location, setLocation } = useContext(LocationContext)
  const { getAddress } = useGeocoding()
  const { isLoggedIn, refetchProfile } = useContext(UserContext)

  const [coordinates, setCoordinates] = useState({
    latitude: latitude || LATITUDE,
    longitude: longitude || LONGITUDE,
    latitudeDelta: latitude ? 0.003 : LATITUDE_DELTA,
    longitudeDelta: longitude ? 0.003 : LONGITUDE_DELTA
  })
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (address) {
      setAddressDetails(address.details)
      setLocation({
        _id: address._id,
        label: address.label,
        latitude: String(address.location.coordinates[1]),
        longitude: String(address.location.coordinates[0]),
        deliveryAddress: address.deliveryAddress,
        details: address.details
      })

      setCoordinates({
        ...coordinates,
        latitude: address.location.coordinates[1],
        longitude: address.location.coordinates[0]
      })
    }
  }, [address])

  useLayoutEffect(() => {
    navigation.setOptions(
      screenOptions({
        title: t('setLocation'),
        fontColor: currentTheme.newFontcolor,
        backColor: currentTheme.newheaderBG,
        iconColor: currentTheme.newIconColor,
        lineColor: currentTheme.newIconColor
        // getCurrentPosition
      })
    )
  })

  useEffect(() => {
    getCurrentPosition()
  }, [])

  StatusBar.setBackgroundColor(colors.primary)
  StatusBar.setBarStyle('light-content')

  const getCurrentPosition = async ({ longitude, latitude }) => {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    })
    const lat = latitude ? latitude : coordinates.latitude
    const lng = longitude ? longitude : coordinates.longitude
    getAddress(lat, lng).then((res) => {
      console.log({ res })
      setLocation({
        _id: '',
        label: 'Home',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
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
    setCoordinates({
      ...coords
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

  return (
    <>
      <View style={styles().flex}>
        <View style={styles().mapView}>
          <MapView
            ref={mapRef}
            initialRegion={coordinates}
            region={coordinates}
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
        </View>
        <View style={styles(currentTheme).container}>
          <TextDefault
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
              {location?.deliveryAddress ? location.deliveryAddress : null}
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
