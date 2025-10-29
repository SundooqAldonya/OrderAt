import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  split,
  Observable
} from '@apollo/client'
import {
  getMainDefinition,
  offsetLimitPagination
} from '@apollo/client/utilities'
import { createUploadLink } from 'apollo-upload-client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import getEnvVars from '../../environment'

export let clientRef = null
let wsClient = null
let wsLink = null

export default function setupApolloClient() {
  const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
  console.log('[Apollo] createApolloInstance', { GRAPHQL_URL, WS_GRAPHQL_URL })

  if (clientRef) return clientRef

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          riderEarnings: offsetLimitPagination(),
          riderWithdrawRequests: offsetLimitPagination(),
          riderOrders: {
            merge(_, incoming) {
              return incoming
            }
          }
        }
      }
    }
  })

  // 🔗 HTTP link (normal queries + mutations)
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL
  })

  // 🔗 Upload link (handles multipart form uploads)
  const uploadLink = createUploadLink({
    uri: GRAPHQL_URL,
    headers: async () => {
      const token = await AsyncStorage.getItem('rider-token')
      return {
        authorization: token ? `Bearer ${token}` : '',
        'Apollo-Require-Preflight': 'true'
      }
    }
  })

  // 🔐 Auth middleware link
  const authLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      Promise.resolve()
        .then(async () => {
          const token = await AsyncStorage.getItem('rider-token')
          operation.setContext({
            headers: {
              authorization: token ? `Bearer ${token}` : ''
            }
          })
        })
        .then(() => {
          const subscriber = forward(operation).subscribe({
            next: result => observer.next(result),
            error: err => observer.error(err),
            complete: () => observer.complete()
          })
          return () => subscriber.unsubscribe()
        })
        .catch(error => observer.error(error))
    })
  })

  // 🧠 WebSocket creator
  const createWsLink = () => {
    wsClient = createClient({
      url: WS_GRAPHQL_URL,
      lazy: false,
      retryAttempts: Infinity,
      shouldRetry: () => true,
      retryWait: attempt => Math.min(1000 * 2 ** attempt, 30000),
      connectionParams: async () => {
        const token = await AsyncStorage.getItem('rider-token')
        return { authorization: token ? `Bearer ${token}` : '' }
      },
      on: {
        connected: () => console.log('🔌 WS connected'),
        closed: e => console.log('❌ WS closed', e),
        error: e => console.log('⚠️ WS error', e)
      }
    })
    return new GraphQLWsLink(wsClient)
  }

  wsLink = createWsLink()

  // ⚡ Split link for subscriptions
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    uploadLink // <--- use uploadLink for queries/mutations
  )

  // ✅ Apollo Client
  const client = new ApolloClient({
    link: ApolloLink.from([authLink, splitLink]),
    cache,
    connectToDevTools: true
  })

  // 📶 Auto-reconnect when network returns
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('📶 Network reconnected → restarting WS link...')
      try {
        wsClient?.dispose?.()
        wsLink = createWsLink()
        client.setLink(
          ApolloLink.from([
            authLink,
            split(
              ({ query }) => {
                const definition = getMainDefinition(query)
                return (
                  definition.kind === 'OperationDefinition' &&
                  definition.operation === 'subscription'
                )
              },
              wsLink,
              uploadLink
            )
          ])
        )
      } catch (e) {
        console.error('Error reinitializing WS:', e)
      }
    } else {
      console.log('📴 Network disconnected')
    }
  })

  clientRef = client
  return client
}
