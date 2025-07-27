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
  //   GRAPHQL_URL: 'http://192.168.1.8:8001/graphql',
  //   WS_GRAPHQL_URL: 'ws://192.168.1.8:8001/graphql',
  //   SERVER_URL: 'http://192.168.1.8:8001/',
  //   SENTRY_DSN: configuration.riderAppSentryUrl,
  //   GOOGLE_MAPS_KEY: configuration.googleApiKey
  // }
}

export default getEnvVars
