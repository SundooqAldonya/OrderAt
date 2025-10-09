import { useMutation } from '@apollo/client/react'
import { muteRingOrder, orders } from '../../apollo'
import { gql } from '@apollo/client'

const MUTE_RING_ORDER = gql`
  ${muteRingOrder}
`
const ORDERS = gql`
  ${orders}
`
export default function useOrderRing() {
  const [mutate, { loading }] = useMutation(MUTE_RING_ORDER, {
    refetchQueries: [ORDERS]
  })
  const muteRing = id => {
    mutate({ variables: { orderId: id } })
  }
  return { loading, muteRing }
}
