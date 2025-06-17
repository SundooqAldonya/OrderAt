import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Text
} from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import MapView, { Marker } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import useEnvVars from '../../../environment'
import { LocationContext } from '../../context/Location'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import {
  AntDesign,
  Entypo,
  Ionicons,
  SimpleLineIcons
} from '@expo/vector-icons'
import { v4 as uuidv4 } from 'uuid'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { setAddressFrom } from '../../store/requestDeliverySlice'
import FlashMessage from 'react-native-flash-message'
import * as Location from 'expo-location'
import { Checkbox } from 'react-native-paper'
import { createAddress } from '../../apollo/mutations.js'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'
import MainModalize from '../../components/Main/Modalize/MainModalize.js'
import ThemeContext from '../../ui/ThemeContext/ThemeContext.js'
import { theme } from '../../utils/themeColors.js'
import UserContext from '../../context/User.js'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon.js'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon.js'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon.js'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon.js'
import Feather from '@expo/vector-icons/Feather'
import { scale } from '../../utils/scaling.js'
import { colors } from '../../utils/colors.js'
import ModalDropdown from '../../components/Picker/ModalDropdown.js'
import { Image } from 'react-native'
import { InteractionManager } from 'react-native'

const mapHeight = 250

const CREATE_ADDRESS = gql`
  ${createAddress}
`

export default function FromPlace() {
  const { location } = useContext(LocationContext)
  const { i18n, t } = useTranslation()
  const dispatch = useDispatch()
  const { addressFrom, regionFrom, addressFreeTextFrom, labelFrom } =
    useSelector((state) => state.requestDelivery)
  const searchRef = useRef()
  const mapRef = useRef()
  const modalRef = useRef(null)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const isArabic = i18n.language === 'ar'
  const navigation = useNavigation()
  const [place, setPlace] = useState({ lat: 0, lng: 0 })
  const [region, setRegion] = useState({
    latitude: place.lat || location.latitude,
    longitude: place.lng || location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  })
  const [modalVisible, setModalVisible] = useState(false)
  const { isLoggedIn, profile } = useContext(UserContext)
  const [mapLoaded, setMapLoaded] = useState(false)

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const [sessionToken, setSessionToken] = useState(uuidv4())
  const { getAddress } = useGeocoding()
  const [addressFreeText, setAddressFreeText] = useState('')
  const [formattedAddress, setFormattedAddress] = useState('')
  const [initiated, setInitiated] = useState(false)
  const [saveAddress, setSaveAddress] = useState(false)
  const [label, setLabel] = useState('')

  const [mutateSaveAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: (data) => {
      console.log({ data })
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  useEffect(() => {
    if (!initiated) {
      getAddress(region.latitude, region.longitude)
        .then((res) => {
          console.log({ res })
          if (res.formattedAddress) {
            searchRef.current?.setAddressText(res.formattedAddress)
            setFormattedAddress(res.formattedAddress)
            setInitiated(true)
          }
        })
        .catch((err) => {
          console.log({ err })
        })
    }
  }, [initiated])

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (mapRef.current) {
        if (regionFrom) {
          setRegion({ ...regionFrom })
        }
        if (addressFrom) {
          console.log('inside address from')
          searchRef?.current.setAddressText(addressFrom)
          setFormattedAddress(addressFrom)
        }
        if (addressFreeTextFrom) {
          setAddressFreeText(addressFreeTextFrom)
        }
        if (labelFrom) {
          setLabel(labelFrom)
        }
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [regionFrom, addressFrom])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ paddingVertical: 5, paddingHorizontal: 16, marginLeft: 8 }}
          >
            <AntDesign name='arrowleft' size={24} color='#fff' />
          </TouchableOpacity>
        )
      }
    })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setMapLoaded(true), 3000) // fallback
    return () => clearTimeout(timeout)
  }, [])

  console.log({ initiated })

  console.log({ addressFrom })
  console.log({ regionFrom })

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
            searchRef.current?.setAddressText(res.formattedAddress)
            setFormattedAddress(res.formattedAddress)
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

  const handleNavigation = () => {
    dispatch(
      setAddressFrom({
        addressFrom: formattedAddress,
        regionFrom: region,
        addressFreeTextFrom: addressFreeText,
        labelFrom: label
      })
    )
    if (saveAddress) {
      const addressInput = {
        _id: '',
        label: label || 'Home',
        latitude: String(region.latitude),
        longitude: String(region.longitude),
        deliveryAddress: formattedAddress,
        details: addressFreeText
      }
      mutateSaveAddress({ variables: { addressInput } })
    }
    console.log('triggered the handle navigation')
    navigation.navigate('ToPlace')
  }

  const getCurrentPositionNav = async () => {
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
          if (mapRef.current) {
            mapRef.current.animateToRegion(newCoordinates, 1000)
          }
          if (res.formattedAddress) {
            searchRef.current?.setAddressText(res.formattedAddress)
            setFormattedAddress(res.formattedAddress)
          }
        }
      )
    } catch (error) {
      console.log('Error fetching location:', error)
      FlashMessage({ message: 'Failed to get current location. Try again.' })
    }
  }

  const setAddressLocation = async (address) => {
    const newCoordinates = {
      latitude: address.location.coordinates[1],
      longitude: address.location.coordinates[0],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }
    setFormattedAddress(address.deliveryAddress)
    setRegion({
      ...region,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0])
    })
    setAddressFreeText(address.details)
    setLabel(address.label)
    if (mapRef.current) {
      mapRef.current.animateToRegion(newCoordinates, 1000)
    }
    searchRef.current?.setAddressText(address.deliveryAddress)
    modalRef.current.close()
  }

  const onOpen = () => {
    InteractionManager.runAfterInteractions(() => {
      if (modalRef.current) {
        modalRef.current.open()
      } else {
        console.warn('Modalize ref not ready yet')
      }
    })
  }

  const onItemPress = (city) => {
    console.log({ city })
    setModalVisible(false)
    searchRef.current?.setAddressText(city.title)
  }

  // const modalHeader = () => (
  //   <View>
  //     <View>
  //       <TouchableOpacity
  //         style={{ paddingVertical: 15 }}
  //         onPress={getCurrentPositionNav}
  //       >
  //         <View
  //           style={{
  //             flexDirection: isArabic ? 'row-reverse' : 'row',
  //             alignItems: 'center',
  //             justifyContent: 'center',
  //             gap: 5
  //           }}
  //         >
  //           <SimpleLineIcons
  //             name='target'
  //             size={scale(18)}
  //             color={colors.primary}
  //           />
  //           <View />
  //           <TextDefault bold H4 style={{ color: colors.primary }}>
  //             {t('useCurrentLocation')}
  //           </TextDefault>
  //         </View>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // )

  const modalHeader = () => (
    <View>
      <View style={{ justifyContent: 'center' }}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            paddingVertical: 8,
            backgroundColor: colors.primary,
            marginHorizontal: 26,
            borderRadius: 50,
            marginBottom: 16
          }}
          onPress={() => {
            console.log({ isLoggedIn })
            if (isLoggedIn) {
              navigation.navigate('AddNewAddressUser')
            } else {
              navigation.navigate('SelectLocation', {
                ...location
              })
              // const modal = modalRef.current
              // modal?.close()
              InteractionManager.runAfterInteractions(() => {
                modalRef.current?.close()
              })
            }
          }}
        >
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5
            }}
          >
            <AntDesign name='pluscircleo' size={scale(20)} color={'#000'} />
            <View />
            <TextDefault bold H4 style={{ color: '#000' }}>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View></View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        <View style={{ position: 'relative' }}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleRegionChangeComplete}
            onMapReady={() => {
              console.log('Map is ready')
              setMapLoaded(true)
            }}
          />
          {!mapLoaded && (
            <View
              style={[
                styles.map,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  zIndex: 1
                }
              ]}
            >
              {/* <TextDefault style={{ color: '#000' }}>
                Loading map...
              </TextDefault> */}
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/staticmap?center=30.033333,31.233334&zoom=10&size=600x300&maptype=roadmap%7C30.033333,31.233334&key=AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY`
                }} // use Google Static Maps API
                style={{ width: '100%', height: '100%' }}
                resizeMode='cover'
              />
            </View>
          )}
          <View style={styles.markerFixed}>
            <Ionicons name='location-sharp' size={40} color='#d00' />
          </View>
        </View>

        <View style={styles.wrapper}>
          <View style={styles.inputContainer}>
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 10
                // marginBottom: 16
              }}
            >
              <TextDefault
                bolder
                style={{
                  ...styles.title,
                  textAlign: isArabic ? 'right' : 'left'
                }}
              >
                {t('search_place')}
              </TextDefault>
            </View>
            <View style={styles.topWrapper}>
              <TouchableOpacity
                style={styles.currentLocationWrapper}
                onPress={getCurrentPositionNav}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <TextDefault bolder Left style={{ color: '#000' }}>
                    {t('useCurrentLocation')}
                  </TextDefault>
                  <Entypo name='location' size={15} color={'#000'} />
                </View>
                {/* <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: 'green',
                    width: 150,
                    marginTop: 10
                  }}
                /> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.currentLocationWrapper}
                onPress={(event) => {
                  event.persist()
                  onOpen()
                }}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <TextDefault bolder Left style={{ color: '#000' }}>
                    {t('choose_address')}
                  </TextDefault>
                  <Entypo name='location' size={15} color={'#000'} />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-around'
              }}
            >
              <GooglePlacesAutocomplete
                ref={searchRef}
                placeholder={t('search')}
                fetchDetails
                onPress={(data, details = null) => {
                  const lat = details?.geometry?.location.lat || 0
                  const lng = details?.geometry?.location.lng || 0
                  setPlace({ lat, lng })
                  setRegion({ ...region, latitude: lat, longitude: lng })
                  setFormattedAddress(data.description)
                }}
                query={{
                  key: GOOGLE_MAPS_KEY,
                  language: 'ar',
                  sessiontoken: sessionToken,
                  region: 'EG',
                  components: 'country:eg'
                }}
                styles={{
                  container: { flex: 0, zIndex: 9999, width: '90%' },
                  textInput: { height: 44, fontSize: 16 }
                }}
              />
              <TouchableOpacity
                onPress={() => searchRef?.current.setAddressText('')}
              >
                <Feather name='trash-2' size={18} color='red' />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setSaveAddress(!saveAddress)}
              style={{
                ...styles.checkboxContainer,
                flexDirection: isArabic ? 'row' : 'row-reverse'
              }}
            >
              <Text style={styles.label}>{t('save_address')}</Text>
              <Checkbox
                status={saveAddress ? 'checked' : 'unchecked'}
                // onPress={() => setSaveAddress(!saveAddress)}
                style={styles.checkbox}
              />
            </TouchableOpacity>
            {/* {saveAddress ? ( */}
            {saveAddress ? (
              <View style={styles.inputContainer}>
                <TextDefault
                  style={{
                    ...styles.title,
                    textAlign: isArabic ? 'right' : 'left',
                    marginBottom: 16
                  }}
                >
                  {t('address_label')}
                </TextDefault>
                <TextInput
                  placeholder={t('address_label_placeholder')}
                  value={label}
                  onChangeText={(text) => {
                    setLabel(text)
                  }}
                  style={styles.inputLabel}
                />
              </View>
            ) : null}
            {/* ) : null} */}
            <View style={styles.inputContainer}>
              <TextDefault
                style={{
                  ...styles.title,
                  textAlign: isArabic ? 'right' : 'left',
                  marginBottom: 16
                }}
              >
                {t('address_details')} {`(${t('optional')})`}
              </TextDefault>
              <TextInput
                placeholder={t('better_place_description')}
                value={addressFreeText}
                onChangeText={(text) => {
                  setAddressFreeText(text)
                }}
                style={{ ...styles.input, marginBottom: 16 }}
                multiline
                numberOfLines={4}
                textAlignVertical='top'
              />
            </View>
          </View>
        </View>
        {/* <TouchableOpacity
          onPress={() => searchRef?.current.setAddressText('')}
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
        </TouchableOpacity> */}
        {/* <Button title={t('next_drop_off')} onPress={handleNavigation} /> */}
        <TouchableOpacity
          onPress={handleNavigation}
          style={{
            backgroundColor: colors.primary,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 16,
            marginTop: 16
          }}
        >
          <TextDefault style={{ color: '#000' }}>
            {t('next_drop_off')}
          </TextDefault>
        </TouchableOpacity>
      </ScrollView>
      <MainModalize
        modalRef={modalRef}
        currentTheme={currentTheme}
        isLoggedIn={isLoggedIn}
        addressIcons={addressIcons}
        setAddressLocation={setAddressLocation}
        profile={profile}
        location={location}
        modalHeader={modalHeader}
        // modalFooter={modalFooter}
      />
      {/* /List of cities */}
      <ModalDropdown
        theme={currentTheme}
        visible={modalVisible}
        onItemPress={onItemPress}
        onClose={() => setModalVisible(false)}
        isLoggedIn={isLoggedIn}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 25
  },
  map: {
    height: mapHeight,
    marginTop: 10
  },
  wrapper: {
    paddingHorizontal: 16
  },
  inputContainer: {
    marginTop: 20
  },
  input: {
    backgroundColor: '#fff',
    height: 70
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -40 }]
  },
  title: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
  },
  currentLocationWrapper: {
    flexDirection: 'column',
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: 'grey',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20
  },
  checkbox: {
    backgroundColor: 'red'
  },
  inputLabel: {
    backgroundColor: '#fff',
    height: 44,
    paddingHorizontal: 10
  },
  topWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16
  }
})
