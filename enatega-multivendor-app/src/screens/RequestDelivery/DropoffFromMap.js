import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import useEnvVars from '../../../environment'
import { v4 as uuidv4 } from 'uuid'
import { useLayoutEffect } from 'react'
import { colors } from '../../utils/colors'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'
import {
  setAddressFrom,
  setChooseFromMapTo
} from '../../store/requestDeliverySlice'
import { useDispatch } from 'react-redux'
import useGeocoding from '../../ui/hooks/useGeocoding'
import * as Location from 'expo-location'

const { width, height } = Dimensions.get('window')

const DropoffFromMap = () => {
  const mapRef = useRef(null)
  const searchRef = useRef(null)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const { getAddress } = useGeocoding()

  const [sessionToken, setSessionToken] = useState(uuidv4())
  const [location, setLocation] = useState({
    latitude: 31.1091,
    longitude: 30.9426
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('choose_from_map'),
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={handleCurrentPosition}
            style={{ paddingHorizontal: 25 }}
          >
            <FontAwesome6 name='location-crosshairs' size={24} color='#fff' />
          </TouchableOpacity>
        )
      },
      headerStyle: {
        backgroundColor: colors.primary
      }
    })
  }, [navigation, t, colors.primary, handleSave])

  // useEffect(() => {
  //   animateToLocation({ lat: location.latitude, lng: location.longitude })
  // }, [])

  useEffect(() => {
    // animateToLocation({ lat: location.latitude, lng: location.longitude })
    handleCurrentPosition()
  }, [])

  const handleCurrentPosition = async () => {
    // try {
    // if (!currentPosSelected) {
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
        // setCurrentPosSelected(true)
        // dispatch(setChooseFromMapFrom({ status: false }))
        // setChooseFromAddressBook(false)
      }
    )
    // } else {
    //   setCurrentPosSelected(false)
    // }
    // } catch (error) {
    //   console.log('Error fetching location:', error)
    //   FlashMessage({ message: 'Failed to get current location. Try again.' })
    // }
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

  console.log({ location })

  const clearSearch = () => {
    searchRef.current?.clear()
  }

  const handleSave = () => {
    const currentInput = searchRef.current?.getAddressText?.()
    console.log({ currentInput, location })
    dispatch(setChooseFromMapTo({ status: true }))

    navigation.navigate('NewDropoffMandoob', {
      chooseMap: true,
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
              paddingHorizontal: 40, // leave space for icons
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
              textAlign: 'right',
              paddingRight: 35, // for clear icon
              paddingLeft: 35 // for send icon
            }
          }}
        />
        {/* Clear icon (right) */}
        <TouchableOpacity style={styles.clearIcon} onPress={clearSearch}>
          <Ionicons name='close-circle' size={24} color='#888' />
        </TouchableOpacity>

        {/* Send icon (left) */}
        <TouchableOpacity style={styles.sendIcon} onPress={handleSave}>
          <Ionicons name='send' size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DropoffFromMap

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
  }
})
