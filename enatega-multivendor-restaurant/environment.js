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
    GRAPHQL_URL: 'http://192.168.1.11:8001/graphql',
    WS_GRAPHQL_URL: 'ws://192.168.1.11:8001/graphql',
    SERVER_URL: 'https://192.168.1.11:8001/',

    // GRAPHQL_URL: 'https://enatega-multivendor.up.railway.app/graphql',
    // WS_GRAPHQL_URL: 'wss://enatega-multivendor.up.railway.app/graphql',
    SENTRY_DSN: configuration.restaurantAppSentryUrl
    // SENTRY_DSN:
    //   'https://91b55f514a2c4708845789d6e79abf10@o1103026.ingest.sentry.io/6131933'
  }
}

export default getEnvVars
