import React, { useState } from 'react'
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { TextDefault } from '../../components'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/AntDesign'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { colors, scale, TIMES } from '../../utilities'
import Ionicons from 'react-native-vector-icons/Ionicons'
// import styles from './styles'
import {
  getCityAreas,
  muteRingOrder,
  newCheckoutPlaceOrder
} from '../../apollo'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useSelector } from 'react-redux'
import OverlayCreateOrder from '../../components/Overlay/OverlayCreateOrder'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAcceptOrder, useOrderRing } from '../../ui/hooks'

const GET_CITY_AREAS = gql`
  ${getCityAreas}
`

const AddNewOrder = ({ navigation }) => {
  const { t } = useTranslation()
  const [userData, setUserData] = useState({
    phone: '',
    name: '',
    addressDetails: '',
    preparationTime: ''
  })
  const [areaIsVisible, setAreaIsVisible] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locationAddress, setLocationAddress] = useState('')
  const [selectedArea, setSelectedArea] = useState(null)
  const [cost, setCost] = useState(0)
  const [selectedTime, setSelectedTime] = useState(TIMES[1])
  const [overlayVisible, setOverlayVisible] = useState(false)
  const { acceptOrder } = useAcceptOrder()
  const { muteRing } = useOrderRing()

  const { cityId } = useSelector(state => state.city)

  const [mutateCreateOrder] = useMutation(newCheckoutPlaceOrder, {
    onCompleted: data => {
      console.log({ data })
      acceptOrder(data.newCheckoutPlaceOrder._id, selectedTime.toString())
      muteRing(data.newCheckoutPlaceOrder.orderId)
      navigation.navigate('Orders')
      Alert.alert(
        `${t('ordersuccessfullycreated')}`,
        `${t('ordernumber')} ${data?.newCheckoutPlaceOrder?.orderId}`
      )
    },
    onError: error => {
      console.log({ error })
    }
  })

  const {
    data: dataAreas,
    loading: loadingAreas,
    error: errorAreas
  } = useQuery(GET_CITY_AREAS, {
    skip: !cityId,
    variables: { id: cityId }
  })

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible)
  }

  console.log({ selectedArea })

  const handleOrderSubmit = async () => {
    if (!userData.phone) {
      Alert.alert('Error', `Please fill phone number`)
      return
    }
    if (!selectedArea) {
      Alert.alert('Error', `Please select area`)
      return
    }
    const restaurantId = await AsyncStorage.getItem('restaurantId')
    mutateCreateOrder({
      variables: {
        input: {
          phone: userData?.phone,
          areaId: selectedArea?._id,
          addressDetails: userData?.addressDetails,
          orderAmount: parseFloat(cost) ? parseFloat(cost) : 0,
          restaurantId,
          preparationTime: selectedTime
        }
      }
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <TouchableOpacity
          style={{ marginRight: 10, marginTop: 30 }}
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
                value={userData.phone}
                onChangeText={text => setUserData({ ...userData, phone: text })}
                placeholder={`${t('enterphone')} *`}
                style={styles.inputs}
                keyboardType="number-pad"
              />
              <TextInput
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
                  {selectedArea ? selectedArea.title : `${t('select_area')} *`}
                </TextDefault>
              </TouchableOpacity>
              <TextInput
                value={userData.addressDetails}
                onChangeText={text =>
                  setUserData({ ...userData, addressDetails: text })
                }
                // multiline
                // numberOfLines={4}
                placeholder={`${t('address_details')}`}
                style={styles.inputs}
              />
              <TextInput
                value={cost}
                onChangeText={text => setCost(text)}
                placeholder={t('entercost')}
                style={styles.inputs}
                keyboardType="number-pad"
              />
              <OverlayCreateOrder
                visible={overlayVisible}
                toggle={toggleOverlay}
                createOrder={handleOrderSubmit}
                navigation={navigation}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />
            </View>
            <TouchableOpacity
              onPress={toggleOverlay}
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

export default AddNewOrder
