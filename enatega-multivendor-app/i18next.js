// i18n.js
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'

import { en } from './translations/en'
import { ar } from './translations/ar'
// Add others if needed

export const languageResources = {
  en: { translation: en },
  ar: { translation: ar }
}

export const initI18n = async () => {
  const storedLanguage = await AsyncStorage.getItem('enatega-language')
  const fallbackLang = storedLanguage || 'ar'

  await i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: fallbackLang,
    fallbackLng: 'ar',
    resources: languageResources,
    interpolation: {
      escapeValue: false
    }
  })
}

// ✅ Keep this line for use in other files
export default i18next
