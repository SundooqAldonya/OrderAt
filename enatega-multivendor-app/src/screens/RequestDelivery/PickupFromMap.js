import React, { useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
  Linking
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useEffect } from 'react'
import useEnvVars from '../../../environment'
import { v4 as uuidv4 } from 'uuid'
import { useLayoutEffect } from 'react'
import { colors } from '../../utils/colors'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'
import {
  setAddressFrom,
  setChooseFromMapFrom
} from '../../store/requestDeliverySlice'
import { useDispatch, useSelector } from 'react-redux'
import * as Location from 'expo-location'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import useGeocoding from '../../ui/hooks/useGeocoding'
import TextDefault from '../../components/Text/TextDefault/TextDefault'

const { width, height } = Dimensions.get('window')

const PickupFromMap = () => {
  const mapRef = useRef(null)
  const searchRef = useRef(null)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const { getAddress } = useGeocoding()
  const city = useSelector((state) => state.city.city)

  const [sessionToken, setSessionToken] = useState(uuidv4())
  const [location, setLocation] = useState({
    latitude: 31.1091,
    longitude: 30.9426
  })

  const state = useSelector((state) => state.requestDelivery)
  const { selectedCityAndAreaFrom, selectedAreaFrom } = state

  console.log({ selectedCityAndAreaFrom })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('choose_from_map'),
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={handleCurrentPosition}
            style={{ paddingRight: 30 }}
          >
            <FontAwesome6 name='location-crosshairs' size={20} color='#fff' />
          </TouchableOpacity>
        )
      },
      headerStyle: {
        backgroundColor: colors.primary
      }
    })
  }, [navigation, t, colors.primary])

  useEffect(() => {
    // animateToLocation({ lat: location.latitude, lng: location.longitude })
    if (selectedCityAndAreaFrom) {
      animateToLocation({
        lat: selectedAreaFrom.location.location.coordinates[1],
        lng: selectedAreaFrom.location.location.coordinates[0]
      })
      getAddress(
        selectedAreaFrom.location.location.coordinates[1],
        selectedAreaFrom.location.location.coordinates[0]
      ).then((res) => {
        if (res.formattedAddress) {
          searchRef.current?.setAddressText(res.formattedAddress)
        }
      })
    } else {
      // handleCurrentPosition()
      getLocationFromSelectedCity()
    }
  }, [])

  const getLocationFromSelectedCity = () => {
    if (city) {
      getAddress(
        city.location.location.coordinates[1],
        city.location.location.coordinates[0]
      ).then((res) => {
        const newCoordinates = {
          latitude: city.location.location.coordinates[1],
          longitude: city.location.location.coordinates[0],
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
      })
    }
  }

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
    //   setAddressFrom({
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

    if (selectedCityAndAreaFrom) {
      dispatch(
        setAddressFrom({
          addressFrom: selectedAreaFrom.address,
          regionFrom: newCoordinates
          // addressFreeTextFrom: details,
          // labelFrom: name
        })
      )
    } else {
      dispatch(setChooseFromMapFrom({ status: true }))
    }
    navigation.navigate('NewPickupMandoob', {
      chooseMap: true,
      selectedAreaFromMap: selectedCityAndAreaFrom,
      currentInput,
      locationMap: location
    })
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
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
        <Ionicons name='location-sharp' size={36} color='red' />
      </View>
      {/* <Marker coordinate={location} />
      </MapView> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
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
          styles={{
            textInputContainer: {
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 40,
              paddingVertical: Platform.OS === 'ios' ? 10 : 0,
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 5
            },
            textInput: {
              height: 44,
              color: '#000',
              fontSize: 16,
              textAlign: 'right'
            }
          }}
        />
        {/* Clear icon (right) */}
        <TouchableOpacity style={styles.clearIcon} onPress={clearSearch}>
          <Ionicons name='close-circle' size={24} color='#888' />
        </TouchableOpacity>

        {/* Send icon (left) */}
        <TouchableOpacity style={styles.fabSave} onPress={handleSave}>
          <Ionicons name='checkmark-circle' size={28} color='#fff' />
          <Text style={styles.fabText}>{t('save_location')}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.sendIcon} onPress={handleSave}>
          <Ionicons name='send' size={24} color={colors.primary} />
        </TouchableOpacity> */}
      </View>
    </View>
  )
}

export default PickupFromMap

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    top: Platform.OS === 'ios' ? 18 : 14,
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
    top: height / 2 - 50, // Adjust based on marker size
    left: width / 2 - 24, // Adjust based on marker size
    zIndex: 999
  },
  fabSave: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8
  }
})
