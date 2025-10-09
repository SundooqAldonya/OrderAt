// import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import getEnvVars from '../../environment'
import * as SecureStore from 'expo-secure-store'
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  Observable,
  HttpLink
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
export let clientRef = null

function setupApolloClient() {
  const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
  console.log('GraphQL URLs:', GRAPHQL_URL, WS_GRAPHQL_URL)

  // ✅ Correct link creation
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL
  })

  // ✅ WebSocket link for subscriptions
  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_GRAPHQL_URL.replace('http', 'ws'),
      connectionParams: async () => {
        const token = await SecureStore.getItemAsync('token')
        return {
          authorization: token ? `Bearer ${token}` : ''
        }
      },
      retryAttempts: Infinity
    })
  )

  // ✅ Split link for subscription vs query/mutation
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  )

  // ✅ Attach auth token to all operations
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

  // ✅ Combine links properly (auth → split)
  const client = new ApolloClient({
    link: ApolloLink.from([authLink, splitLink]),
    cache: new InMemoryCache()
  })

  clientRef = client
  return client
}

export default setupApolloClient
