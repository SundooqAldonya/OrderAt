// src/apollo/index.js
import * as SecureStore from 'expo-secure-store'
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,
  Observable
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { RetryLink } from '@apollo/client/link/retry'
import getEnvVars from '../../environment'

let clientRef = null

export default function setupApolloClient() {
  if (clientRef) return clientRef

  const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
  console.log('[Apollo] GraphQL URLs:', GRAPHQL_URL, WS_GRAPHQL_URL)

  // ----- HTTP link (queries + mutations) -----
  const httpLink = new HttpLink({ uri: GRAPHQL_URL })

  // ----- Retry link for HTTP operations -----
  const retryLink = new RetryLink({
    delay: { initial: 500, max: 5000, jitter: true },
    attempts: { max: 5, retryIf: error => !!error }
  })

  // ----- Auth link (inject token for HTTP) -----
  const authLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      let sub
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
          sub = forward(operation).subscribe({
            next: v => observer.next(v),
            error: e => observer.error(e),
            complete: () => observer.complete()
          })
        })
        .catch(err => observer.error(err))

      return () => sub && sub.unsubscribe()
    })
  })

  // ----- WebSocket (subscriptions) -----
  // Use the WS_GRAPHQL_URL as-is (don't replace 'http' -> 'ws')
  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_GRAPHQL_URL,
      // Let graphql-ws handle reconnection
      lazy: false,
      retryAttempts: Infinity,
      shouldRetry: () => true,
      retryWait: attempt => Math.min(1000 * 2 ** attempt, 30000),
      keepAlive: 10000, // optional helpful ping
      connectionParams: async () => {
        const token = await SecureStore.getItemAsync('token')
        return { authorization: token ? `Bearer ${token}` : '' }
      },
      on: {
        connecting: () => console.log('[WS] connecting...'),
        connected: () => console.log('[WS] connected'),
        closed: e => console.log('[WS] closed', e?.code, e?.reason),
        error: err => console.log('[WS] error', err?.message || err),
        opened: () => console.log('[WS] opened')
      }
    })
  )

  // ----- Split link: subscriptions -> ws, others -> (retry -> auth -> http) -----
  const httpSide = ApolloLink.from([retryLink, authLink, httpLink])

  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query)
      return (
        def.kind === 'OperationDefinition' && def.operation === 'subscription'
      )
    },
    wsLink,
    httpSide
  )

  // ----- final client: use splitLink as the main link -----
  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: true
  })

  clientRef = client
  return client
}
