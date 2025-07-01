import React, { useRef, useState } from 'react'
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
import { useEffect } from 'react'
import useEnvVars from '../../../environment'
import { v4 as uuidv4 } from 'uuid'
import { useLayoutEffect } from 'react'
import { colors } from '../../utils/colors'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { setAddressFrom } from '../../store/requestDeliverySlice'
import { useDispatch } from 'react-redux'

const { width, height } = Dimensions.get('window')

const PickupFromMap = () => {
  const mapRef = useRef(null)
  const searchRef = useRef(null)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()

  const [sessionToken, setSessionToken] = useState(uuidv4())
  const [location, setLocation] = useState({
    latitude: 31.1091,
    longitude: 30.9426
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('choose_from_map'),
      headerRight: () => (
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            marginRight: 10
          }}
          onPress={handleSave}
        >
          <Text style={{ color: '#fff' }}>{t('done')}</Text>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: colors.primary
      }
    })
  }, [navigation, t, colors.primary])

  useEffect(() => {
    animateToLocation({ lat: location.latitude, lng: location.longitude })
  }, [])

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

  const handleSave = () => {
    const currentInput = searchRef.current?.getAddressText?.()
    console.log({ currentInput })
    // dispatch(
    //   setAddressFrom({
    //     addressFrom: currentInput,
    //     regionFrom: location
    //     // addressFreeTextFrom: addressFreeText,
    //     // labelFrom: label
    //   })
    // )
    navigation.navigate('NewPickupMandoob', {
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
      >
        <Marker coordinate={location} />
      </MapView>

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
              paddingHorizontal: 10,
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
        <TouchableOpacity style={styles.clearIcon} onPress={clearSearch}>
          <Ionicons name='close-circle' size={24} color='#888' />
        </TouchableOpacity>
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
    left: 15,
    top: Platform.OS === 'ios' ? 18 : 14,
    zIndex: 999
  }
})
