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
import { createAddress, selectAddress } from '../../apollo/mutations'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { scale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
import { alignment } from '../../utils/alignment'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useDispatch, useSelector } from 'react-redux'
import {
  resetAddNewAddress,
  setAddress,
  setChooseFromAddressBook,
  setChooseFromMap,
  setSelectedArea,
  setSelectedCity
} from '../../store/addNewAddressSlice'
import { getCities, getCityAreas } from '../../apollo/queries'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

const CREATE_ADDRESS = gql`
  ${createAddress}
`
const GET_CITIES = gql`
  ${getCities}
`
const GET_CITIES_AREAS = gql`
  ${getCityAreas}
`
const AddressNewVersion = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const state = useSelector((state) => state.addNewAddress)
  const {
    chooseFromMap,
    chooseFromAddressBook,
    label,
    addressFreeText,
    selectedCity,
    selectedCityAndArea,
    selectedArea
  } = state
  console.log({ selectedArea })
  const route = useRoute()
  const modalRef = useRef()
  const city = useSelector((state) => state.city.city)
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [currentPosSelected, setCurrentPosSelected] = useState(false)

  console.log({ chooseFromAddressBook })
  const [formattedAddress, setFormattedAddress] = useState('')
  const { getAddress } = useGeocoding()
  const { isLoggedIn, profile, refetchProfile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [coordinates, setCoordinates] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  })
  const [areasModalVisible, setAreasModalVisible] = useState(false)
  const [citiesModalVisible, setCitiesModalVisible] = useState(false)

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const { data, loading, error } = useQuery(GET_CITIES)
  const [
    fetchAreas,
    { data: dataAreas, loading: loadingAreas, error: errorAreas }
  ] = useLazyQuery(GET_CITIES_AREAS)

  console.log({ dataAreas })

  const cities = data?.cities || null
  const areasList = dataAreas?.areasByCity || null

  const params = route.params || {}
  const currentInput = params.currentInput || null
  const locationMap = params.locationMap || null

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('add_new_address'),
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            dispatch(resetAddNewAddress())
            navigation.goBack()
          }}
          style={{ paddingHorizontal: 15 }}
        >
          <Ionicons name='arrow-back' size={24} color='white' />
        </TouchableOpacity>
      ),
      headerRight: () => null
    })
  }, [navigation, t])

  useEffect(() => {
    if (chooseFromMap) {
      // dispatch(setchooseFromMap())
      setCurrentPosSelected(false)
      // setChooseFromAddressBook(false)
      dispatch(setChooseFromAddressBook({ status: false }))
    }
    if (label) {
      setName(label)
    }
    if (addressFreeText) {
      setDetails(addressFreeText)
    }
    if (selectedCityAndArea) {
      setCoordinates({
        ...coordinates,
        latitude: +selectedArea.location.location.coordinates[1],
        longitude: +selectedArea.location.location.coordinates[0]
      })
    }
  }, [chooseFromMap, selectedCityAndArea])

  const [mutate] = useMutation(CREATE_ADDRESS, {
    onCompleted: (data) => {
      console.log({ data })
      refetchProfile()
      dispatch(resetAddNewAddress())
      navigation.navigate('Main')
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  // const setAddressLocation = async (address) => {
  //   console.log({ address })
  //   // setChooseFromAddressBook(true)
  //   dispatch(setchooseFromAddressBook({ status: true }))
  //   // setLocation({
  //   //   _id: address._id,
  //   //   label: address.label,
  //   //   latitude: Number(address.location.coordinates[1]),
  //   //   longitude: Number(address.location.coordinates[0]),
  //   //   deliveryAddress: address.deliveryAddress,
  //   //   details: address.details
  //   // })
  //   // mutate({ variables: { id: address._id } })
  //   setCoordinates({
  //     ...coordinates,
  //     latitude: +address.location.coordinates[1],
  //     longitude: +address.location.coordinates[0]
  //   })
  //   setFormattedAddress(address.deliveryAddress)
  //   setCurrentPosSelected(false)
  //   if (chooseFromMap) {
  //     dispatch(setchooseFromMap({ status: false }))
  //   }
  //   setName(address.label)
  //   setDetails(address.details)
  //   modalRef.current.close()
  // }

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
  //           dispatch(setchooseFromMap({ status: false }))
  //           // setChooseFromAddressBook(false)
  //           dispatch(setChooseFromAddressBook({ status: false }))
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

  // const handleChooseAddress = () => {
  //   modalRef.current.open()
  // }

  console.log({ locationMap })

  const handleSubmit = () => {
    console.log({
      selectedCityAndArea,
      locationMap
    })
    const addressInput = {
      _id: '',
      label: name,
      latitude: String(locationMap.latitude),
      longitude: String(locationMap.longitude),
      deliveryAddress: currentInput,
      details: details
    }
    mutate({ variables: { addressInput } })
    // if (chooseFromMap) {
    // dispatch(
    //   setAddress({
    //     addressFrom: currentInput,
    //     regionFrom: locationMap,
    //     addressFreeText: details,
    //     label: name
    //   })
    // )

    // } else if (selectedCityAndArea) {
    //   // const newCoordinates = {
    //   //   latitude: selectedArea.location.location.coordinates[1],
    //   //   longitude: selectedArea.location.location.coordinates[0],
    //   //   latitudeDelta: 0.01,
    //   //   longitudeDelta: 0.01
    //   // }
    //   //   dispatch(
    //   //     setAddress({
    //   //       address: selectedArea.address,
    //   //       region: locationMap,
    //   //       addressFreeText: details,
    //   //       label: name
    //   //     })
    //   //   )
    //   // } else {
    //   //   dispatch(
    //   //     setAddress({
    //   //       address: formattedAddress,
    //   //       region: coordinates,
    //   //       addressFreeText: details,
    //   //       label: name
    //   //     })
    //   //   )
    //   // }
    // }
  }

  const handleNearestArea = () => {
    setAreasModalVisible(true)
    fetchAreas({ variables: { id: city._id } })
  }

  // const modalFooter = () => (
  //   <View style={styles.addNewAddressbtn}>
  //     <View style={styles.addressContainer}>
  //       <TouchableOpacity
  //         activeOpacity={0.5}
  //         style={styles.addButton}
  //         onPress={() => {
  //           if (isLoggedIn) {
  //             // navigation.navigate('AddNewAddressUser')
  //             navigation.navigate('AddressNewVersion')
  //           } else {
  //             navigation.navigate('SelectLocation', {
  //               ...location
  //             })
  //             const modal = modalRef.current
  //             modal?.close()
  //           }
  //         }}
  //       >
  //         <View style={{ ...styles.addressSubContainer, gap: 5 }}>
  //           <AntDesign name='pluscircleo' size={scale(20)} color={'#fff'} />
  //           <View style={styles.mL5p} />
  //           <TextDefault bold H4>
  //             {t('addAddress')}
  //           </TextDefault>
  //         </View>
  //       </TouchableOpacity>
  //     </View>
  //     <View style={styles.addressTick}></View>
  //   </View>
  // )

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: chooseFromMap ? 'green' : '#eee',
          justifyContent: 'space-between'
        }}
        onPress={() => {
          // dispatch(setChooseFromMap({ status: true }))
          navigation.navigate('AddressFromMap')
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Entypo
            name='location-pin'
            size={22}
            color={chooseFromMap ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: chooseFromMap ? 'green' : '#000'
            }}
          >
            حدد الموقع على الخريطة
          </Text>
        </View>
        {chooseFromMap && (
          <AntDesign name='checkcircleo' size={24} color='green' />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: selectedCityAndArea ? 'green' : '#eee',
          justifyContent: 'space-between'
        }}
        onPress={handleNearestArea}
      >
        <View style={{ flexDirection: 'row' }}>
          <MaterialIcons
            name='location-city'
            size={22}
            color={selectedCityAndArea ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: selectedCityAndArea ? 'green' : '#000'
            }}
          >
            اختر أقرب منطقة {selectedArea ? `- (${selectedArea.title})` : null}
          </Text>
        </View>
        {selectedCityAndArea && (
          <AntDesign name='checkcircleo' size={24} color='green' />
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <Text style={styles.label}>اسم المكان</Text>
      <TextInput
        style={styles.input}
        placeholder='مثلاً: المنزل، العمل، إلخ'
        placeholderTextColor='#aaa'
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>تفاصيل العنوان (اختياري)</Text>
      <TextInput
        style={styles.input}
        placeholder='عمارة بجوار بنك مصر...'
        placeholderTextColor='#aaa'
        value={details}
        onChangeText={setDetails}
      />

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>{t('save_new_address')}</Text>
      </TouchableOpacity>

      {/* choose from address book modal */}
      {/* <MainModalize
        modalRef={modalRef}
        // currentTheme={currentTheme}
        isLoggedIn={isLoggedIn}
        addressIcons={addressIcons}
        modalHeader={modalFooter}
        // modalFooter={modalFooter}
        setAddressLocation={setAddressLocation}
        profile={profile}
        location={location}
      /> */}

      {/* cities modal */}
      <Modal visible={citiesModalVisible} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.halfModal}>
            <Text style={styles.modalTitle}>اختر المدينة</Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {cities?.map((city) => (
                <TouchableOpacity
                  key={city._id}
                  onPress={() => {
                    dispatch(setSelectedCity(city))
                    fetchAreas({ variables: { id: city._id } })
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
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* areas modal */}
      <Modal visible={areasModalVisible} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.halfModal}>
            <Text style={styles.modalTitle}>
              اختر المنطقة داخل {city?.title}
            </Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {loadingAreas ? <TextDefault>Loading...</TextDefault> : null}
              {areasList?.map((area) => (
                <TouchableOpacity
                  key={area._id}
                  onPress={() => {
                    dispatch(setSelectedArea(area))
                    setAreasModalVisible(false)
                    navigation.navigate('AddressFromMap')
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
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default AddressNewVersion

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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 12
  },
  optionText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#000'
  },
  label: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: 'bold'
  },
  addNewAddressbtn: {
    padding: scale(5),
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
    height: scale(40),
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
