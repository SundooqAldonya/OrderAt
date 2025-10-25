import { useMutation } from '@apollo/client/react'
import { orderPickedUp } from '../../apollo'
import { gql } from '@apollo/client'

export default function useOrderPickedUp() {
  const [mutatePickedUp, { loading, error }] = useMutation(
    gql`
      ${orderPickedUp}
    `
  )
  const pickedUpOrderFunc = _id => {
    mutatePickedUp({ variables: { _id } })
  }

  return { loading, error, pickedUp: pickedUpOrderFunc }
}
