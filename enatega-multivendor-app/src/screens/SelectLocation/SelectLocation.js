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
  Text
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
import { Feather, EvilIcons, MaterialIcons } from '@expo/vector-icons'
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
import { scale } from '../../utils/scaling'
import navigationService from '../../routes/navigationService'
import { HeaderBackButton } from '@react-navigation/elements'

const CREATE_ADDRESS = gql`
  ${createAddress}
`

// const LATITUDE = 30.04442
// const LONGITUDE = 31.235712
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = 0.01

export default function SelectLocation(props) {
  const Analytics = analytics()
  const { i18n, t } = useTranslation()

  const isArabic = i18n.language === 'ar'

  const { longitude, latitude, areaCoords } = props.route.params || {}
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()
  const inset = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef()
  const { getCurrentLocation, getLocationPermission } = useLocation()
  const { setLocation } = useContext(LocationContext)
  const { getAddress } = useGeocoding()
  const { isLoggedIn } = useContext(UserContext)

  const [coordinates, setCoordinates] = useState({
    latitude: latitude || 31.1091,
    longitude: longitude || 30.9426,
    latitudeDelta: latitude ? 0.003 : LATITUDE_DELTA,
    longitudeDelta: longitude ? 0.003 : LONGITUDE_DELTA
  })
  const [modalVisible, setModalVisible] = useState(false)

  // useLayoutEffect(() => {
  //   navigation.setOptions(
  //     screenOptions({
  //       title: t('setLocation'),
  //       fontColor: currentTheme.newFontcolor,
  //       backColor: currentTheme.newheaderBG,
  //       iconColor: currentTheme.newIconColor,
  //       lineColor: currentTheme.newIconColor,
  //       setCurrentLocation: getCurrentPosition

  //     })
  //   )
  // })
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('setLocation'),
      setCurrentLocation: getCurrentPosition,

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
      }
      // headerLeft: () => (
      //   <HeaderBackButton
      //     truncatedLabel=''
      //     backImage={() => (
      //       <View>
      //         <MaterialIcons
      //           name='arrow-back'
      //           size={30}
      //           color={currentTheme.newIconColor}
      //         />
      //       </View>
      //     )}
      //     onPress={() => {
      //       navigationService.goBack()
      //     }}
      //   />
      // )
    })
  }, [])

  console.log({ areaCoords })

  useEffect(() => {
    if (areaCoords && mapRef?.current) {
      const newRegion = {
        latitude: areaCoords[1],
        longitude: areaCoords[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }

      // Animate the map
      mapRef.current.animateToRegion(newRegion, 1000)

      // Update state to match the animated region
      setCoordinates(newRegion)
    }
  }, [areaCoords])

  useEffect(() => {
    if (!coordinates.latitude) {
      getCurrentPosition()
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setMapLoaded(true), 3000) // fallback
    return () => clearTimeout(timeout)
  }, [])

  StatusBar.setBackgroundColor(colors.primary)
  StatusBar.setBarStyle('light-content')

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
  const setAreaLocation = async () => {
    setLoading(true)

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
  const onItemPress = (city) => {
    setModalVisible(false)
    console.log({ city })
    navigation.navigate('AddNewAddress', {
      // latitude: +city.latitude,
      // longitude: +city.longitude,
      city,
      prevScreen: props?.route?.params?.prevScreen
        ? props.route.params.prevScreen
        : null
    })
  }

  const handleSaveLocation = () => {
    if (areaCoords) {
      setAreaLocation()
    } else {
      setCurrentLocation()
    }
  }

  return (
    <>
      <View style={styles().flex}>
        <View
          style={[
            styles().mapView,
            {
              height: '70%'
            }
          ]}
        >
          {/* {coordinates.latitude ? ( */}
          <Fragment>
            <MapView
              ref={mapRef}
              initialRegion={coordinates}
              style={{ flex: 1 }}
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
                <TextDefault style={{ color: '#000' }}>
                  Loading map...
                </TextDefault>
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
              <TextDefault
                textColor={currentTheme.newFontcolor}
                H3
                bolder
                Left
                style={styles().heading}
              >
                {t('selectLocation')}
              </TextDefault>
              <View style={styles(currentTheme).line} />

              {!isLoggedIn ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles(currentTheme).button,
                    { flexDirection: isArabic ? 'row-reverse' : 'row', gap: 0 }
                  ]}
                  onPress={handleSaveLocation}
                >
                  <View style={[styles(currentTheme).icon]}>
                    <EvilIcons name='location' size={18} color='black' />
                  </View>
                  <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
                    {t('selectLocation')}
                  </TextDefault>
                </TouchableOpacity>
              ) : null}
              <View style={styles(currentTheme).line} />

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles(currentTheme).button,
                  { flexDirection: isArabic ? 'row-reverse' : 'row', gap: 5 }
                ]}
                onPress={() => setModalVisible(true)}
              >
                <View style={[styles(currentTheme).icon]}>
                  <Feather name='list' size={18} color='black' />
                </View>

                <TextDefault textColor={currentTheme.newFontcolor} H5 bold>
                  {t('browseCities')}
                </TextDefault>
              </TouchableOpacity>
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
    </>
  )
}
