import * as Updates from 'expo-updates'

export const getEnvVars = (env = Updates.channel) => {
  if (env && (env === 'production' || env === 'staging')) {
    return {
      GRAPHQL_URL: 'https://query.orderat.ai/graphql',
      WS_GRAPHQL_URL: 'wss://query.orderat.ai/graphql',
      // Load values manually or inject them using constants or AsyncStorage
      SENTRY_DSN: process.env.SENTRY_DSN,
      GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY
    }
  }
  return {
    GRAPHQL_URL: 'http://192.168.1.3:8001/graphql',
    WS_GRAPHQL_URL: 'ws://192.168.1.3:8001/graphql',
    SERVER_URL: 'http://192.168.1.3:8001/',
    SENTRY_DSN: process.env.SENTRY_DSN,
    GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY
  }
}
