import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  ScrollView,
  Alert
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
import { moderateScale } from '../../utils/scaling'
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
import Toast from 'react-native-toast-message'

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
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
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
      headerTitleStyle: {
        fontSize: moderateScale(14),
        color: '#000'
      },
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#fff'
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            dispatch(resetAddNewAddress())
            navigation.goBack()
          }}
          style={{ paddingHorizontal: 15 }}
        >
          <Ionicons name='arrow-back' size={moderateScale(22)} color='#000' />
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

  console.log({ locationMap })

  const handleSubmit = () => {
    console.log({
      selectedCityAndArea,
      locationMap
    })
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
    const addressInput = {
      _id: '',
      label: name,
      latitude: String(locationMap.latitude),
      longitude: String(locationMap.longitude),
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
          justifyContent: 'space-between',
          flexDirection: isArabic ? 'row' : 'row-reverse'
        }}
        onPress={() => {
          // dispatch(setChooseFromMap({ status: true }))
          navigation.navigate('AddressFromMap')
        }}
      >
        <View style={{ flexDirection: isArabic ? 'row' : 'row-reverse' }}>
          <Entypo
            name='location-pin'
            size={moderateScale(22)}
            color={chooseFromMap ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: chooseFromMap ? 'green' : '#000'
            }}
          >
            {t('locate_on_map')}
          </Text>
        </View>
        {chooseFromMap && (
          <AntDesign
            name='checkcircleo'
            size={moderateScale(20)}
            color='green'
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: selectedCityAndArea ? 'green' : '#eee',
          justifyContent: 'space-between',
          flexDirection: isArabic ? 'row' : 'row-reverse'
        }}
        onPress={handleNearestArea}
      >
        <View style={{ flexDirection: isArabic ? 'row' : 'row-reverse' }}>
          <MaterialIcons
            name='location-city'
            size={moderateScale(22)}
            color={selectedCityAndArea ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: selectedCityAndArea ? 'green' : '#000'
            }}
          >
            {t('choose_nearest_area')}{' '}
            {selectedArea ? `- (${selectedArea.title})` : null}
          </Text>
        </View>
        {selectedCityAndArea && (
          <AntDesign
            name='checkcircleo'
            size={moderateScale(20)}
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
            <Text style={styles.modalTitle}>{t('choose_city')}</Text>

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
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* areas modal */}
      <Modal visible={areasModalVisible} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.halfModal}>
            <Text style={styles.modalTitle}>
              {t('choose_area_in')} {city?.title}
            </Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {loadingAreas ? <TextDefault>Loading...</TextDefault> : null}
              {areasList?.map((area) => (
                <TouchableOpacity
                  key={area._id}
                  onPress={() => {
                    // dispatch(setSelectedArea(area))
                    setAreasModalVisible(false)
                    navigation.navigate('AddressFromMap', {
                      area
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
              <Text style={styles.cancelText}>{t('cancel')}</Text>
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
    color: '#000',
    fontSize: moderateScale(12)
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#2ecc71',
    padding: moderateScale(14),
    borderRadius: moderateScale(25),
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
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333'
  },
  scrollContainer: {
    paddingBottom: 20
  },
  modalItem: {
    paddingVertical: moderateScale(14),
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
    paddingVertical: moderateScale(12)
  },
  cancelText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    color: '#333'
  }
})
