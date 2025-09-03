import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  ScrollView
} from 'react-native'
import { Ionicons, Feather, Entypo, AntDesign } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import * as Location from 'expo-location'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import { useRef } from 'react'
import { theme } from '../../utils/themeColors'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import UserContext from '../../context/User'
import { useContext } from 'react'
import { LocationContext } from '../../context/Location'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import { selectAddress } from '../../apollo/mutations'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { moderateScale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
import { alignment } from '../../utils/alignment'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useDispatch, useSelector } from 'react-redux'
import {
  setAddressFrom,
  setChooseFromAddressBookFrom,
  setChooseFromMapFrom,
  setResetBooleansFrom,
  setSelectedAreaFrom,
  setSelectedCityFrom
} from '../../store/requestDeliverySlice'
import { getCities, getCityAreas } from '../../apollo/queries'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Toast from 'react-native-toast-message'
import JSONTree from 'react-native-json-tree'

const SELECT_ADDRESS = gql`
  ${selectAddress}
`

const GET_CITIES = gql`
  ${getCities}
`
const GET_CITIES_AREAS = gql`
  ${getCityAreas}
`
const NewPickupMandoob = () => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const state = useSelector((state) => state.requestDelivery)
  const {
    chooseFromMapFrom,
    chooseFromAddressBookFrom,
    labelFrom,
    addressFreeTextFrom,
    selectedCityFrom,
    selectedCityAndAreaFrom,
    selectedAreaFrom
  } = state
  console.log({ selectedAreaFrom })
  const route = useRoute()
  const modalRef = useRef()
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [currentPosSelected, setCurrentPosSelected] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const city = useSelector((state) => state.city.city)
  console.log({ city })
  console.log({ chooseFromAddressBookFrom })
  const [formattedAddress, setFormattedAddress] = useState('')
  const { getAddress } = useGeocoding()
  const { isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [coordinates, setCoordinates] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  })
  const [areasModalVisible, setAreasModalVisible] = useState(false)
  const [citiesModalVisible, setCitiesModalVisible] = useState(false)
  const [area, setArea] = useState(null)

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const { data, loading, error } = useQuery(GET_CITIES, {
    fetchPolicy: 'network-only' // or 'no-cache'
  })
  // const [
  //   fetchAreas,
  //   { data: dataAreas, loading: loadingAreas, error: errorAreas }
  // ] = useLazyQuery(GET_CITIES_AREAS)

  const {
    data: dataAreas,
    loading: loadingAreas,
    error: errorAreas
  } = useQuery(GET_CITIES_AREAS, {
    variables: {
      id: city._id
    },
    skip: !city
  })

  console.log({ dataAreas })

  const cities = data?.cities || null
  const areasList = dataAreas?.areasByCity || null

  const params = route.params || {}
  const currentInput = params.currentInput || null
  const locationMap = params.locationMap || null

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: t('pickup'),
  //     headerTitleStyle: {
  //       fontSize: moderateScale(14),
  //       color: "#fff"
  //     },
  //     headerRight: false,
  //     headerStyle: {
  //       backgroundColor: colors.primary
  //     }
  //   })
  // })

  useEffect(() => {
    if (chooseFromMapFrom) {
      // dispatch(setChooseFromMapFrom())
      setCurrentPosSelected(false)
      // setChooseFromAddressBook(false)
      dispatch(setChooseFromAddressBookFrom({ status: false }))
    }
    if (labelFrom) {
      setName(labelFrom)
    }
    if (addressFreeTextFrom) {
      setDetails(addressFreeTextFrom)
    }
    if (selectedCityAndAreaFrom) {
      setCoordinates({
        ...coordinates,
        latitude: +selectedAreaFrom.location.location.coordinates[1],
        longitude: +selectedAreaFrom.location.location.coordinates[0]
      })
    }
  }, [chooseFromMapFrom, selectedCityAndAreaFrom])

  const [mutate, { loading: mutationLoading }] = useMutation(SELECT_ADDRESS, {
    onError: (err) => {
      console.log({ err })
    }
  })

  const setAddressLocation = async (address) => {
    console.log({ address })
    dispatch(setResetBooleansFrom())
    dispatch(setChooseFromAddressBookFrom({ status: true }))
    setCoordinates({
      ...coordinates,
      latitude: +address.location.coordinates[1],
      longitude: +address.location.coordinates[0]
    })
    setFormattedAddress(address.deliveryAddress)
    setCurrentPosSelected(false)
    if (chooseFromMapFrom) {
      dispatch(setChooseFromMapFrom({ status: false }))
    }
    setName(address.label)
    setDetails(address.details)
    setIsVisible(false)
  }

  // const handleCurrentPosition = async () => {
  //   try {
  //     if (!currentPosSelected) {
  //       const { status } = await Location.requestForegroundPermissionsAsync()
  //       console.log({ status })
  //       if (status !== 'granted') {
  //         FlashMessage({
  //           message:
  //             'Location permission denied. Please enable it in settings.',
  //           onPress: async () => {
  //             await Linking.openSettings()
  //           }
  //         })
  //         return
  //       }
  //       const position = await Location.getCurrentPositionAsync({
  //         accuracy: Location.Accuracy.High,
  //         maximumAge: 1000,
  //         timeout: 1000
  //       })
  //       console.log('Current Position:', position.coords)

  //       getAddress(position.coords.latitude, position.coords.longitude).then(
  //         (res) => {
  //           const newCoordinates = {
  //             latitude: position.coords.latitude,
  //             longitude: position.coords.longitude,
  //             latitudeDelta: 0.01,
  //             longitudeDelta: 0.01
  //           }

  //           setCoordinates({ ...newCoordinates })

  //           if (res.formattedAddress) {
  //             setFormattedAddress(res.formattedAddress)
  //           }
  //           setCurrentPosSelected(true)
  //           dispatch(setChooseFromMapFrom({ status: false }))
  //           // setChooseFromAddressBook(false)
  //           dispatch(setChooseFromAddressBookFrom({ status: false }))
  //         }
  //       )
  //     } else {
  //       setCurrentPosSelected(false)
  //     }
  //   } catch (error) {
  //     console.log('Error fetching location:', error)
  //     FlashMessage({ message: 'Failed to get current location. Try again.' })
  //   }
  // }

  const handleChooseAddress = () => {
    setIsVisible(true)
  }

  const handleNext = () => {
    // console.log({
    //   selectedCityAndAreaFrom,
    //   selectedAreaFrom: selectedAreaFrom?.location.location.coordinates
    // })
    if (!name) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: 'اسم المكان مطلوب',
        text1Style: {
          textAlign: 'right'
        },
        text2Style: {
          textAlign: 'right',
          fontSize: 18
        }
      })
      return
    }
    if (chooseFromMapFrom) {
      dispatch(
        setAddressFrom({
          addressFrom: currentInput,
          regionFrom: { ...locationMap },
          addressFreeTextFrom: details,
          labelFrom: name
        })
      )
    } else if (selectedCityAndAreaFrom) {
      dispatch(
        setAddressFrom({
          addressFrom: selectedAreaFrom.address,
          regionFrom: { ...locationMap },
          addressFreeTextFrom: details,
          labelFrom: name
        })
      )
    } else {
      dispatch(
        setAddressFrom({
          addressFrom: formattedAddress,
          regionFrom: { ...coordinates },
          addressFreeTextFrom: details,
          labelFrom: name
        })
      )
    }

    navigation.navigate('RequestDelivery')
  }

  const handleNearestArea = () => {
    setAreasModalVisible(true)
  }

  const onModalClose = () => {
    setIsVisible(false)
  }

  console.log({ selectedCityFrom })

  const debug = false // Set to true to debug the area object

  if (debug && area) {
    return (
      <View style={{ margin: 10 }}>
        <View style={{ maxHeight: 300 }}>
          <JSONTree data={area} theme='monokai' invertTheme={false} />
        </View>
      </View>
    )
  }

  const modalFooter = () => (
    <View style={styles.addNewAddressbtn}>
      <View style={styles.addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddressUser')
            } else {
              navigation.navigate('Login')
              // const modal = modalRef.current
              // modal?.close()
            }
          }}
        >
          <View style={{ ...styles.addressSubContainer, gap: 5 }}>
            <AntDesign
              name='pluscircleo'
              size={moderateScale(20)}
              color={'#fff'}
            />
            <View style={styles.mL5p} />
            <TextDefault bold H4>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.addressTick}></View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('select_pickup_location')}</Text>

      {/* Location options */}

      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: chooseFromAddressBookFrom ? 'green' : '#eee',
          justifyContent: 'space-between',
          flexDirection: isArabic ? 'row' : 'row-reverse'
        }}
        onPress={handleChooseAddress}
      >
        <View style={{ flexDirection: isArabic ? 'row' : 'row-reverse' }}>
          <Feather
            name='bookmark'
            size={moderateScale(22)}
            color={chooseFromAddressBookFrom ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: chooseFromAddressBookFrom ? 'green' : '#000'
            }}
          >
            {t('select_from_addressbook')}
          </Text>
        </View>
        {chooseFromAddressBookFrom && (
          <AntDesign
            name='checkcircleo'
            size={moderateScale(24)}
            color='green'
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: selectedCityAndAreaFrom ? 'green' : '#eee',
          justifyContent: 'space-between',
          flexDirection: isArabic ? 'row' : 'row-reverse'
        }}
        onPress={handleNearestArea}
      >
        <View style={{ flexDirection: isArabic ? 'row' : 'row-reverse' }}>
          <MaterialIcons
            name='location-city'
            size={moderateScale(22)}
            color={selectedCityAndAreaFrom ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: selectedCityAndAreaFrom ? 'green' : '#000'
            }}
          >
            {t('choose_nearest_area')}{' '}
            {selectedAreaFrom ? `- (${selectedAreaFrom.title})` : null}
          </Text>
        </View>
        {selectedCityAndAreaFrom && (
          <AntDesign
            name='checkcircleo'
            size={moderateScale(24)}
            color='green'
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: chooseFromMapFrom ? 'green' : '#eee',
          justifyContent: 'space-between',
          flexDirection: isArabic ? 'row' : 'row-reverse'
        }}
        onPress={() => {
          dispatch(setResetBooleansFrom())
          navigation.navigate('PickupFromMap')
        }}
      >
        <View style={{ flexDirection: isArabic ? 'row' : 'row-reverse' }}>
          <Entypo
            name='location-pin'
            size={moderateScale(22)}
            color={chooseFromMapFrom ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: chooseFromMapFrom ? 'green' : '#000'
            }}
          >
            {t('locate_on_map')}
          </Text>
        </View>
        {chooseFromMapFrom && (
          <AntDesign
            name='checkcircleo'
            size={moderateScale(24)}
            color='green'
          />
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <Text style={{ ...styles.label, textAlign: isArabic ? 'left' : 'right' }}>
        {t('address_label')} {`(${t('required')})`}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t('address_label_placeholder')}
        placeholderTextColor='#aaa'
        value={name}
        onChangeText={setName}
      />

      <Text style={{ ...styles.label, textAlign: isArabic ? 'left' : 'right' }}>
        {t('address_details')} {`(${t('optional')})`}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t('better_place_description')}
        placeholderTextColor='#aaa'
        value={details}
        onChangeText={setDetails}
      />

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleNext}>
        <Text style={styles.saveButtonText}>{t('continue')}</Text>
      </TouchableOpacity>

      {/* choose from address book modal */}
      <MainModalize
        isVisible={isVisible}
        isLoggedIn={isLoggedIn}
        addressIcons={addressIcons}
        modalHeader={modalFooter}
        // modalFooter={modalFooter}
        setAddressLocation={setAddressLocation}
        profile={profile}
        location={location}
        onClose={onModalClose}
        otlobMandoob={true}
      />

      {/* cities modal */}
      {/* <Modal visible={citiesModalVisible} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.halfModal}>
            <Text style={styles.modalTitle}>{t('choose_city')}</Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {cities?.map((city) => (
                <TouchableOpacity
                  key={city._id}
                  onPress={() => {
                    dispatch(setSelectedCityFrom(city))
                    // fetchAreas({ variables: { id: city._id } })
                    setCitiesModalVisible(false)
                    setAreasModalVisible(true)
                  }}
                  style={styles.modalItem}
                >
                  <Text style={styles.modalItemText}>{city.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setCitiesModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      {/* areas modal */}
      <Modal visible={areasModalVisible} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.halfModal}>
            <View
              style={{
                flexDirection: isArabic ? 'row' : 'row-reverse',
                justifyContent: 'space-between'
              }}
            >
              <Text style={styles.modalTitle}>
                {t('choose_area_in')} {city?.title}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAreasModalVisible(false)
                  navigation.navigate('CityListScreen')
                }}
              >
                <Text
                  style={{
                    color: colors.primary, // or '#007bff' if you're not using a theme
                    textDecorationLine: 'underline',
                    fontSize: moderateScale(14)
                  }}
                >
                  {t('change_city')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {areasList?.map((area) => (
                <TouchableOpacity
                  key={area._id}
                  onPress={() => {
                    dispatch(setResetBooleansFrom())
                    // dispatch(setSelectedAreaFrom(area))
                    setArea(area)
                    setAreasModalVisible(false)
                    navigation.navigate('PickupFromMap', { area })
                  }}
                  style={styles.modalItem}
                >
                  <Text style={styles.modalItemText}>{area.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setAreasModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default NewPickupMandoob

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    direction: 'rtl'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  option: {
    // flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 12
  },
  optionText: {
    fontSize: moderateScale(16),
    marginHorizontal: 10,
    color: '#000'
  },
  label: {
    fontSize: moderateScale(14),
    color: '#000',
    marginTop: 15,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    color: '#000'
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold'
  },
  addNewAddressbtn: {
    padding: moderateScale(5),
    ...alignment.PLmedium,
    ...alignment.PRmedium
  },
  addressContainer: {
    width: '100%',
    ...alignment.PTsmall,
    ...alignment.PBsmall
  },
  addButton: {
    backgroundColor: colors.primary,
    // backgroundColor: colors.dark,
    width: '100%',
    height: moderateScale(40),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  addressSubContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxHeight: '80%'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  halfModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333'
  },
  scrollContainer: {
    paddingBottom: 20
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'right'
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingVertical: 12
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333'
  }
})
