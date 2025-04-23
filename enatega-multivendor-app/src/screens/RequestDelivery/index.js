import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import useEnvVars from '../../../environment'
import MapView, { Marker } from 'react-native-maps'
import { LocationContext } from '../../context/Location'
import { Controller, useForm } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'

const RequestDelivery = () => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropOffCoords, setDropOffCoords] = useState(null)
  const { location } = useContext(LocationContext)
  const { control, handleSubmit, setValue, watch } = useForm()

  console.log({ pickupCoords, dropOffCoords, location })

  const onSubmit = (data) => {
    const payload = {
      ...data,
      pickup_lat: pickupCoords?.latitude,
      pickup_lng: pickupCoords?.longitude,
      dropoff_lat: dropOffCoords?.latitude,
      dropoff_lng: dropOffCoords?.longitude,
      fare: 15.0, // mock
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
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }}
        >
          {pickupCoords && <Marker coordinate={pickupCoords} title='Pickup' />}
          {dropOffCoords && (
            <Marker coordinate={dropOffCoords} title='Dropoff' />
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
          <GooglePlacesAutocomplete
            placeholder={t('pick_up_location')}
            onPress={(data, details) => {
              const { lat, lng } = details.geometry.location
              setPickupCoords({ latitude: lat, longitude: lng })
            }}
            fetchDetails
            query={{ key: GOOGLE_MAPS_KEY, language: 'ar' }}
            styles={{
              container: {
                flex: 0,
                marginTop: 10,
                width: '100%',
                marginHorizontal: 'auto'
              }, // IMPORTANT: prevents it from taking full screen height
              listView: { backgroundColor: 'white' }
            }}
          />
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
          <GooglePlacesAutocomplete
            placeholder={t('drop_off_location')}
            onPress={(data, details) => {
              const { lat, lng } = details.geometry.location
              setDropOffCoords({ latitude: lat, longitude: lng })
            }}
            fetchDetails
            query={{ key: GOOGLE_MAPS_KEY, language: 'ar' }}
            styles={{
              container: {
                flex: 0,
                marginTop: 10,
                width: '100%',
                marginHorizontal: 'auto'
              }, // IMPORTANT: prevents it from taking full screen height
              listView: { backgroundColor: 'white' }
            }}
          />
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
        <Text style={styles.label}>{t('vehicle_type')}</Text>
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
        />

        {/* Priority */}
        <Text style={styles.label}>{t('priority')}</Text>
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
        />

        {/* Urgency */}
        <View style={styles.switchRow}>
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
          <Text>Estimated Fare: 15.00 EGP</Text>
          <Text>ETA: 25 mins</Text>
        </View>

        <TouchableOpacity>
          <TextDefault style={{ color: '#000' }}>{t('submit')}</TextDefault>
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
  }
})
