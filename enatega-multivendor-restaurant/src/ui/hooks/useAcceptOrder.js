import { useMutation } from '@apollo/client/react'
import { acceptOrder } from '../../apollo'
import { gql } from '@apollo/client'

export default function useAcceptOrder() {
  const [mutateAccept, { loading, error }] = useMutation(
    gql`
      ${acceptOrder}
    `
  )
  const acceptOrderFunc = (_id, time) => {
    mutateAccept({ variables: { _id, time } })
  }

  return { loading, error, acceptOrder: acceptOrderFunc }
}
