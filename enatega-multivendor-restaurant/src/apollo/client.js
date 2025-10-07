import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  split,
  Observable
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import * as SecureStore from 'expo-secure-store'
import getEnvVars from '../../environment'

export let clientRef = null

function setupApolloClient() {
  const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
  console.log('graph,', GRAPHQL_URL, WS_GRAPHQL_URL)

  // 🔒 Secure token injection for HTTP requests
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    fetch
  })

  // 🧠 Custom middleware to attach auth headers
  const authLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
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
  })

  // ⚡ WebSocket link using graphql-ws
  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_GRAPHQL_URL,
      connectionParams: async () => {
        const token = await SecureStore.getItemAsync('token')
        return {
          authorization: token ? `Bearer ${token}` : ''
        }
      },
      retryAttempts: Infinity
    })
  )

  // 🔀 Split between HTTP (queries/mutations) and WS (subscriptions)
  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query)
      return (
        def.kind === 'OperationDefinition' && def.operation === 'subscription'
      )
    },
    wsLink,
    authLink.concat(httpLink)
  )

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: true
  })

  clientRef = client
  return client
}

export default setupApolloClient

// import { WebSocketLink } from '@apollo/client/link/ws'
// import { getMainDefinition } from '@apollo/client/utilities'
// import getEnvVars from '../../environment'
// import * as SecureStore from 'expo-secure-store'
// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloLink,
//   split,
//   concat,
//   Observable,
//   createHttpLink
// } from '@apollo/client'

// export let clientRef = null
// function setupApolloClient() {
//   const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
//   console.log('graph,', GRAPHQL_URL, WS_GRAPHQL_URL)
//   const wsLink = new WebSocketLink({
//     uri: WS_GRAPHQL_URL,
//     options: {
//       reconnect: true,
//       connectionParams: async () => {
//         const token = await SecureStore.getItemAsync('token')
//         return {
//           authorization: token ? `Bearer ${token}` : ''
//         }
//       }
//     }
//   })
//   const cache = new InMemoryCache()
//   // eslint-disable-next-line new-cap
//   const httpLink = new createHttpLink({
//     uri: GRAPHQL_URL
//   })
//   const terminatingLink = split(({ query }) => {
//     const { kind, operation } = getMainDefinition(query)
//     return kind === 'OperationDefinition' && operation === 'subscription'
//   }, wsLink)

//   const request = async operation => {
//     const token = await SecureStore.getItemAsync('token')
//     console.log(token, 'token')
//     operation.setContext({
//       headers: {
//         authorization: token ? `Bearer ${token}` : ''
//       }
//     })
//   }

//   const requestLink = new ApolloLink(
//     (operation, forward) =>
//       new Observable(observer => {
//         let handle
//         Promise.resolve(operation)
//           .then(oper => request(oper))
//           .then(() => {
//             handle = forward(operation).subscribe({
//               next: observer.next.bind(observer),
//               error: observer.error.bind(observer),
//               complete: observer.complete.bind(observer)
//             })
//           })
//           .catch(observer.error.bind(observer))
//         return () => {
//           if (handle) handle.unsubscribe()
//         }
//       })
//   )

//   const client = new ApolloClient({
//     cache: cache,
//     link: ApolloLink.from([terminatingLink, requestLink, httpLink])
//   })
//   clientRef = client
//   return client
// }

// export default setupApolloClient
