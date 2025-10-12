import React from 'react'
// import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { configuration } from '../apollo/queries'

// const GETCONFIGURATION = gql`
//   ${configuration}
// `

const ConfigurationContext = React.createContext({})

export const ConfigurationProvider = props => {
  const { loading, data, error } = useQuery(configuration)
  const configurationData =
    loading || error || !data.configuration ? {} : data.configuration
  return (
    <ConfigurationContext.Provider value={configurationData}>
      {props.children}
    </ConfigurationContext.Provider>
  )
}
export const ConfigurationConsumer = ConfigurationContext.Consumer
export default ConfigurationContext
