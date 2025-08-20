import React, { useEffect } from 'react'
import { View } from 'react-native'
import { moderateScale } from '../../../utils/scaling'
import { useSubscription } from '@apollo/client'
import { subscriptionOrder } from '../../../apollo/subscriptions'
import gql from 'graphql-tag'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'
import { useTranslation } from 'react-i18next'

export const orderStatuses = [
  {
    key: 'PENDING',
    status: 1,
    statusText: 'pendingOrder'
  },
  {
    key: 'ACCEPTED',
    status: 2,
    statusText: 'acceptedOrder'
  },
  {
    key: 'ASSIGNED',
    status: 3,
    statusText: 'assignedOrder'
  },
  {
    key: 'PICKED',
    status: 4,
    statusText: 'pickedOrder'
  },
  {
    key: 'DELIVERED',
    status: 5,
    statusText: 'deliveredOrder'
  },
  {
    key: 'COMPLETED',
    status: 6,
    statusText: 'completedOrder'
  },
  {
    key: 'CANCELLED',
    status: 6,
    statusText: 'cancelledOrder'
  }
]

export const checkStatus = (status) => {
  const obj = orderStatuses.filter((x) => {
    return x.key === status
  })
  return obj[0]
}

export const ProgressBar = ({ currentTheme, item, customWidth }) => {
  const { i18n } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  if (item.orderStatus === ORDER_STATUS_ENUM.CANCELLED) return null
  const skipSubscription = item.orderStatus === ORDER_STATUS_ENUM.CANCELLED

  const { data: subscriptionData, error: subscriptionError } = useSubscription(
    gql`
      ${subscriptionOrder}
    `,
    { variables: { id: item._id }, skip: skipSubscription }
  )

  console.log({ subscriptionData })

  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError.message)
      return
    }

    if (subscriptionData?.orderStatusChanged) {
      // handle new order status
      console.log('Order status updated:', subscriptionData.orderStatusChanged)

      // optionally: trigger UI update, refetch, state change, etc.
    }
  }, [subscriptionData, subscriptionError])

  const defaultWidth = moderateScale(50)
  const width = customWidth !== undefined ? customWidth : defaultWidth

  return (
    <View style={{ marginTop: moderateScale(10) }}>
      <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}>
        {Array(checkStatus(item.orderStatus).status)
          .fill(0)
          .map((item, index) => (
            <View
              key={index}
              style={{
                height: moderateScale(4),
                backgroundColor: currentTheme.primary,
                width: width,
                marginRight: moderateScale(10)
              }}
            />
          ))}
        {Array(5 - checkStatus(item.orderStatus).status)
          .fill(0)
          .map((item, index) => (
            <View
              key={index}
              style={{
                height: moderateScale(4),
                backgroundColor: currentTheme.gray200,
                width: width,
                marginRight: moderateScale(10)
              }}
            />
          ))}
      </View>
    </View>
  )
}
