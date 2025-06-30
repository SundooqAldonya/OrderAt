import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import { Ionicons, Feather, Entypo } from '@expo/vector-icons'

const AddressNewVersion = () => {
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>حدد الموقع</Text>

      {/* Location options */}
      <TouchableOpacity style={styles.option}>
        <Feather name='navigation' size={22} color='green' />
        <Text style={styles.optionText}>استخدام موقعي الحالي</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Feather name='bookmark' size={22} color='#000' />
        <Text style={styles.optionText}>اختر من عناوين محفوظة</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Entypo name='location-pin' size={22} color='#000' />
        <Text style={styles.optionText}>اختر على الخريطة</Text>
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
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>حفظ</Text>
      </TouchableOpacity>
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
  }
})
