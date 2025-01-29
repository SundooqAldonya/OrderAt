import React, { useEffect } from 'react'

import ReactDOM from 'react-dom'
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  concat,
  createHttpLink,
  Observable,
  split
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'
import 'firebase/messaging'

import ConfigurableValues from './config/constants'
import { ConfigurationProvider } from './context/Configuration'
import App from './app'
import { RestProvider } from './context/Restaurant'
import { ThemeProvider, StyledEngineProvider } from '@mui/material'
import theme from './utils/theme'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { isAuthenticated } from './helpers/user'
import AreaProvider from './context/AreaContext'

function Main() {
  const { SERVER_URL, WS_SERVER_URL } = ConfigurableValues()
  console.log('ahmed elselly')
  const cache = new InMemoryCache()
  const httpLink = createHttpLink({
    uri: `${SERVER_URL}/graphql`
  })
  const wsLink = new WebSocketLink({
    uri: `${WS_SERVER_URL}/graphql`,
    options: {
      reconnect: true
    }
  })
  // const token = localStorage.getItem('user-enatega')
  //   ? JSON.parse(localStorage.getItem('user-enatega')).token
  //   : null

  const token = isAuthenticated() ? isAuthenticated().token : null

  const request = async operation => {
    console.log({ token })

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    })
  }

  const requestLink = new ApolloLink((operation, forward) => {
    console.log({ operation })
    console.log('requestLink executed')
    // return forward(operation)
    return new Observable(observer => {
      let handle
      Promise.resolve(operation)
        .then(oper => request(oper))
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
  })
  const terminatingLink = split(({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  }, wsLink)

  const uploadLink = createUploadLink({
    uri: `${SERVER_URL}/graphql`
  })

  const client = new ApolloClient({
    link: ApolloLink.from([requestLink, uploadLink, terminatingLink, httpLink]),
    cache,
    resolvers: {},
    connectToDevTools: true
  })

  return (
    <ApolloProvider client={client}>
      <ConfigurationProvider>
        {/* <LoadScript
          id="script-loader"
          googleMapsApiKey={GOOGLE_MAPS_KEY}
          libraries={[
            'drawing',
            'places',
            'geometry',
            'localContext',
            'visualization'
          ]}> */}

        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <RestProvider>
              <AreaProvider>
                {/* <GoogleMapsLoader> */}
                <App />
                {/* </GoogleMapsLoader> */}
              </AreaProvider>
            </RestProvider>
          </ThemeProvider>
        </StyledEngineProvider>

        {/* </LoadScript> */}
      </ConfigurationProvider>
    </ApolloProvider>
  )
}

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
)
