import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import React, { Fragment, useContext, useEffect, useState } from 'react'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import useEnvVars from '../../../environment'
import MapView, { Marker } from 'react-native-maps'
import { LocationContext } from '../../context/Location'
import { Controller, useForm } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useMutation, useQuery } from '@apollo/client'
import { getDeliveryCalculation } from '../../apollo/queries'
import { Entypo } from '@expo/vector-icons'
import FromIcon from '../../assets/delivery_from.png'
import ToIcon from '../../assets/delivery_to.png'
import { createDeliveryRequest } from '../../apollo/mutations'
import Toast from 'react-native-toast-message'
import { Image } from 'react-native'

const RequestDelivery = () => {
  const { i18n, t } = useTranslation()
  const navigation = useNavigation()
  const addressInfo = useSelector((state) => state.requestDelivery)
  const isArabic = i18n.language === 'ar'
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const [pickupValue, setPickupValue] = useState('')
  const [pickupCoords, setPickupCoords] = useState(addressInfo.regionFrom)
  const [dropOffCoords, setDropOffCoords] = useState(addressInfo.regionTo)
  const { location } = useContext(LocationContext)
  const [isUrgent, setIsUrgent] = useState(false)
  const [notes, setNotes] = useState('')

  const [mutate] = useMutation(createDeliveryRequest, {
    onCompleted: (data) => {
      console.log({ data })
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t(data.createDeliveryRequest.message),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      navigation.navigate('Main')
    },
    onError: (err) => {
      console.log({ err })
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('somethingWentWrong'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
    }
  })

  const { data, loading, error } = useQuery(getDeliveryCalculation, {
    variables: {
      destLong: Number(addressInfo.regionTo.longitude),
      destLat: Number(addressInfo.regionTo.latitude),
      originLong: Number(addressInfo.regionFrom.longitude),
      originLat: Number(addressInfo.regionFrom.latitude)
    }
  })

  const deliveryFee = data?.getDeliveryCalculation?.amount || null

  console.log({ data, loading, error })

  console.log({ addressInfo })

  const validate = () => {
    if (!notes) {
      Toast.show({
        type: 'error',
        text1: t('important_field'),
        text2: t('notes_required'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (validate()) {
      const payload = {
        pickupLat: +pickupCoords?.latitude,
        pickupLng: +pickupCoords?.longitude,
        pickupAddressText: addressInfo.addressFrom,
        pickupAddressFreeText: addressInfo.addressFreeTextFrom,
        dropoffLat: +dropOffCoords?.latitude,
        dropoffLng: +dropOffCoords?.longitude,
        dropoffAddressText: addressInfo.addressTo,
        dropoffAddressFreeText: addressInfo.addressFreeTextTo,
        deliveryFee,
        requestChannel: 'customer_app',
        is_urgent: isUrgent,
        notes
      }
      console.log('Submitting payload:', payload)

      mutate({
        variables: {
          input: {
            ...payload
          }
        }
      })
    }
  }

  const toggleSwitch = () => {
    setIsUrgent(!isUrgent)
  }

  return (
    <ScrollView keyboardShouldPersistTaps='handled'>
      <View>
        <MapView
          style={{ height: 300 }}
          region={{
            latitude: pickupCoords?.latitude || location.latitude,
            longitude: pickupCoords?.longitude || location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }}
        >
          {pickupCoords && (
            <Marker coordinate={pickupCoords} title='Pickup'>
              <Image
                source={FromIcon}
                style={{ width: 40, height: 40, resizeMode: 'contain' }} // control the size here
              />
            </Marker>
          )}
          {dropOffCoords && (
            <Fragment>
              <Marker coordinate={dropOffCoords} title='Dropoff'>
                <Image
                  source={ToIcon}
                  style={{ width: 40, height: 40, resizeMode: 'contain' }} // control the size here
                />
              </Marker>
            </Fragment>
          )}
        </MapView>
      </View>
      <View style={styles.wrapper}>
        <View style={styles.inputContainer}>
          <TextDefault
            bolder
            style={{
              ...styles.title,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('pick_up_location')}
          </TextDefault>
          <TouchableOpacity
            onPress={() => navigation.navigate('FromPlace')}
            style={styles.address}
          >
            <TextDefault
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {addressInfo.addressFrom}
            </TextDefault>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#000',
                borderStyle: 'dashed',
                marginTop: 10,
                marginBottom: 7
              }}
            />
            <TextDefault
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {addressInfo.addressFreeTextFrom}
            </TextDefault>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextDefault
            bolder
            style={{
              ...styles.title,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('drop_off_location')}
          </TextDefault>
          <TouchableOpacity
            onPress={() => navigation.navigate('ToPlace')}
            style={styles.address}
          >
            <TextDefault style={{ color: '#000' }}>
              {addressInfo.addressTo}
            </TextDefault>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#000',
                borderStyle: 'dashed',
                marginTop: 10,
                marginBottom: 7
              }}
            />
            <TextDefault
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {addressInfo.addressFreeTextTo}
            </TextDefault>
          </TouchableOpacity>
        </View>

        {/* Item Description */}
        <TextDefault
          bolder
          style={{
            ...styles.title,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('item_description')}
        </TextDefault>
        <TextInput
          placeholder={t('item_description_notes')}
          style={styles.textArea}
          onChangeText={(text) => setNotes(text)}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
        />

        {/* Urgency */}
        <View
          style={{
            ...styles.switchRow,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <Text style={styles.label}>{t('is_urgent')}</Text>

          <Switch value={isUrgent} onValueChange={toggleSwitch} />
        </View>

        {/* Fare Preview */}
        <View style={styles.fareBox}>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <Text style={{ textAlign: isArabic ? 'right' : 'left' }}>
              {t('deliveryFee')}: {deliveryFee} EGP
            </Text>
          )}

          {/* <Text>ETA: 25 mins</Text> */}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <TextDefault style={{ color: '#fff' }}>{t('submit')}</TextDefault>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default RequestDelivery

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 10,
    flex: 1
  },
  title: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  wrapper: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120, // adjust height as needed
    textAlignVertical: 'top',
    backgroundColor: '#fff`'
  },
  label: { fontWeight: '600', marginTop: 10 },
  picker: { backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
  fareBox: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20
  },
  address: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    height: 40
  }
})
