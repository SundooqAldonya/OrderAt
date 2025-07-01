import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking
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
import { gql, useMutation } from '@apollo/client'
import { scale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
import { alignment } from '../../utils/alignment'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useDispatch, useSelector } from 'react-redux'
import { setAddressTo } from '../../store/requestDeliverySlice'

const SELECT_ADDRESS = gql`
  ${selectAddress}
`
const NewDropoffMandoob = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const route = useRoute()
  const modalRef = useRef()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [currentPosSelected, setCurrentPosSelected] = useState(false)
  const [chooseFromMap, setChooseFromMap] = useState(false)
  const [chooseFromAddressBook, setChooseFromAddressBook] = useState(false)
  const [formattedAddress, setFormattedAddress] = useState('')
  const { getAddress } = useGeocoding()
  const { isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const { addressFrom, regionFrom, addressFreeTextFrom, labelFrom } =
    useSelector((state) => state.requestDelivery)
  console.log({ addressFrom, regionFrom, addressFreeTextFrom, labelFrom })

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const params = route.params || {}
  const currentInput = params.currentInput || null
  const locationMap = params.locationMap || null
  const chooseMap = params.chooseMap || null
  console.log({ currentInput, locationMap, chooseMap })

  const [mutate, { loading: mutationLoading }] = useMutation(SELECT_ADDRESS, {
    onError: (err) => {
      console.log({ err })
    }
  })

  const setAddressLocation = async (address) => {
    setLocation({
      _id: address._id,
      label: address.label,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0]),
      deliveryAddress: address.deliveryAddress,
      details: address.details
    })
    mutate({ variables: { id: address._id } })
    modalRef.current.close()
  }

  const handleCurrentPosition = async () => {
    try {
      if (!currentPosSelected) {
        const { status } = await Location.requestForegroundPermissionsAsync()
        console.log({ status })
        if (status !== 'granted') {
          FlashMessage({
            message:
              'Location permission denied. Please enable it in settings.',
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

            if (res.formattedAddress) {
              setFormattedAddress(res.formattedAddress)
            }
            setCurrentPosSelected(true)
          }
        )
      } else {
        setCurrentPosSelected(false)
      }
    } catch (error) {
      console.log('Error fetching location:', error)
      FlashMessage({ message: 'Failed to get current location. Try again.' })
    }
  }

  const handleChooseAddress = () => {
    modalRef.current.open()
  }

  const handleNext = () => {
    if (chooseMap) {
      dispatch(
        setAddressTo({
          addressTo: currentInput,
          regionTo: locationMap,
          addressFreeTextTo: details,
          labelTo: name
        })
      )
    } else {
      dispatch(
        setAddressTo({
          addressTo: formattedAddress,
          regionTo: location,
          addressFreeTextTo: details,
          labelTo: name
        })
      )
    }

    navigation.navigate('')
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
              navigation.navigate('SelectLocation', {
                ...location
              })
              const modal = modalRef.current
              modal?.close()
            }
          }}
        >
          <View style={styles.addressSubContainer}>
            <AntDesign name='pluscircleo' size={scale(20)} color={'#fff'} />
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
      <Text style={styles.title}>حدد موقع التسليم</Text>

      {/* Location options */}
      <TouchableOpacity
        style={{
          ...styles.option,
          borderColor: currentPosSelected ? 'green' : '#eee',
          justifyContent: 'space-between'
        }}
        onPress={handleCurrentPosition}
      >
        <View style={{ flexDirection: 'row' }}>
          <Feather
            name='navigation'
            size={22}
            color={currentPosSelected ? 'green' : '#000'}
          />
          <Text
            style={{
              ...styles.optionText,
              color: currentPosSelected ? 'green' : '#000'
            }}
          >
            استخدم موقعي الحالي
          </Text>
        </View>
        {currentPosSelected && (
          <AntDesign name='checkcircleo' size={24} color='green' />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleChooseAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Feather name='bookmark' size={22} color='#000' />
          <Text style={styles.optionText}>اختر من عناويني المحفوظة</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('PickupFromMap')}
      >
        <View style={{ flexDirection: 'row' }}>
          <Entypo name='location-pin' size={22} color='#000' />
          <Text style={styles.optionText}>حدد على الخريطة</Text>
        </View>
        {chooseFromMap && (
          <AntDesign name='checkcircleo' size={24} color='green' />
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <Text style={styles.label}>الاسم</Text>
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
      <TouchableOpacity style={styles.saveButton} onPress={handleNext}>
        <Text style={styles.saveButtonText}>{t('continue')}</Text>
      </TouchableOpacity>
      <MainModalize
        modalRef={modalRef}
        // currentTheme={currentTheme}
        isLoggedIn={isLoggedIn}
        addressIcons={addressIcons}
        modalHeader={modalFooter}
        // modalFooter={modalFooter}
        setAddressLocation={setAddressLocation}
        profile={profile}
        location={location}
      />
    </View>
  )
}

export default NewDropoffMandoob

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
    // backgroundColor: colors.primary,
    backgroundColor: colors.dark,
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
  }
})
