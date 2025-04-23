import React, { useContext, useMemo, useRef, useState } from 'react'
import {
  View,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import MapView, { Marker } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import useEnvVars from '../../../environment'
import { LocationContext } from '../../context/Location'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { Ionicons } from '@expo/vector-icons'
import { v4 as uuidv4 } from 'uuid'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { debounce } from 'lodash'

const mapHeight = 400

export default function FromPlace() {
  const { location } = useContext(LocationContext)
  const { i18n, t } = useTranslation()
  // const mapRef = useRef()
  const isArabic = i18n.language === 'ar'
  const navigation = useNavigation()
  const [place, setPlace] = useState({ lat: 0, lng: 0 })
  const [region, setRegion] = useState({
    latitude: place.lat || location.latitude,
    longitude: place.lng || location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  })
  const [address, setAddress] = useState('')
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const [sessionToken, setSessionToken] = useState(uuidv4())
  const { getAddress } = useGeocoding()

  console.log({ region })

  const updateRegion = (newRegion) => {
    const isSameRegion =
      Math.abs(region.latitude - newRegion.latitude) < 0.0001 &&
      Math.abs(region.longitude - newRegion.longitude) < 0.0001
    const lat = newRegion.latitude
    const lng = newRegion.longitude

    if (!isSameRegion) {
      setRegion(newRegion)
      setPlace({ lat, lng })
      getAddress(lat, lng)
        .then((res) => {
          console.log({ res })
          if (res.formattedAddress) {
            setAddress(res.formattedAddress) // updates the GooglePlacesAutocomplete box
          }
        })
        .catch((err) => {
          console.log({ err })
        })
    }
  }

  const handleRegionChangeComplete = useMemo(
    () => debounce(updateRegion, 800),
    [updateRegion]
  )

  return (
    <View style={styles.container}>
      <MapView
        // ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      <View style={styles.markerFixed}>
        <Ionicons name='location-sharp' size={40} color='#d00' />
      </View>
      <View style={styles.wrapper}>
        <View style={styles.inputContainer}>
          <TextDefault
            bolder
            style={{
              ...styles.title,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('FromPlace')}
          </TextDefault>
          <GooglePlacesAutocomplete
            placeholder={t('search')}
            fetchDetails
            onPress={(data, details = null) => {
              const lat = details?.geometry?.location.lat || 0
              const lng = details?.geometry?.location.lng || 0
              setPlace({ lat, lng })
              setRegion({ ...region, latitude: lat, longitude: lng })
              setAddress(data.description)
            }}
            query={{
              key: GOOGLE_MAPS_KEY,
              language: 'ar',
              sessiontoken: sessionToken
            }}
            styles={{
              container: { flex: 0 },
              textInput: { height: 44, fontSize: 16 }
            }}
            // textInputProps={{
            //   value: address
            //   // onChangeText: (text) => {
            //   //   setAddress(text)
            //   // }
            // }}
            textInputProps={{
              defaultValue: address, // uncontrolled but initialised
              value: address
              // onChangeText: (text) => setAddress(text)
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => setAddress('')}
        style={{
          backgroundColor: '#000',
          height: 40,
          width: '100%',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <TextDefault style={{ color: '#fff', textAlign: 'center' }}>
          {t('clear_search')}
        </TextDefault>
      </TouchableOpacity>
      <Button
        title={t('next_drop_off')}
        onPress={() =>
          navigation.navigate('ToLocationScreen', {
            pickupLat: place.lat,
            pickupLng: place.lng
          })
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    height: mapHeight,
    marginTop: 10
  },
  wrapper: {
    padding: 16
  },
  inputContainer: {
    marginTop: 20
  },
  markerFixed: {
    position: 'absolute',
    top: mapHeight / 2 - 40, // adjust based on marker size
    left: Dimensions.get('window').width / 2 - 20,
    zIndex: 10
  },
  title: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  }
})
