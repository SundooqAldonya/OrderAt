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
import { AntDesign } from '@expo/vector-icons'
import UserContext from '../../context/User'
import { moderateScale } from '../../utils/scaling'

const CityListScreen = () => {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const dispatch = useDispatch()
  const isArabic = i18n.language === 'ar'
  const { cities } = useContext(LocationContext)
  const { isLoggedIn } = useContext(UserContext)

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
      <View
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        {isLoggedIn ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name={'arrowleft'} size={moderateScale(20)} color='black' />
          </TouchableOpacity>
        ) : null}
        <Text
          style={{ ...styles.title, textAlign: isArabic ? 'right' : 'left' }}
        >
          {t('select_city')}
        </Text>
      </View>
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
    paddingTop: 10,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginVertical: 20,
    marginLeft: 15
  },
  list: {
    paddingBottom: 20,
     paddingHorizontal: 20,
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
