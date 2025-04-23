import React, { useContext, useState } from 'react'
import { View, Button, StyleSheet } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import MapView, { Marker } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import useEnvVars from '../../../environment'
import { LocationContext } from '../../context/Location'
import { useTranslation } from 'react-i18next'

export default function ToPlace() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [place, setPlace] = useState({ lat: 0, lng: 0 })
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const { location } = useContext(LocationContext)

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={t('FromPlace')}
        fetchDetails
        onPress={(data, details = null) => {
          const lat = details?.geometry?.location.lat || 0
          const lng = details?.geometry?.location.lng || 0
          setPlace({ lat, lng })
        }}
        query={{
          key: GOOGLE_MAPS_KEY,
          language: 'ar'
        }}
        styles={{
          container: { flex: 0 },
          textInput: { height: 44, fontSize: 16 }
        }}
      />

      <MapView
        style={styles.map}
        region={{
          latitude: location.lat || 25.276987,
          longitude: location.lng || 55.296249,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >
        <Marker
          coordinate={{ latitude: location.lat, longitude: location.lng }}
        />
      </MapView>

      <Button
        title='Next: Drop-off Location'
        onPress={() =>
          navigation.navigate('ToLocationScreen', {
            pickupLat: location.lat,
            pickupLng: location.lng
          })
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, marginTop: 10 }
})
