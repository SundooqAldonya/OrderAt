import React from 'react'
import {
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import styles from '../../screens/OrderDetail/styles'
import colors from '../../utilities/colors'
import useOrderDetail from '../../screens/OrderDetail/useOrderDetail'
import { MapStyles } from '../../utilities/mapStyles'
import { linkToMapsApp } from '../../utilities/links'

const RestIcon = require('../../assets/rest_icon.png')
const HomeIcon = require('../../assets/home_icon.png')
const RiderIcon = require('../../assets/rider_icon.png')

const MapViewOrderDetails = () => {
  const {
    locationPin,
    restaurantAddressPin,
    deliveryAddressPin,
    GOOGLE_MAPS_KEY,
    setDistance,
    setDuration,
    order
  } = useOrderDetail()

  return (
    <View style={styles.mapView}>
      {locationPin && (
        <MapView
          style={styles.map}
          showsUserLocation
          zoomEnabled={true}
          zoomControlEnabled={true}
          rotateEnabled={false}
          initialRegion={{
            latitude: locationPin.location.latitude,
            longitude: locationPin.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
          customMapStyle={MapStyles}
          provider={PROVIDER_GOOGLE}
          language="ar">
          {deliveryAddressPin && (
            <Marker
              coordinate={deliveryAddressPin.location}
              title="Delivery Address"
              onPress={() => {
                linkToMapsApp(
                  deliveryAddressPin.location,
                  deliveryAddressPin.label
                )
              }}>
              <Image source={HomeIcon} style={{ height: 35, width: 32 }} />
            </Marker>
          )}
          {restaurantAddressPin && (
            <Marker
              coordinate={restaurantAddressPin.location}
              title="Restaurant"
              onPress={() => {
                linkToMapsApp(
                  restaurantAddressPin.location,
                  restaurantAddressPin.label
                )
              }}>
              <Image source={RestIcon} style={{ height: 35, width: 32 }} />
            </Marker>
          )}
          {locationPin && (
            <Marker
              coordinate={locationPin.location}
              title="Rider"
              onPress={() => {
                linkToMapsApp(locationPin.location, locationPin.label)
              }}>
              <Image source={RiderIcon} style={{ height: 35, width: 32 }} />
            </Marker>
          )}
          {order?.orderStatus === 'ACCEPTED' ? (
            <MapViewDirections
              origin={locationPin.location}
              destination={restaurantAddressPin.location}
              apikey={GOOGLE_MAPS_KEY}
              strokeWidth={4}
              strokeColor={colors.black}
              onReady={result => {
                console.log({ result })
                setDistance(result.distance)
                setDuration(result.duration)
              }}
            />
          ) : order?.orderStatus === 'PICKED' ? (
            <MapViewDirections
              origin={locationPin.location}
              destination={deliveryAddressPin.location}
              apikey={GOOGLE_MAPS_KEY}
              strokeWidth={4}
              strokeColor={colors.black}
              onReady={result => {
                setDistance(result.distance)
                setDuration(result.duration)
              }}
            />
          ) : (
            <MapViewDirections
              origin={restaurantAddressPin.location}
              destination={deliveryAddressPin.location}
              apikey={GOOGLE_MAPS_KEY}
              strokeWidth={4}
              strokeColor={colors.black}
              onReady={result => {
                setDistance(result.distance)
                setDuration(result.duration)
              }}
            />
          )}
        </MapView>
      )}
    </View>
  )
}

export default MapViewOrderDetails
