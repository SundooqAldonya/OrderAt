import React, { useEffect, useRef } from 'react'
import {
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
// import MapViewDirections from 'react-native-maps-directions'
import styles from '../../screens/OrderDetail/styles'
// import colors from '../../utilities/colors'
import useOrderDetail from '../../screens/OrderDetail/useOrderDetail'
import { MapStyles } from '../../utilities/mapStyles'
import { linkToMapsApp } from '../../utilities/links'
import FromIcon from '../../assets/delivery_from.png'
import ToIcon from '../../assets/delivery_to.png'

// const RestIcon = require('../../assets/rest_icon.png')
const HomeIcon = require('../../assets/home_icon.png')
// const RiderIcon = require('../../assets/rider_icon.png')

const MapViewOrderDetails = () => {
  const {
    locationPin,
    restaurantAddressPin,
    deliveryAddressPin,
    pickupLocation,
    // GOOGLE_MAPS_KEY,
    // setDistance,
    // setDuration,
    order
  } = useOrderDetail()

  const mapRef = useRef(null)

  useEffect(() => {
    // Create an array of coordinates you want to fit
    if (order?.type !== 'delivery_request') {
      const coordinates = [
        restaurantAddressPin?.location,
        deliveryAddressPin?.location,
        locationPin?.location
      ].filter(Boolean) // remove undefined/null

      if (coordinates.length > 0 && mapRef.current) {
        // Fit the map to the coordinates with padding
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100
          },
          animated: true
        })
      }
    } else {
      const coordinates = [
        pickupLocation.location,
        deliveryAddressPin?.location,
        locationPin?.location
      ].filter(Boolean) // remove undefined/null

      console.log({ pickupLocation, deliveryAddressPin })

      if (coordinates.length > 0 && mapRef.current) {
        // Fit the map to the coordinates with padding
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100
          },
          animated: true
        })
      }
    }
  }, [restaurantAddressPin, deliveryAddressPin, locationPin, pickupLocation])

  return (
    <View style={styles.mapView}>
      {locationPin && (
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          zoomEnabled={true}
          zoomControlEnabled={true}
          rotateEnabled={false}
          // initialRegion={{
          //   latitude: locationPin.location.latitude,
          //   longitude: locationPin.location.longitude,
          //   latitudeDelta: 0.0922,
          //   longitudeDelta: 0.0421
          // }}
          customMapStyle={MapStyles}
          provider={PROVIDER_GOOGLE}
          language="ar">
          {order?.type === 'delivery_request' ? (
            <>
              <Marker coordinate={pickupLocation.location} title="Pickup">
                <Image source={FromIcon} style={{ height: 35, width: 32 }} />
              </Marker>
              <Marker coordinate={deliveryAddressPin.location} title="Delivery">
                <Image source={ToIcon} style={{ height: 35, width: 32 }} />
              </Marker>
            </>
          ) : (
            <>
              <Marker
                coordinate={restaurantAddressPin.location}
                title="Restaurant">
                <Image source={FromIcon} style={{ height: 35, width: 32 }} />
              </Marker>
              <Marker coordinate={deliveryAddressPin.location} title="Delivery">
                <Image source={ToIcon} style={{ height: 35, width: 32 }} />
              </Marker>
            </>
          )}

          {/* {deliveryAddressPin && (
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
          )} */}
          {/* {order.type !== 'delivery_request' && restaurantAddressPin ? (
            <Marker
              coordinate={restaurantAddressPin.location}
              title="Restaurant"
              onPress={() => {
                linkToMapsApp(
                  restaurantAddressPin.location,
                  restaurantAddressPin.label
                )
              }}>
              <Image source={FromIcon} style={{ height: 35, width: 32 }} />
            </Marker>
          ) : (
            <Marker
              coordinate={pickupLocation.location}
              title="Restaurant"
              onPress={() => {
                linkToMapsApp(pickupLocation.location, pickupLocation.label)
              }}>
              <Image source={FromIcon} style={{ height: 35, width: 32 }} />
            </Marker>
          )} */}
          {/* {locationPin && (
            <Marker
              coordinate={locationPin.location}
              title="Rider"
              onPress={() => {
                linkToMapsApp(locationPin.location, locationPin.label)
              }}>
              <Image source={ToIcon} style={{ height: 35, width: 32 }} />
            </Marker>
          )} */}
          {/* {order?.orderStatus === 'ACCEPTED' ? (
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
          )} */}
        </MapView>
      )}
    </View>
  )
}

export default MapViewOrderDetails
