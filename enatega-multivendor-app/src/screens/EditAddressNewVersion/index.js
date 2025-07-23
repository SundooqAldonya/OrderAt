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
import {
  createAddress,
  editAddress,
  selectAddress
} from '../../apollo/mutations'
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

const EDIT_ADDRESS = gql`
  ${editAddress}
`

const GET_CITIES = gql`
  ${getCities}
`
const GET_CITIES_AREAS = gql`
  ${getCityAreas}
`
const EditAddressNewVersion = () => {
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
  // const modalRef = useRef()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const city = useSelector((state) => state.city.city)
  // const [currentPosSelected, setCurrentPosSelected] = useState(false)

  console.log({ chooseFromAddressBook })
  // const [formattedAddress, setFormattedAddress] = useState('')
  // const { getAddress } = useGeocoding()
  const { refetchProfile } = useContext(UserContext)
  // const { location, setLocation } = useContext(LocationContext)
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

  const { address, id, longitude, latitude, prevScreen } = route.params || {}

  console.log({ address, id })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('edit_address'),
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
    if (locationMap) {
      setCoordinates({
        ...coordinates,
        latitude: locationMap.latitude,
        longitude: locationMap.longitude
      })
    }
  }, [locationMap])

  useEffect(() => {
    if (longitude && latitude) {
      dispatch(
        setAddress({
          region: { latitude, longitude },
          address: address.deliveryAddress,
          label: address.label,
          addressFreeText: address.details
        })
      )
    }
  }, [longitude, latitude])

  useEffect(() => {
    // dispatch(resetAddNewAddress())
    if (address && latitude && longitude) {
      setName(address.label || '')
      setDetails(address.details || '')

      setCoordinates({
        latitude: +latitude,
        longitude: +longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      })
    }
  }, [address, latitude, longitude])

  useEffect(() => {
    if (chooseFromMap) {
      // dispatch(setchooseFromMap())
      // setCurrentPosSelected(false)
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

  const [mutate] = useMutation(EDIT_ADDRESS, {
    onCompleted: (data) => {
      console.log({ data })
      refetchProfile()
      dispatch(resetAddNewAddress())
      navigation.navigate(prevScreen)
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  console.log({ coordinates })

  const handleSave = () => {
    console.log({
      selectedCityAndArea,
      coordinates
    })
    const addressInput = {
      _id: id,
      label: name,
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      deliveryAddress: currentInput,
      details: details
    }
    mutate({ variables: { addressInput } })
  }

  const handleNearestArea = () => {
    setAreasModalVisible(true)
    fetchAreas({ variables: { id: city._id } })
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: chooseFromMap ? 'green' : '#eee',
          justifyContent: 'space-between'
        }}
        onPress={() => {
          dispatch(setChooseFromMap({ status: true }))
          navigation.navigate('EditAddressFromMap', {
            address,
            id: address._id,
            prevScreen
          })
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t('save_new_address')}</Text>
      </TouchableOpacity>

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
                    navigation.navigate('EditAddressFromMap', {
                      address,
                      id: address._id,
                      prevScreen
                    })
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

export default EditAddressNewVersion

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
