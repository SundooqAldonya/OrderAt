import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  getDeliveryCalculation,
  getRestaurantCity,
  muteRingOrder,
  newCheckoutPlaceOrder
} from '../../apollo'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useSelector } from 'react-redux'
import OverlayCreateOrder from '../../components/Overlay/OverlayCreateOrder'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAcceptOrder, useAccount, useOrderRing } from '../../ui/hooks'
import { Fragment } from 'react'
import { Configuration } from '../../ui/context'
import { useContext } from 'react'
import Feather from '@expo/vector-icons/Feather'

const GET_CITY_AREAS = gql`
  ${getCityAreas}
`

const AddNewOrder = ({ navigation }) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [userData, setUserData] = useState({
    phone: '',
    name: '',
    addressDetails: '',
    preparationTime: ''
  })
  const [search, setSearch] = useState('')
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
  const { data: restaurantData } = useAccount()
  const { currencySymbol } = useContext(Configuration.Context)

  const [mutateCreateOrder, { loading: loadingMutation }] = useMutation(
    newCheckoutPlaceOrder,
    {
      onCompleted: data => {
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
    }
  )

  const [
    fetchAreas,
    { data: dataAreas, loading: loadingAreas, error: errorAreas }
  ] = useLazyQuery(GET_CITY_AREAS)

  useEffect(() => {
    if (restaurantData?.restaurant) {
      fetchAreas({ variables: { id: restaurantData?.restaurant?.city?._id } })
    }
  }, [restaurantData])

  // const addressInfo = null
  const shouldSkip =
    !selectedArea ||
    !restaurantData?.restaurant?.location?.coordinates?.[0] ||
    !restaurantData?.restaurant?.location?.coordinates?.[1]

  console.log({ selectedLocation: restaurantData?.restaurant?.location })

  const { data, loading, error } = useQuery(getDeliveryCalculation, {
    variables: {
      destLong: selectedLocation?.coordinates
        ? Number(selectedLocation?.coordinates[0])
        : null,
      destLat: selectedLocation?.coordinates
        ? Number(selectedLocation?.coordinates[1])
        : null,
      originLong: restaurantData?.restaurant?.location?.coordinates
        ? Number(restaurantData?.restaurant?.location?.coordinates[0])
        : null,
      originLat: restaurantData?.restaurant?.location?.coordinates
        ? Number(restaurantData?.restaurant?.location?.coordinates[1])
        : null
    },
    skip: shouldSkip,
    // pollInterval: 10000,
    fetchPolicy: 'network-only'
  })

  const deliveryFee = data?.getDeliveryCalculation?.amount || 0

  const validated = () => {
    // if (!userData.phone) {
    //   Alert.alert('Error', `Please fill phone number`)
    //   return false
    // }
    if (
      userData.phone?.length &&
      (userData.phone?.length > 11 || userData.phone.length < 11)
    ) {
      Alert.alert('Error', t('digits_error'))
      return false
    }
    if (!selectedArea) {
      Alert.alert('Error', `Please select area`)
      return false
    }
    return true
  }

  const toggleOverlay = () => {
    console.log({ validated: validated() })
    if (validated()) {
      setOverlayVisible(!overlayVisible)
    }
  }

  const handleOrderSubmit = async () => {
    const restaurantId = await AsyncStorage.getItem('restaurantId')
    mutateCreateOrder({
      variables: {
        input: {
          phone: userData?.phone ? userData.phone : '01000000000',
          areaId: selectedArea?._id,
          addressDetails: userData?.addressDetails,
          orderAmount: parseFloat(cost) ? parseFloat(cost) : 0,
          restaurantId,
          preparationTime: selectedTime
          // deliveryFee: parseFloat(deliveryFee)
        }
      }
    })
  }

  const filteredAreas = useMemo(() => {
    return (
      dataAreas?.areasByCity?.filter(area =>
        area.title.toLowerCase().includes(search.toLowerCase())
      ) || []
    )
  }, [dataAreas, search])

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
        style={{
          height: scale(100),
          width: scale(200),
          alignSelf: 'center',
          marginTop: -30
        }}
      />

      <View style={{ flex: 1 }}>
        <View>
          <TextDefault
            H5
            bold
            style={{
              textAlign: 'center',
              marginHorizontal: scale(30),
              marginVertical: 10
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
                placeholderTextColor="#999"
              />
              <TextInput
                value={userData.name}
                onChangeText={text => setUserData({ ...userData, name: text })}
                placeholder={t('fullname')}
                style={styles.inputs}
                placeholderTextColor="#999"
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
                  marginHorizontal: 16,
                  marginVertical: 10
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
                placeholderTextColor="#999"
                placeholder={`${t('address_details')}`}
                style={styles.inputs}
              />
              <TextInput
                value={cost}
                onChangeText={text => setCost(text)}
                placeholder={t('entercost')}
                style={styles.inputs}
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
              {selectedArea ? (
                <View style={styles.fareBox}>
                  {loading ? (
                    <Text>Loading...</Text>
                  ) : (
                    <Text
                      style={{
                        textAlign: isArabic ? 'right' : 'left',
                        color: 'grey'
                      }}>
                      {t('delivery_fee')}:{' '}
                      {deliveryFee ? deliveryFee : t('free')}{' '}
                      {deliveryFee ? currencySymbol : null}
                    </Text>
                  )}
                </View>
              ) : null}
              <OverlayCreateOrder
                visible={overlayVisible}
                toggle={toggleOverlay}
                createOrder={handleOrderSubmit}
                loading={loadingMutation}
                navigation={navigation}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />
            </View>
            <TouchableOpacity
              onPress={toggleOverlay}
              disabled={loadingMutation}
              style={{
                backgroundColor: loadingMutation ? 'grey' : '#000',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: scale(100),
                padding: 10,
                marginHorizontal: 16,
                borderRadius: 10
              }}>
              <TextDefault H4 bold textColor={'#fff'}>
                {loadingMutation ? t('loading') : t('saveandcontinue')}
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
            backgroundColor: '#00000080' // darker overlay
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
          <View
            style={{
              backgroundColor: colors.green,
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 10,
              flex: 1
              // position: 'absolute',
              // bottom: 0,
              // width: '100%',
              // maxHeight: '70%',
              // backgroundColor: colors.green,
              // padding: 20,
              // borderTopLeftRadius: 20,
              // borderTopRightRadius: 20,
              // shadowColor: '#000',
              // shadowOffset: { width: 0, height: -3 },
              // shadowOpacity: 0.2,
              // shadowRadius: 6,
              // elevation: 10
            }}>
            <TextDefault bolder style={{ fontSize: 16, marginBottom: 16 }}>
              أختر المنطقة
            </TextDefault>
            <TextInput
              placeholder="ابحث عن المنطقة..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
                fontSize: 14,
                marginBottom: 16
              }}
            />
            <ScrollView
              contentContainerStyle={{
                flexDirection: 'column', // vertical list
                gap: 12
              }}
              showsVerticalScrollIndicator={false}>
              {loadingAreas ? <TextDefault>Loading....</TextDefault> : null}
              {filteredAreas?.map(area => (
                <TouchableOpacity
                  key={area._id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3
                  }}
                  onPress={() => {
                    if (selectedArea?._id === area._id) {
                      setSelectedArea(null)
                      setSelectedLocation(null)
                    } else {
                      setSelectedArea(area)
                      setSelectedLocation(area.location.location)
                      setAreaIsVisible(false)
                    }
                  }}>
                  <TextDefault
                    style={{
                      color: '#000',
                      fontSize: 16,
                      textTransform: 'capitalize'
                    }}>
                    {area.title}
                  </TextDefault>
                  {selectedArea?._id === area._id && (
                    <Feather name="check" size={20} color="green" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  },
  fareBox: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 16,
    marginTop: 10
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000080'
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.green,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10
  },
  areaChip: isSelected => ({
    backgroundColor: isSelected ? '#000' : '#fff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3
  }),
  areaText: isSelected => ({
    color: isSelected ? '#fff' : '#000',
    fontSize: 14,
    textTransform: 'capitalize'
  })
})

export default AddNewOrder
