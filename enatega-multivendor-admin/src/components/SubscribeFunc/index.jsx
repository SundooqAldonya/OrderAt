import { gql, useSubscription } from '@apollo/client'
import { subscriptionOrder } from '../../apollo'
import { transformToNewline } from '../../utils/stringManipulations'

const SUBSCRIPTION_ORDER = gql`
  ${subscriptionOrder}
`
const SubscribeFunc = row => {
  const { data: dataSubscription } = useSubscription(SUBSCRIPTION_ORDER, {
    variables: { id: row._id }
  })
  console.log(dataSubscription)
  return (
    <div style={{ overflow: 'visible', whiteSpace: 'pre' }}>
      {row.orderId}
      <br />
      {transformToNewline(row.deliveryAddress.deliveryAddress, 3)}
    </div>
  )
}

export default SubscribeFunc
