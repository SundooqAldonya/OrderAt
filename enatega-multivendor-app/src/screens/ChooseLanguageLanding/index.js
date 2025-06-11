import React from 'react'
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

const languages = [
  { value: 'English', code: 'en', index: 0 },
  { value: 'العربية', code: 'ar', index: 1 }
]

const SelectLanguageScreen = ({ onSelectLanguage }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{ width: 200, height: 100, marginTop: -150, marginBottom: 50 }}
      >
        <Image source={Logo} style={{ width: 'auto', height: '100%' }} />
      </View>
      {/* <Text style={styles.title}>Select Language</Text> */}

      <View style={styles.buttonContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.languageButton}
            onPress={() => onSelectLanguage(lang.code)}
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
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 40,
    fontWeight: 'bold'
  },
  buttonContainer: {
    width: '100%',
    gap: 16
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
