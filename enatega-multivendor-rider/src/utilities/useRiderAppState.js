import React, { useEffect } from 'react'
import { AppState } from 'react-native'
import { useApolloClient, gql, useMutation } from '@apollo/client'
import setupApolloClient from '../apollo'
import { updateRiderStatus } from '../apollo/mutations'

export default function useRiderAppState(hasActiveOrder) {
  const [mutateAvailable] = useMutation(updateRiderStatus)

  console.log('useRiderAppState')
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        mutateAvailable({
          variables: {
            available: true
          }
        })
      }
    })

    return () => subscription.remove()
  }, [hasActiveOrder])
}
