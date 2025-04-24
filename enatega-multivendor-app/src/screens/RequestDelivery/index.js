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
import { useQuery } from '@apollo/client'
import { getDeliveryCalculation } from '../../apollo/queries'
import { Entypo } from '@expo/vector-icons'

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
  const { control, handleSubmit, setValue, watch } = useForm()

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

  const onSubmit = (data) => {
    const payload = {
      ...data,
      pickup_lat: pickupCoords?.latitude,
      pickup_lng: pickupCoords?.longitude,
      dropoff_lat: dropOffCoords?.latitude,
      dropoff_lng: dropOffCoords?.longitude,
      fare: deliveryFee, // mock
      estimated_time: 25, // mock in minutes
      distance_km: 8.2, // mock
      request_channel: 'customer_app',
      payment_method: 'cash',
      payment_status: 'pending',
      status: 'pending',
      is_urgent: data.is_urgent || false,
      priority_level: data.priority_level || 'standard'
    }
    console.log('Submitting payload:', payload)
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
              <Entypo name='location-pin' size={36} color={'green'} />
            </Marker>
          )}
          {dropOffCoords && (
            <Fragment>
              <Marker coordinate={dropOffCoords} title='Dropoff'>
                <Entypo name='location' size={36} color={'green'} />
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
          onChangeText={(text) => setValue('item_description', text)}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
        />

        {/* Notes */}
        {/* <TextInput
          placeholder={t('notes_for_mandoob')}
          style={styles.input}
          onChangeText={(text) => setValue('notes', text)}
        /> */}

        {/* Vehicle Type */}
        {/* <Text style={styles.label}>{t('vehicle_type')}</Text>
        <Controller
          control={control}
          name='vehicle_type'
          defaultValue='motorcycle'
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label='Motorcycle' value='motorcycle' />
              <Picker.Item label='Car' value='car' />
              <Picker.Item label='Van' value='van' />
            </Picker>
          )}
        /> */}

        {/* Priority */}
        {/* <Text style={styles.label}>{t('priority')}</Text>
        <Controller
          control={control}
          name='priority_level'
          defaultValue='standard'
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label='Standard' value='standard' />
              <Picker.Item label='Express' value='express' />
              <Picker.Item label='Bulk' value='bulk' />
            </Picker>
          )}
        /> */}

        {/* Urgency */}
        <View
          style={{
            ...styles.switchRow,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <Text style={styles.label}>{t('is_urgent')}</Text>
          <Controller
            control={control}
            name='is_urgent'
            defaultValue={false}
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
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

        <TouchableOpacity style={styles.submitButton}>
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
