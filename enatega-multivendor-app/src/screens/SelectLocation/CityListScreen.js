import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useContext } from 'react'
import { useLayoutEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native'
import { LocationContext } from '../../context/Location'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { setCity } from '../../store/citySelectSlice'

// const cities = [
//   { id: '1', name: 'Cairo' },
//   { id: '2', name: 'Alexandria' },
//   { id: '3', name: 'Giza' },
//   { id: '4', name: 'Luxor' },
//   { id: '5', name: 'Aswan' },
//   { id: '6', name: 'Hurghada' },
//   { id: '7', name: 'Sharm El Sheikh' }
// ]
const CityListScreen = () => {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const dispatch = useDispatch()
  const isArabic = i18n.language === 'ar'
  const { cities } = useContext(LocationContext)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  })

  const handleCityPress = (city) => {
    console.log('Selected city:', city)
    dispatch(setCity({ city }))
    navigation.navigate('SelectLocation')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ ...styles.title, textAlign: isArabic ? 'right' : 'left' }}>
        {t('select_city')}
      </Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cityItem}
            onPress={() => handleCityPress(item)}
          >
            <Text
              style={{
                ...styles.cityText,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20
  },
  list: {
    paddingBottom: 20
  },
  cityItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 10
  },
  cityText: {
    fontSize: 18,
    color: '#333'
  }
})

export default CityListScreen
