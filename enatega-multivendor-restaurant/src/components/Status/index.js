import { View } from 'react-native'
import { TextDefault } from '../Text'
import StatusRow from './StatusRow'
import { useTranslation } from 'react-i18next'
import styles from './style'
import { colors } from '../../utilities'
import StatusMessage from './StatusMessage'

const formatTime = date =>
  new Date(date).toLocaleTimeString('en-US', { timeStyle: 'short' })

const Status = ({ order }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const STATUS_ORDER = [
    t('PENDING'),
    t('ACCEPTED'),
    t('ASSIGNED'),
    t('PICKED'),
    t('DELIVERED')
  ]
  const STATUS_MESSAGES = {
    PICKED: {
      text: t('youPickedParcel'),
      subText: t('youPickedParcel')
    },
    DELIVERED: {
      text: t('parcelDelivered'),
      subText: t('orderDelivered')
    },
    ACCEPTED: { text: t('newOrder'), subText: t('hurryUp') },
    ASSIGNED: {
      text: t('orderAssigned'),
      subText: t('orderAssignedSubText')
    },
    CANCELLED: {
      text: t('orderNotAvailable'),
      subText: t('orderNotAvailableSubText')
    }
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.statusMessage}>
          <StatusMessage
            message={STATUS_MESSAGES.CANCELLED.text}
            subText={STATUS_MESSAGES.CANCELLED.subText}
          />
        </View>
      </View>
    )
  }

  return (
    <View>
      <View style={{ ...styles.status, backgroundColor: '#000' }}>
        <StatusRow
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 0}
          status={STATUS_ORDER[0]}
          order={order}
          // address={order.restaurant.address}
          // location={order.restaurant.location}
          time={order.createdAt ? formatTime(order.createdAt) : null}
        />
        <View
          style={{
            paddingRight: isArabic ? 35 : 0
          }}>
          <View
            style={[
              styles.verticalLine,
              {
                backgroundColor:
                  t(order.orderStatus) === t('PENDING')
                    ? colors.primary
                    : colors.white,
                alignSelf: isArabic ? 'flex-end' : 'flex-start'
              }
            ]}
          />
        </View>
        <StatusRow
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 1}
          status={STATUS_ORDER[1]}
          order={order}
          // address={order.restaurant.address}
          // location={order.restaurant.location}
          time={order.acceptedAt ? formatTime(order.acceptedAt) : null}
        />
        <View
          style={{
            paddingRight: isArabic ? 35 : 0
          }}>
          <View
            style={[
              styles.verticalLine,
              {
                backgroundColor:
                  t(order.orderStatus) === t('ACCEPTED')
                    ? colors.primary
                    : colors.white,
                alignSelf: isArabic ? 'flex-end' : 'flex-start'
              }
            ]}
          />
        </View>
        <StatusRow
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 2}
          status={STATUS_ORDER[2]}
          order={order}
          // address={order.restaurant.address}
          // location={order.restaurant.location}
          time={order.assignedAt ? formatTime(order.assignedAt) : null}
        />
        <View
          style={{
            paddingRight: isArabic ? 35 : 0
          }}>
          <View
            style={[
              styles.verticalLine,
              {
                backgroundColor:
                  t(order.orderStatus) === t('ASSIGNED')
                    ? colors.primary
                    : colors.white,
                alignSelf: isArabic ? 'flex-end' : 'flex-start'
              }
            ]}
          />
        </View>
        <StatusRow
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 3}
          status={STATUS_ORDER[3]}
          order={order}
          time={order.pickedAt ? formatTime(order.pickedAt) : null}
        />
        <View
          style={{
            paddingRight: isArabic ? 35 : 0
          }}>
          <View
            style={[
              styles.verticalLine,
              {
                backgroundColor:
                  t(order.orderStatus) === t('DELIVERED')
                    ? colors.primary
                    : colors.white,
                alignSelf: isArabic ? 'flex-end' : 'flex-start'
              }
            ]}
          />
        </View>
        <StatusRow
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 4}
          status={STATUS_ORDER[4]}
          time={order.deliveredAt ? formatTime(order.deliveredAt) : null}
          // address={order.deliveryAddress.deliveryAddress}
          // location={order.deliveryAddress.location}
          order={order}
        />
      </View>
    </View>
  )
}

export default Status
