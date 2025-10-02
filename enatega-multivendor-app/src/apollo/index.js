import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  split,
  concat,
  Observable
} from '@apollo/client'
import {
  getMainDefinition,
  offsetLimitPagination
} from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'
import useEnvVars from '../../environment'
import { useContext } from 'react'
import { LocationContext } from '../context/Location'
import { calculateDistance } from '../utils/customFunctions'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'

const setupApollo = () => {
  const { GRAPHQL_URL, WS_GRAPHQL_URL } = useEnvVars()

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          _id: {
            keyArgs: ['string']
          },
          orders: offsetLimitPagination()
        }
      },
      Category: {
        fields: {
          foods: {
            merge(_existing, incoming) {
              return incoming
            }
          }
        }
      },
      Food: {
        fields: {
          variations: {
            merge(_existing, incoming) {
              return incoming
            }
          }
        }
      },
      Restaurant: {
        fields: {
          distanceWithCurrentLocation: {
            // read(_existing, { variables, readField }) {
            //   if (!variables?.latitude || !variables?.longitude) {
            //     return null // or 0
            //   }

            //   const restaurantLocation = readField('location')
            //   if (!restaurantLocation?.coordinates) return null

            //   return calculateDistance(
            //     restaurantLocation.coordinates[0],
            //     restaurantLocation.coordinates[1],
            //     variables.latitude,
            //     variables.longitude
            //   )
            // }
            read(_existing, { variables, field, readField }) {
              const restaurantLocation = readField('location')
              const distance = calculateDistance(
                restaurantLocation?.coordinates[0],
                restaurantLocation?.coordinates[1],
                variables.latitude,
                variables.longitude
              )
              return distance
            }
          },
          freeDelivery: {
            read(_existing) {
              const randomValue = Math.random() * 10
              return randomValue > 5
            }
          },
          acceptVouchers: {
            read(_existing) {
              const randomValue = Math.random() * 10
              return randomValue < 5
            }
          }
        }
      }
    }
  })

  const httpLink = createHttpLink({
    uri: GRAPHQL_URL
  })

  const wsLink = new WebSocketLink({
    uri: WS_GRAPHQL_URL,
    options: {
      reconnect: true
    }
  })

  const retryLink = new RetryLink({
    attempts: {
      max: 2,
      retryIf: async (error, operation) => {
        console.log('retryLink error-->>', error)
        if (!error) {
          return false
        }
        // Attempt to refresh the token if it's an authentication error
        return true
      }
    }
  })

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`)
    }
  })

  const request = async (operation) => {
    // await AsyncStorage.removeItem('token')
    const token = await AsyncStorage.getItem('token')
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : null
      }
    })
  }

  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle
        Promise.resolve(operation)
          .then((oper) => request(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            })
          })
          .catch(observer.error.bind(observer))

        return () => {
          if (handle) handle.unsubscribe()
        }
      })
  )

  const terminatingLink = split(({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  }, wsLink)

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    ApolloLink.from([requestLink, httpLink]) // queries & mutations
  )

  const client = new ApolloClient({
    link: ApolloLink.from([
      retryLink,
      errorLink,
      terminatingLink,
      requestLink,
      httpLink
    ]),
    cache,
    resolvers: {}
  })

  return client
}

export default setupApollo
