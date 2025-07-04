/*****************************
 * environment.js
 * path: '/environment.js' (root of your project)
 ******************************/

import * as Updates from 'expo-updates'
import { useContext } from 'react'
import Configuration from './src/ui/context/configuration'

const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(Configuration.Context)

  console.log('configuration', configuration)
  console.log({ env: process.env.NODE_ENV })
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    return {
      GRAPHQL_URL: 'https://query.orderat.ai/graphql',
      WS_GRAPHQL_URL: 'wss://query.orderat.ai/graphql',
      SERVER_URL: 'https://query.orderat.ai/',
      SENTRY_DSN: configuration.restaurantAppSentryUrl
    }
  }
  return {
    GRAPHQL_URL: 'http://192.168.1.8:8001/graphql',
    WS_GRAPHQL_URL: 'ws://192.168.1.8:8001/graphql',
    SERVER_URL: 'http://192.168.1.8:8001/',
    SENTRY_DSN: configuration.restaurantAppSentryUrl
  }
}

export default getEnvVars
