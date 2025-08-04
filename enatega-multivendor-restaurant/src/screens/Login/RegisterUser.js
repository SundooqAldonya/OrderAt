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
import { FIND_OR_CREATE_USER, getCityAreas } from '../../apollo'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RestaurantContext } from '../../contexts/restaurant'
import Icon from 'react-native-vector-icons/AntDesign'
import { useSelector } from 'react-redux'
import 'react-native-get-random-values'

// const { width, height } = Dimensions.get('window')

const GET_CITY_AREAS = gql`
  ${getCityAreas}
`
const RegisterUser = () => {
  const { t } = useTranslation()
  const { phone } = useRoute().params
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isClicked, setIsClicked] = useState(false)
  const [areaIsVisible, setAreaIsVisible] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    governate: '',
    phone: phone,
    address: ''
  })
  const [selectedArea, setSelectedArea] = useState(null)
  const [locationAddress, setLocationAddress] = useState('')
  const { cityId } = useSelector(state => state.city)
  console.log({ cityId })

  const {
    data: dataAreas,
    loading: loadingAreas,
    error: errorAreas
  } = useQuery(GET_CITY_AREAS, {
    skip: !cityId,
    variables: { id: cityId }
  })

  const navigation = useNavigation()

  const [findOrCreateUser, { loading, error }] = useMutation(
    FIND_OR_CREATE_USER,
    {
      onCompleted: data => {
        // Alert.alert('Success', `User ID: ${data.findOrCreateUser._id}`);
        console.log('User created =========>>>>>>>>>>>>>>', data)
      },
      onError: error => {
        console.log('Error======>>>>>>>>', error.message)
      }
    }
  )

  const onSave = () => {
    if (!userData.name || !userData.address || !userData.phone) {
      Alert.alert(
        'Validation Error',
        'All fields required you need to feel all fields'
      )
      return
    }
    console.log({ selectedLocation })
    let addresses = []
    if (locationAddress) {
      const addressItem = {
        deliveryAddress: `${locationAddress}, ${userData.governate}`,
        details: userData.address || 'APT 1',
        label: 'Home',
        selected: true,
        latitude: String(selectedLocation.latitude),
        longitude: String(selectedLocation.longitude)
      }
      addresses.push(addressItem)
    }
    findOrCreateUser({
      variables: {
        userInput: {
          name: userData.name,
          phone: userData.phone,
          address_free_text: userData.address || 'APT 1',
          addresses,
          area: selectedArea?._id
        }
      }
    }).then(res => {
      if (res?.data?.findOrCreateUser) {
        setUserData({
          name: '',
          governate: '',
          phone: '',
          address: ''
        })
        setLocationAddress('')
        setSelectedLocation(null)
        Alert.alert('User Created!', 'User successfully created.')
        navigation.navigate('Checkout', {
          userData: res.data?.findOrCreateUser
        })
      }
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={scale(25)} color={'#000'} />
        </TouchableOpacity>
      </View>
      <Image
        source={require('../../assets/orders.png')}
        resizeMode="center"
        style={{ height: scale(100), width: scale(200), alignSelf: 'center' }}
      />

      <View style={{ flex: 1 }}>
        <View>
          <TextDefault
            H5
            bold
            style={{
              marginHorizontal: 10,
              textAlign: 'center',
              marginHorizontal: scale(30)
            }}
            textColor={'#000'}>
            {t('saveuserdetailsandcontinuetocompletetheorder')}
          </TextDefault>
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            <View>
              <TextInput
                placeholderTextColor="#999"
                value={userData.phone}
                onChangeText={text => setUserData({ ...userData, phone: text })}
                placeholder={t('enterphone')}
                style={styles.inputs}
              />
              <TextInput
                placeholderTextColor="#999"
                value={userData.name}
                onChangeText={text => setUserData({ ...userData, name: text })}
                placeholder={t('fullname')}
                style={styles.inputs}
              />

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
                  setAreaIsVisible(true)
                }}>
                <TextDefault
                  style={{
                    color: '#000',
                    textTransform: 'capitalize',
                    marginHorizontal: 'auto'
                  }}>
                  {selectedArea ? selectedArea.title : `${t('select_area')}`}
                </TextDefault>
              </TouchableOpacity>
              <TextInput
                placeholderTextColor="#999"
                value={userData.address}
                onChangeText={text =>
                  setUserData({ ...userData, address: text })
                }
                multiline
                numberOfLines={4}
                placeholder={`${t('address_details')}`}
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
                <View style={{ flex: 1, marginBottom: 20 }}>
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
          </ScrollView>
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
    </SafeAreaView>
  )
}

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

export default RegisterUser
