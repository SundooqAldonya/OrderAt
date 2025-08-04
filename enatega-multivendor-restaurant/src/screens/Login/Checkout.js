import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextDefault } from '../../components'
import { TIMES, colors, scale } from '../../utilities'
import { TabActions, useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'react-native'
import { useMutation } from '@apollo/client'
import { CHECK_OUT_PLACE_ORDER } from '../../apollo/mutations'
import { Modal } from 'react-native'
import OverlayCreateOrder from '../../components/Overlay/OverlayCreateOrder'
import { useAcceptOrder, useOrderRing } from '../../ui/hooks'

const { width, height } = Dimensions.get('window')

const Checkout = () => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { userData } = useRoute().params
  const navigation = useNavigation()
  const [selectedAddress, setSelectedAddress] = useState({})
  const [amount, setAmount] = useState(null)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const { acceptOrder } = useAcceptOrder()
  const { muteRing } = useOrderRing()
  const [selectedTime, setSelectedTime] = useState(TIMES[0])

  useEffect(() => {
    setSelectedAddress(userData.addresses[0])
  }, [])

  const [checkoutPlaceOrder, { loading, error, data }] = useMutation(
    CHECK_OUT_PLACE_ORDER,
    {
      onCompleted: data => {
        console.log({ data: data.CheckOutPlaceOrder.orderId })
        acceptOrder(data.CheckOutPlaceOrder._id, selectedTime.toString())
        muteRing(data.CheckOutPlaceOrder.orderId)
        navigation.replace('Orders')
        Alert.alert(
          `${t('ordersuccessfullycreated')}`,
          `${t('ordernumber')} ${data?.CheckOutPlaceOrder?.orderId}`
        )
      },
      onError: err => {
        console.log({ err })
      }
    }
  )

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible)
  }

  const createOrder = async () => {
    if (!userData._id || !selectedAddress._id || !amount) {
      Alert.alert('Error', `Please fill all fields`)
      return
    }
    const restaurant = await AsyncStorage.getItem('restaurantId')
    checkoutPlaceOrder({
      variables: {
        userId: userData._id,
        addressId: selectedAddress?._id,
        orderAmount: parseFloat(amount),
        resId: restaurant
      }
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
      <ScrollView>
        <Image
          source={require('../../assets/orders.png')}
          style={{
            width: width,
            height: scale(width / 3),
            backgroundColor: '#fff'
          }}
        />
        <TextDefault
          H3
          bold
          textColor={colors.fontMainColor}
          style={{
            marginHorizontal: 10,
            marginVertical: 7,
            textAlign: isArabic ? 'right' : 'left'
          }}>
          {t('confirmorder')}
        </TextDefault>
        <View
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            margin: 10
          }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}>
            <Ionicons name="person-circle" size={scale(18)} />
            <TextDefault H5>{userData?.name}</TextDefault>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: colors.green,
              marginVertical: 10,
              opacity: 0.2
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}>
            <Ionicons name="person-circle" size={scale(18)} />
            <TextDefault H5>{userData?.phone}</TextDefault>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: colors.green,
              marginVertical: 10,
              opacity: 0.2
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}>
            <FontAwesome name="location-arrow" size={scale(18)} />
            <TextDefault H5>{t('chooseaddress')}</TextDefault>
          </View>
          {userData?.addresses?.map((item, index) => {
            return (
              <TouchableOpacity
                key={item._id}
                style={{
                  backgroundColor: 'whitesmoke',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  margin: 5,
                  marginTop: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'powderblue'
                }}
                onPress={() => setSelectedAddress(item)}>
                <View style={{ flex: 1 }}>
                  <TextDefault>{item.deliveryAddress}</TextDefault>
                  <TextDefault style={{ color: 'red', fontWeight: 'bold' }}>
                    {item.label}
                  </TextDefault>
                  <TextDefault>
                    {item.details ? item.details : null}
                  </TextDefault>
                </View>
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderWidth: 3,
                    borderColor: colors.green,
                    borderRadius: 20
                  }}>
                  {selectedAddress?.deliveryAddress == item?.deliveryAddress ? (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: colors.green,
                        margin: 2,
                        borderRadius: 20
                      }}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              width: '95%',
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8
            }}
            onPress={() => {
              navigation.navigate('AddNewAddress', {
                user: userData
              })
            }}>
            <TextDefault>{t('add_new_address')}</TextDefault>
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            marginHorizontal: 10,
            marginVertical: 10,
            marginBottom: 20,
            paddingHorizontal: 10,
            borderRadius: 10,
            borderWidth: 2,
            height: 55,
            borderColor: colors.darkgreen,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder={t('entercost')}
            style={{
              flex: 1,
              alignSelf: 'flex-start',
              fontFamily: 'Montserrat_500Medium',
              height: 55
            }}
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={toggleOverlay}
        style={{
          backgroundColor: '#000',
          marginBottom: scale(80),
          marginHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          borderRadius: 10
        }}>
        <TextDefault H4 bold textColor={'#fff'}>
          {t('confirmorder')}
        </TextDefault>
        <OverlayCreateOrder
          visible={overlayVisible}
          toggle={toggleOverlay}
          createOrder={createOrder}
          navigation={navigation}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Checkout

const styles = StyleSheet.create({})
