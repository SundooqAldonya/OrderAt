import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef
} from 'react'
import { View, TouchableOpacity, StatusBar, Linking } from 'react-native'
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
import { createAddress } from '../../apollo/mutations'

const CREATE_ADDRESS = gql`
  ${createAddress}
`

const LATITUDE = 30.04442
const LONGITUDE = 31.235712
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = 0.01

export default function SelectLocation(props) {
  const Analytics = analytics()

  const { t } = useTranslation()
  const { longitude, latitude } = props.route.params || {}
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()
  const inset = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const mapRef = useRef()
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { setLocation } = useContext(LocationContext)
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
        setCurrentLocation
      })
    )
  })

  useEffect(() => {
    if (!coordinates.latitude) {
      getCurrentPosition()
    }
  }, [coordinates.latitude])

  StatusBar.setBackgroundColor(colors.primary)
  StatusBar.setBarStyle('light-content')

  const getCurrentPosition = async () => {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    })
    setCoordinates({
      ...coordinates,
      longitude: position.coords.longitude,
      latitude: position.coords.latitude
    })
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
  }

  const onRegionChangeComplete = (coords) => {
    console.log({ coords })
    setCoordinates({
      ...coordinates,
      longitude: coords.longitude,
      latitude: coords.latitude
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
        {coordinates.latitude ? (
          <View style={styles().mapView}>
            <MapView
              ref={mapRef}
              initialRegion={coordinates}
              region={coordinates}
              style={{ flex: 1 }}
              provider={PROVIDER_GOOGLE}
              showsTraffic={false}
              maxZoomLevel={15}
              onRegionChangeComplete={onRegionChangeComplete}
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
        ) : null}
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

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles(currentTheme).button}
            onPress={setCurrentLocation}
          >
            <View style={styles(currentTheme).icon}>
              <EvilIcons name='location' size={18} color='black' />
            </View>
            <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
              {t('useCurrentLocation')}
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

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles(currentTheme).button}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles(currentTheme).icon}>
              <Feather name='list' size={18} color='black' />
            </View>

            <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
              {t('browseCities')}
            </TextDefault>
          </TouchableOpacity>
          <View style={styles(currentTheme).line} />
        </View>
        <View style={{ paddingBottom: inset.bottom }} />
      </View>

      <ModalDropdown
        theme={currentTheme}
        visible={modalVisible}
        onItemPress={onItemPress}
        onClose={() => setModalVisible(false)}
      />
    </>
  )
}
