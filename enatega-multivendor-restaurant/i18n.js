import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import { Platform } from 'react-native'
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

const fallbackLng = 'ar'

const getDeviceLanguage = () => {
  const locales = Localization.getLocales()
  return locales.length > 0 ? locales[0].languageCode : fallbackLng
}

const getStoredLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('enatega-language')
    // const storedLanguage = null
    return storedLanguage || getDeviceLanguage()
  } catch (error) {
    console.error('Error fetching stored language:', error)
    return getDeviceLanguage()
  }
}

const initI18next = async () => {
  const language = await getStoredLanguage()

  await i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: language,
    fallbackLng,
    resources: languageResources,
    interpolation: {
      escapeValue: false
    }
  })

  console.log('Initialized language:', language)
}

initI18next()

export default i18next
