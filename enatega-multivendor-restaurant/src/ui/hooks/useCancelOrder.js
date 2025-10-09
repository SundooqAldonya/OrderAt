import { useMutation } from '@apollo/client/react'
import { cancelOrder } from '../../apollo'
import { gql } from '@apollo/client'

export default function useCancelOrder() {
  const [mutateCancel, { loading, error }] = useMutation(
    gql`
      ${cancelOrder}
    `
  )
  const cancelOrderFunc = (_id, reason) => {
    mutateCancel({ variables: { _id, reason } })
  }
  return { loading, error, cancelOrder: cancelOrderFunc }
}
