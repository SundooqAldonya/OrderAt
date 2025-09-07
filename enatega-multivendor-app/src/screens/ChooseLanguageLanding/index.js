import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image
} from 'react-native'
import { colors } from '../../utils/colors'
import Logo from '../../../assets/logo.jpg'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage } from '../../store/languageSlice'
import { AntDesign } from '@expo/vector-icons'
import UserContext from '../../context/User'

const languages = [
  { value: 'English', code: 'en', index: 0 },
  { value: 'العربية', code: 'ar', index: 1 }
]

const SelectLanguageScreen = ({ firstTime }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { isLoggedIn } = useContext(UserContext)

  const dispatch = useDispatch()
  // const [language, setLanguage] = useState(null)
  const { language } = useSelector((state) => state.language)
  const handleLanguageSelect = async (lang) => {
    await AsyncStorage.setItem('enatega-language', lang)
    // setLanguage(lang)
    dispatch(setLanguage({ language: lang }))
    await i18next.changeLanguage(lang)
    if (!firstTime && navigation) {
      navigation.goBack()
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      {isLoggedIn && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.arrowBackContainer}
        >
          <AntDesign name='arrowleft' size={24} color='black' />
        </TouchableOpacity>
      )}
      <View
        style={{ width: 200, height: 100, marginTop: -150, marginBottom: 50 }}
      >
        <Image source={Logo} style={{ width: 'auto', height: '100%' }} />
      </View>
      <Text style={{ ...styles.title, marginBottom: 5 }}>
        Select Your Favorite Language
      </Text>
      <Text style={styles.title}>{t('select_language')}</Text>

      <View style={styles.buttonContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.languageButton}
            onPress={() => handleLanguageSelect(lang.code)}
          >
            <Text style={styles.languageText}>{lang.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  arrowBackContainer: {
    position: 'absolute',
    top: 25,
    left: 15
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 40,
    fontWeight: 'bold'
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 15
  },
  languageButton: {
    backgroundColor: colors.white,
    borderColor: colors.border2,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  languageText: {
    fontSize: 18,
    color: colors.dark
  }
})

export default SelectLanguageScreen
