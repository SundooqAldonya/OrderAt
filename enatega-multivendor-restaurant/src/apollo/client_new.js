// apolloClient.js
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,
  Observable
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { RetryLink } from '@apollo/client/link/retry'
import { getMainDefinition } from '@apollo/client/utilities'
import * as SecureStore from 'expo-secure-store'
import getEnvVars from '../../environment'

let wsClientInstance = null
let wsLinkInstance = null
let clientInstance = null

const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()

const createWsClient = () =>
  createClient({
    url: WS_GRAPHQL_URL.replace('http', 'ws'),
    retryAttempts: Infinity,
    shouldRetry: () => true,
    retryWait: attempt => Math.min(1000 * 2 ** attempt, 30000),
    lazy: false,
    connectionParams: async () => {
      const token = await SecureStore.getItemAsync('token')
      return {
        authorization: token ? `Bearer ${token}` : ''
      }
    },
    on: {
      connected: () => console.log('🔌 Connected to WS server'),
      closed: event => console.log('❌ Disconnected', event.code, event.reason),
      error: err => console.error('WebSocket error', err),
      opened: () => console.log('🌐 WS connection opened')
    }
  })

const createApolloClient = () => {
  const httpLink = new HttpLink({ uri: GRAPHQL_URL })

  wsClientInstance = createWsClient()
  wsLinkInstance = new GraphQLWsLink(wsClientInstance)

  const retryLink = new RetryLink({
    delay: { initial: 500, max: 5000, jitter: true },
    attempts: { max: 5, retryIf: error => !!error }
  })

  const authLink = new ApolloLink(
    (operation, forward) =>
      new Observable(observer => {
        let handle
        Promise.resolve()
          .then(async () => {
            const token = await SecureStore.getItemAsync('token')
            operation.setContext({
              headers: {
                authorization: token ? `Bearer ${token}` : ''
              }
            })
          })
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            })
          })
          .catch(observer.error.bind(observer))
        return () => handle && handle.unsubscribe()
      })
  )

  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query)
      return (
        def.kind === 'OperationDefinition' && def.operation === 'subscription'
      )
    },
    wsLinkInstance,
    httpLink
  )

  clientInstance = new ApolloClient({
    link: ApolloLink.from([authLink, retryLink, splitLink]),
    cache: new InMemoryCache()
  })

  return clientInstance
}

// 🧩 Export functions to get or recreate clients
export const getApolloClient = () => clientInstance
export const getWsClient = () => wsClientInstance
export const recreateWsClient = () => {
  if (wsClientInstance) {
    console.log('♻️ Disposing old WS client...')
    wsClientInstance.dispose()
  }
  wsClientInstance = createWsClient()
  wsLinkInstance = new GraphQLWsLink(wsClientInstance)
  console.log('🔄 New WS client created')
  return wsClientInstance
}

export default createApolloClient
