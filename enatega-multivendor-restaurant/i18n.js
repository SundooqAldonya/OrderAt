import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { en } from './translations/en'
import { de } from './translations/de'
import { fr } from './translations/fr'
import { km } from './translations/km'
import { zh } from './translations/zh'
import { ar } from './translations/ar'
import { sv } from './translations/sv'

export const languageResources = {
  en: { translation: en },
  zh: { translation: zh },
  de: { translation: de },
  fr: { translation: fr },
  km: { translation: km },
  ar: { translation: ar },
  sv: { translation: sv }
}

const initI18n = async () => {
  try {
    // Try to get saved language
    const savedLanguage = await AsyncStorage.getItem('enatega-language')
    const lng = savedLanguage || 'ar' // 👈 Always Arabic by default

    await i18next.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      lng,
      fallbackLng: 'ar', // 👈 fallback Arabic too
      resources: languageResources
    })

    console.log('i18n initialized with language:', lng)
  } catch (error) {
    console.error('i18n init error:', error)
  }
}

initI18n()

export default i18next
