import {
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { colors, scale } from '../../utilities'
import { TextDefault } from '../../components'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Montserrat_200ExtraLight } from '@expo-google-fonts/montserrat'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'react-native'
import { getCities, getGovernate } from '../../utilities/apiServices'
import { useNavigation, useRoute } from '@react-navigation/native'
import {
  FIND_OR_CREATE_USER,
  UPDATE_USER_ADDRESS,
  getCityAreas
} from '../../apollo'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RestaurantContext } from '../../contexts/restaurant'
import Icon from 'react-native-vector-icons/AntDesign'
import 'react-native-get-random-values'
import { useSelector } from 'react-redux'
import * as SecureStore from 'expo-secure-store'

const { width, height } = Dimensions.get('window')

const GET_CITY_AREAS = gql`
  ${getCityAreas}
`

const token =
  'nzu3zF6IpFPbvb-8-JY6dwcOJsKDhqXbW4bLkbWjrtt0ldh0ZHc0tTkr0GfqOSdaM4U'
const AddNewAddress = () => {
  const { t } = useTranslation()
  const { user } = useRoute().params
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isClicked, setIsClicked] = useState(false)
  const [checkoutModal, setCheckoutModal] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isVisible2, setIsVisible2] = useState(false)
  const [areaIsVisible, setAreaIsVisible] = useState(false)
  const [userData, setUserData] = useState({
    address: ''
  })
  const [cities, setCities] = useState([])
  const [currentData, setCurrentData] = useState([])
  const [governate, setGovernate] = useState([])
  const cityRef = useRef < TextInput > null
  const stateRef = useRef < TextInput > null
  const [selectedGovernate, setSelectedGovernate] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState(null)
  const [locationAddress, setLocationAddress] = useState('')
  // const { city, setCity } = useContext(RestaurantContext)
  const { cityId } = useSelector(state => state.city)

  const getCity = async () => {
    const city = await SecureStore.getItemAsync('cityId')

    if (city) {
      const value = JSON.parse(city)
      console.log({ value })
      return value
    }
    return null
  }

  console.log({ cityId: getCity() })

  const {
    data: dataAreas,
    loading: loadingAreas,
    error: errorAreas
  } = useQuery(GET_CITY_AREAS, {
    skip: !cityId,
    variables: { id: cityId }
  })

  console.log({ here: dataAreas })
  // console.log({ city })

  const navigation = useNavigation()
  const laodGovernates = async () => {
    await getGovernate()
      .then(res => {
        if (res) {
          setGovernate(res.data)
        }
      })
      .catch(res => console.log(res))
  }
  const loadCities = async () => {
    await getCities(selectedGovernate)
      .then(res => {
        if (res) {
          console.log(res.data)
          setCities(res.data)
        }
      })
      .catch(res => console.log(res))
  }
  const [updateUserAddress, { loading, error }] = useMutation(
    UPDATE_USER_ADDRESS,
    {
      onCompleted: data => {
        // Alert.alert('Success', `User ID: ${data.updateUserAddress._id}`);
        console.log('User created =========>>>>>>>>>>>>>>', data)
        navigation.navigate('Checkout', {
          userData: data?.updateUserAddress
        })
      },
      onError: error => {
        console.log('Error======>>>>>>>>', error.message)
      }
    }
  )

  useEffect(() => {
    laodGovernates()
  }, [])

  const onSave = () => {
    let addresses = []
    if (locationAddress) {
      const addressItem = {
        deliveryAddress: `${locationAddress}`,
        details: userData.address || 'APT 1',
        label: 'Home',
        selected: true,
        latitude: String(selectedLocation.latitude),
        longitude: String(selectedLocation.longitude)
      }
      addresses.push(addressItem)
    }
    updateUserAddress({
      variables: {
        userInput: {
          userId: user?._id,
          area: selectedArea?._id,
          details: userData.address || 'APT 1',
          addresses,
          type: locationAddress.length ? 'google_api' : 'area'
        }
      }
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 99999999999999999
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back-outline"
              size={scale(25)}
              color={'#000'}
            />
          </TouchableOpacity>
        </View>
        <Image
          source={require('../../assets/orders.png')}
          resizeMode="center"
          style={{ height: scale(100), width: scale(200), alignSelf: 'center' }}
        />

        <View style={{ flex: 1 }}>
          <TextDefault
            H5
            bold
            style={{
              marginHorizontal: 10,
              textAlign: 'center',
              marginHorizontal: scale(30),
              marginBottom: 20
            }}
            textColor={'#000'}>
            {t('Add new address')}
          </TextDefault>
          <View style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            <View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  marginHorizontal: 16
                }}
                onPress={() => {
                  setAreaIsVisible(!areaIsVisible)
                }}>
                <TextDefault
                  style={{
                    color: '#000',
                    textTransform: 'capitalize'
                  }}>
                  {selectedArea ? selectedArea.title : `Select area`}
                </TextDefault>
              </TouchableOpacity>
              <TextInput
                value={userData.address}
                onChangeText={text =>
                  setUserData({ ...userData, address: text })
                }
                multiline
                numberOfLines={4}
                placeholder={`${t('Address details')} ex: 2nd floor`}
                style={styles.inputs}
              />
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginVertical: 10
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsClicked(!isClicked)
                  }}>
                  <Text>
                    <Icon
                      name={isClicked ? 'upcircle' : 'downcircle'}
                      size={30}
                    />
                  </Text>
                </TouchableOpacity>
              </View>
              {isClicked ? (
                <View style={{ marginBottom: 80 }}>
                  <GooglePlacesAutocomplete
                    placeholder={t('searchforaplace')}
                    onPress={(data, details = null) => {
                      setLocationAddress(details?.formatted_address)
                      setSelectedLocation({
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng
                      })
                    }}
                    query={{
                      key: 'AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY',
                      language: 'ar',
                      region: 'EG'
                    }}
                    fetchDetails={true}
                    styles={{
                      container: {
                        flex: 1
                      },
                      listView: {
                        height: 500
                      },
                      textInput: styles.inputs
                    }}
                    flatListProps={{
                      scrollEnabled: true
                    }}
                  />
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onSave}
              style={{
                backgroundColor: '#000',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: scale(100),
                padding: 10,
                marginHorizontal: 16,
                borderRadius: 10
              }}>
              <TextDefault H4 bold textColor={'#fff'}>
                {t('saveandcontinue')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={areaIsVisible} transparent animationType="slide">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setAreaIsVisible(false)}
            style={{
              flex: 1,
              backgroundColor: '#00000050',
              marginBottom: -20
            }}></TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 20
            }}
            style={{
              flex: 1,
              backgroundColor: colors.green,
              padding: 16,
              height: 400,
              elevation: 10,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10
            }}>
            {dataAreas?.areasByCity?.map(area => {
              console.log({ area })
              return (
                <TouchableOpacity
                  key={area._id}
                  style={{
                    backgroundColor:
                      selectedArea?._id === area._id ? '#000' : '#fff',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3
                  }}
                  onPress={() => {
                    if (selectedArea?._id === area._id) {
                      setSelectedArea(null)
                    } else {
                      setSelectedArea(area)
                      setAreaIsVisible(false)
                    }
                  }}>
                  <TextDefault
                    style={{
                      color: selectedArea?._id === area._id ? '#fff' : '#000',
                      textTransform: 'capitalize'
                    }}>
                    {area.title}
                  </TextDefault>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AddNewAddress

const styles = StyleSheet.create({
  inputs: {
    backgroundColor: '#fff',
    marginHorrizontal: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginVertical: 10,
    marginHorizontal: 16,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16
  }
})
