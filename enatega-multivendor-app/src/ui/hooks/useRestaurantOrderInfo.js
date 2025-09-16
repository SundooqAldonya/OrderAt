import { useQuery } from '@apollo/client'
import { useContext } from 'react'
import {
  recentOrderRestaurantsQuery,
  mostOrderedRestaurantsQuery
} from '../../apollo/queries'
import { LocationContext } from '../../context/Location'
import UserContext from '../../context/User'

export default function useHomeRestaurants() {
  const { location } = useContext(LocationContext)
  const { isLoggedIn } = useContext(UserContext)

  const recentOrderRestaurants = useQuery(recentOrderRestaurantsQuery, {
    variables: { latitude: location.latitude, longitude: location.longitude },
    skip: !isLoggedIn,
    fetchPolicy: 'no-cache'
  })

  const mostOrderedRestaurants = useQuery(mostOrderedRestaurantsQuery, {
    variables: { latitude: location.latitude, longitude: location.longitude },
    fetchPolicy: 'no-cache'
  })

  const refetchRecentOrderRestaurants = recentOrderRestaurants.refetch
  const refetchMostOrderedRestaurants = mostOrderedRestaurants.refetch

  const orderLoading =
    recentOrderRestaurants.loading || mostOrderedRestaurants.loading

  const orderError =
    recentOrderRestaurants.error || mostOrderedRestaurants.error

  return {
    orderLoading,
    orderError,
    refetchRecentOrderRestaurants,
    refetchMostOrderedRestaurants,
    orderData: {
      recentOrderRestaurants:
        recentOrderRestaurants?.data?.recentOrderRestaurantsPreview,
      mostOrderedRestaurants:
        mostOrderedRestaurants?.data?.mostOrderedRestaurantsPreview
    }
  }
}
