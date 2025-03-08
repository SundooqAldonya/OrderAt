import * as Updates from 'expo-updates'
import { useContext } from 'react'
import ConfigurationContext from './src/context/configuration'

const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext)

  console.log('configuration', configuration)
  console.log('node_env', env)

  // if (env && (env === 'production' || env === 'staging')) {
  return {
    GRAPHQL_URL: 'https://query.orderat.ai/graphql',
    WS_GRAPHQL_URL: 'wss://query.orderat.ai/graphql',
    SENTRY_DSN: configuration.riderAppSentryUrl,
    GOOGLE_MAPS_KEY: configuration.googleApiKey
  }
  // }
  // return {
  //   // GRAPHQL_URL: 'https://enatega-multivendor.up.railway.app/graphql',
  //   // WS_GRAPHQL_URL: 'wss://enatega-multivendor.up.railway.app/graphql',
  //   GRAPHQL_URL: 'http://192.168.1.5:8001/graphql',
  //   WS_GRAPHQL_URL: 'ws://192.168.1.5:8001/graphql',
  //   SERVER_URL: 'http://192.168.1.5:8001/',
  //   SENTRY_DSN: configuration.riderAppSentryUrl,
  //   GOOGLE_MAPS_KEY: configuration.googleApiKey
  //   // SENTRY_DSN:
  //   //   'https://e963731ba0f84e5d823a2bbe2968ea4d@o1103026.ingest.sentry.io/6135261', // [Add your own Sentry DSN link][example: https://e963731ba0f84e5d823a2bbe2968ea4d@o1103026.ingest.sentry.io/5135261]
  //   // GOOGLE_MAPS_KEY: 'AIzaSyCzNP5qQql2a5y8lOoO-1yj1lj_tzjVImA'
  // }
}

export default getEnvVars
