// /*****************************
//  * environment.js
//  * path: '/environment.js' (root of your project)
//  ******************************/

import { useContext } from 'react'
import ConfigurationContext from './src/context/Configuration'
import * as Updates from 'expo-updates'

const useEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext)

  if (env === 'production' || env === 'staging') {
    return {
      GRAPHQL_URL: 'https://query.orderat.ai/graphql',
      WS_GRAPHQL_URL: 'wss://query.orderat.ai/graphql',
      SENTRY_DSN: configuration.riderAppSentryUrl,
      GOOGLE_MAPS_KEY: configuration.googleApiKey,
      SERVER_URL: 'https://query.orderat.ai',
      IOS_CLIENT_ID_GOOGLE: configuration.iOSClientID,
      ANDROID_CLIENT_ID_GOOGLE:
        '133710632137-p9iabf8cgdg4rjsdmj1mcn305ppc33h2.apps.googleusercontent.com',
      AMPLITUDE_API_KEY: configuration.appAmplitudeApiKey,
      GOOGLE_MAPS_KEY: configuration.googleApiKey,
      EXPO_CLIENT_ID: configuration.expoClientId,
      SENTRY_DSN: configuration.customerAppSentryUrl,
      TERMS_AND_CONDITIONS: configuration.termsAndConditions,
      PRIVACY_POLICY: configuration.privacyPolicy,
      TEST_OTP: configuration.testOtp,
      GOOGLE_PACES_API_BASE_URL: configuration.googlePlacesApiBaseUrl
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return {
      // GRAPHQL_URL: 'https://enatega-multivendor.up.railway.app/graphql',
      // WS_GRAPHQL_URL: 'wss://enatega-multivendor.up.railway.app/graphql',
      // SERVER_URL: 'https://enatega-multivendor.up.railway.app/',
      GRAPHQL_URL: 'http://192.168.1.11:8001/graphql',
      WS_GRAPHQL_URL: 'ws://192.168.1.11:8001/graphql',
      SERVER_URL: 'http://192.168.1.11:8001/',
      IOS_CLIENT_ID_GOOGLE: configuration.iOSClientID,
      ANDROID_CLIENT_ID_GOOGLE:
        '133710632137-p9iabf8cgdg4rjsdmj1mcn305ppc33h2.apps.googleusercontent.com',
      AMPLITUDE_API_KEY: configuration.appAmplitudeApiKey,
      GOOGLE_MAPS_KEY:
        configuration.googleApiKey ?? 'AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY',
      EXPO_CLIENT_ID: configuration.expoClientID,
      SENTRY_DSN: configuration.customerAppSentryUrl,
      TERMS_AND_CONDITIONS: configuration.termsAndConditions,
      PRIVACY_POLICY: configuration.privacyPolicy,
      TEST_OTP: configuration.testOtp,
      GOOGLE_PACES_API_BASE_URL: configuration.googlePlacesApiBaseUrl
    }
  }
}

export default useEnvVars