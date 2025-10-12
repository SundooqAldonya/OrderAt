import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  Observable,
  HttpLink
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

function setupApolloClient() {
  const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
  if (clientRef) return clientRef
  // ✅ Apollo cache setup (unchanged)
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          riderEarnings: offsetLimitPagination(),
          riderWithdrawRequests: offsetLimitPagination(),
          riderOrders: {
            merge(_existing, incoming) {
              return incoming
            }
          },
          _id: {
            keyArgs: ['string']
          }
        }
      }
    }
  })

  const httpLink = new HttpLink({
    uri: GRAPHQL_URL
  })

  // ✅ File upload link (HTTP)
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

  // ✅ WebSocket link for subscriptions (graphql-ws)
  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_GRAPHQL_URL,
      retryAttempts: Infinity, // ✅ reconnect forever
      lazy: false,
      shouldRetry: () => true,
      retryWait: attempt => Math.min(1000 * 2 ** attempt, 30000), // exponential backoff
      on: {
        connected: () => console.log('🔌 Connected to WS server'),
        closed: event => console.log('❌ Disconnected', event),
        error: err => console.error('WebSocket error', err),
        opened: () => console.log('🌐 WS connection opened')
      },
      connectionParams: async () => {
        const token = await AsyncStorage.getItem('rider-token')
        return {
          authorization: token ? `Bearer ${token}` : ''
        }
      }
    })
  )

  // ✅ Inject token into each HTTP request
  // const request = async operation => {
  //   const token = await AsyncStorage.getItem('rider-token')
  //   operation.setContext({
  //     headers: {
  //       authorization: token ? `Bearer ${token}` : ''
  //     }
  //   })
  // }

  // const requestLink = new ApolloLink(
  //   (operation, forward) =>
  //     new Observable(observer => {
  //       let handle
  //       Promise.resolve(operation)
  //         .then(oper => request(oper))
  //         .then(() => {
  //           handle = forward(operation).subscribe({
  //             next: observer.next.bind(observer),
  //             error: observer.error.bind(observer),
  //             complete: observer.complete.bind(observer)
  //           })
  //         })
  //         .catch(observer.error.bind(observer))
  //       return () => {
  //         if (handle) handle.unsubscribe()
  //       }
  //     })
  // )

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

  // ✅ Split links: subscriptions → wsLink, everything else → uploadLink
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
    // ApolloLink.from([requestLink, uploadLink])
  )

  // ✅ Apollo Client
  const client = new ApolloClient({
    link: ApolloLink.from([authLink, splitLink, uploadLink]),
    cache,
    connectToDevTools: true
  })

  clientRef = client
  return client
}

export default setupApolloClient

// import AsyncStorage from '@react-native-async-storage/async-storage'
// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloLink,
//   split,
//   concat,
//   Observable,
//   createHttpLink
// } from '@apollo/client'
// import { WebSocketLink } from '@apollo/client/link/ws'
// import {
//   getMainDefinition,
//   offsetLimitPagination
// } from '@apollo/client/utilities'
// import { createUploadLink } from 'apollo-upload-client'

// import getEnvVars from '../../environment'

// export let clientRef = null

// function setupApolloClient() {
//   const { GRAPHQL_URL, WS_GRAPHQL_URL } = getEnvVars()
//   const cache = new InMemoryCache({
//     typePolicies: {
//       Query: {
//         fields: {
//           riderEarnings: offsetLimitPagination(),
//           riderWithdrawRequests: offsetLimitPagination(),
//           riderOrders: {
//             merge(_existing, incoming) {
//               return incoming
//             }
//           },
//           _id: {
//             keyArgs: ['string']
//           }
//         }
//       }
//     }
//   })

//   // const httpLink = createHttpLink({
//   //   uri: GRAPHQL_URL
//   // })

//   const uploadLink = createUploadLink({
//     uri: GRAPHQL_URL,
//     headers: async () => {
//       const token = await AsyncStorage.getItem('rider-token')
//       return {
//         authorization: token ? `Bearer ${token}` : '',
//         'Apollo-Require-Preflight': 'true' // Optional: Fix some upload issues
//       }
//     }
//   })

//   const wsLink = new WebSocketLink({
//     uri: WS_GRAPHQL_URL,
//     options: {
//       reconnect: true
//     }
//   })

//   const request = async operation => {
//     const token = await AsyncStorage.getItem('rider-token')

//     operation.setContext({
//       // get the authentication token from local storage if it exists
//       // return the headers to the context so httpLink can read them
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

//   const terminatingLink = split(({ query }) => {
//     const { kind, operation } = getMainDefinition(query)
//     return kind === 'OperationDefinition' && operation === 'subscription'
//   }, wsLink)

//   const client = new ApolloClient({
//     link: ApolloLink.from([terminatingLink, requestLink, uploadLink]),
//     cache,
//     resolvers: {}
//   })
//   clientRef = client
//   return client
// }
// export default setupApolloClient
