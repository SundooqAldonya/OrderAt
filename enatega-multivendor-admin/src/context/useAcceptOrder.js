import { useMutation, gql } from '@apollo/client'
import { acceptOrder } from '../apollo'

// import { acceptOrder } from '../../apollo'

export default function useAcceptOrder(restaurantId) {
  const [mutateAccept, { loading, error }] = useMutation(acceptOrder)
  const acceptOrderFunc = (_id, restaurantId, time) => {
    mutateAccept({ variables: { _id, restaurantId, time } })
  }

  return { loading, error, acceptOrder: acceptOrderFunc }
}
