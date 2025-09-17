import React, { useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
  Linking,
  SafeAreaView
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useEffect } from 'react'
import useEnvVars from '../../../environment'
import { v4 as uuidv4 } from 'uuid'
import { useLayoutEffect } from 'react'
import { colors } from '../../utils/colors'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'
import {
  setAddress,
  setChooseFromMap,
  setSelectedArea
} from '../../store/addNewAddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import * as Location from 'expo-location'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import useGeocoding from '../../ui/hooks/useGeocoding'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import CustomPlacesAutocomplete from '../../components/CustomPlacesAutocomplete'
import { moderateScale } from '../../utils/scaling'

const { width, height } = Dimensions.get('window')

const EditAddressFromMap = () => {
  const mapRef = useRef(null)
  const searchRef = useRef(null)
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const { getAddress } = useGeocoding()

  const [sessionToken, setSessionToken] = useState(uuidv4())
  const [location, setLocation] = useState({
    latitude: 31.1091,
    longitude: 30.9426
  })

  const state = useSelector((state) => state.addNewAddress)
  const { selectedCityAndArea, selectedArea, region } = state

  console.log({ region })

  const { id, address, prevScreen } = route.params || {}
  const { area = null } = route.params || {}

  useEffect(() => {
    if (region) {
      // setLocation({ latitude: region.latitude, longitude: region.longitude })
      animateToLocation({
        lat: region.latitude,
        lng: region.longitude
      })
      getAddress(region.latitude, region.longitude).then((res) => {
        if (res.formattedAddress) {
          searchRef.current?.setAddressText(res.formattedAddress)
        }
      })
    }
  }, [region])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('choose_from_map'),
      headerTitleStyle: {
        fontSize: moderateScale(14),
        color: '#000'
      },
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={handleCurrentPosition}
            style={{ paddingRight: 25 }}
          >
            <FontAwesome6
              name='location-crosshairs'
              size={moderateScale(18)}
              color='#000'
            />
          </TouchableOpacity>
        )
      },
      headerStyle: {
        backgroundColor: '#fff'
      }
    })
  }, [navigation, t, colors.primary])

  useEffect(() => {
    if (area) {
      animateToLocation({
        lat: area.location.location.coordinates[1],
        lng: area.location.location.coordinates[0]
      })
      getAddress(
        area.location.location.coordinates[1],
        area.location.location.coordinates[0]
      ).then((res) => {
        if (res.formattedAddress) {
          searchRef.current?.setAddressText(res.formattedAddress)
        }
      })
    } else if (!region) {
      handleCurrentPosition()
    }
  }, [])

  const handleCurrentPosition = async () => {
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
          const newCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }

          setLocation({ ...newCoordinates })
          animateToLocation({
            lat: newCoordinates.latitude,
            lng: newCoordinates.longitude
          })
          if (res.formattedAddress) {
            searchRef.current?.setAddressText(res.formattedAddress)
          }
          // dispatch(setChooseFromMap({ status: false }))
          // setChooseFromAddressBook(false)
        }
      )
    } catch (error) {
      console.log('Error fetching location:', error)
      FlashMessage({ message: 'Failed to get current location. Try again.' })
    }
  }

  const animateToLocation = ({ lat, lng }) => {
    const region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }

    // Update marker position
    setLocation({ latitude: lat, longitude: lng })

    // Animate the map to the selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000) // 1000ms duration
    }
  }

  const clearSearch = () => {
    searchRef.current?.clear()
  }

  console.log({ location })

  const handleSave = () => {
    const currentInput = searchRef.current?.getAddressText?.()
    console.log({ location })
    console.log({ currentInput })
    // dispatch(
    //   setAddress({
    //     addressFrom: currentInput,
    //     regionFrom: location
    //     // addressFreeTextFrom: addressFreeText,
    //     // labelFrom: label
    //   })
    // )
    const newCoordinates = {
      ...location,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }

    if (area) {
      dispatch(setSelectedArea(area))
      dispatch(
        setAddress({
          addressFrom: area.address,
          regionFrom: newCoordinates
          // addressFreeTextFrom: details,
          // labelFrom: name
        })
      )
    } else {
      dispatch(setChooseFromMap({ status: true }))
    }
    navigation.navigate('EditAddressNewVersion', {
      chooseMap: true,
      selectedAreaMap: area,
      currentInput,
      locationMap: location,
      id,
      address,
      prevScreen
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          onRegionChangeComplete={(region) => {
            const { latitude, longitude } = region
            setLocation({ latitude, longitude })

            // Optionally reverse geocode
            getAddress(latitude, longitude).then((res) => {
              if (res.formattedAddress) {
                searchRef.current?.setAddressText(res.formattedAddress)
              }
            })
          }}
        />
        <View style={styles.markerFixed}>
          <Ionicons
            name='location-sharp'
            size={moderateScale(36)}
            color='red'
          />
        </View>
        {/* <Marker coordinate={location} />
      </MapView> */}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <CustomPlacesAutocomplete
            ref={searchRef}
            placeholder='ابحث عن مكان...'
            onPress={(data, details = null) => {
              const lat = details?.geometry?.location?.lat
              const lng = details?.geometry?.location?.lng

              if (lat && lng) {
                const newLocation = { latitude: lat, longitude: lng }
                setLocation(newLocation)
                mapRef.current.animateToRegion({
                  ...newLocation,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01
                })
              }
            }}
            query={{
              key: GOOGLE_MAPS_KEY,
              language: 'ar',
              sessiontoken: sessionToken,
              region: 'EG',
              components: 'country:eg'
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            predefinedPlaces={[]}
            predefinedPlacesAlwaysVisible={false}
            textInputProps={{
              placeholderTextColor: '#999'
            }}
            styles={{
              textInputContainer: {
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: moderateScale(40),
                paddingVertical: Platform.OS === 'ios' ? 10 : 0,
                elevation: 5,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 5
              },
              textInput: {
                height: moderateScale(44),
                color: '#000',
                fontSize: moderateScale(16),
                textAlign: 'right'
              }
            }}
          />
          {/* Clear icon (right) */}
          <TouchableOpacity style={styles.clearIcon} onPress={clearSearch}>
            <Ionicons
              name='close-circle'
              size={moderateScale(24)}
              color='#888'
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Ionicons
            name='checkmark-circle'
            size={moderateScale(24)}
            color='#fff'
          />
          <Text style={styles.buttonText}>{t('confirm_address')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default EditAddressFromMap

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mapContainer: {
    // height: height - (Platform.OS === 'ios' ? 60 : 140) // Adjust for header height
    flex: 1, // 🔥 fix here (instead of height)
    position: 'relative'
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 10,
    right: 10,
    zIndex: 999
  },
  clearIcon: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 18 : 10,
    zIndex: 999
  },
  sendIcon: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'ios' ? 18 : 14,
    zIndex: 999,
    transform: [{ rotate: '180deg' }]
  },
  markerFixed: {
    position: 'absolute',
    top: height / 2 - 100, // Adjust based on marker size
    left: width / 2 - 24, // Adjust based on marker size
    zIndex: 999
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    marginLeft: 8
  }
})
