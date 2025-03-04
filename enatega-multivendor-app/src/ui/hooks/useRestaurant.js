import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import {
  restaurant,
  restaurantCustomer,
  restaurantCustomerAppDetail
} from '../../apollo/queries'

const RESTAURANT = gql`
  ${restaurantCustomer}
`
// const RESTAURANT = gql`
//   ${restaurant}
// `

export default function useRestaurant(id) {
  const { data, refetch, networkStatus, loading, error } = useQuery(
    RESTAURANT,
    { variables: { id }, fetchPolicy: 'network-only' }
  )
  return { data, refetch, networkStatus, loading, error }
}
