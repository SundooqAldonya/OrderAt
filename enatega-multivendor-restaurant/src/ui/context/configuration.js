/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import { configuration } from '../../apollo'

const Context = React.createContext({})

export const Provider = props => {
  const [addressToken, setAddressToken] = useState("")

  const { loading, data, error } = useQuery(
    gql`
      ${configuration}
    `
  )
  const value =
    loading || error || !data.configuration ? {} : data.configuration

  return <Context.Provider value={value}>{props.children}</Context.Provider>
}
export default { Context, Provider }
