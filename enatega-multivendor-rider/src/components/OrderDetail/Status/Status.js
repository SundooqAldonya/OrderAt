import {
  Alert,
  Image,
  Linking,
  Platform,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import styles from './style'
import colors from '../../../utilities/colors'
import TextDefault from '../../Text/TextDefault/TextDefault'
const Tick = require('../../../assets/svg/tick.png')
const Restaurant = require('../../../assets/svg/restaurant.png')
const DeliveryBoy = require('../../../assets/svg/DeliveryBoy.png')
import UserContext from '../../../context/user'
import { useTranslation } from 'react-i18next'
import useOrderDetail from '../../../screens/OrderDetail/useOrderDetail'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useNavigation } from '@react-navigation/native'
import { openGoogleMaps } from '../../../utilities/callMaps'
import StatusRow from './StatusRow'

const formatTime = date =>
  new Date(date).toLocaleTimeString('en-US', { timeStyle: 'short' })

const Status = ({ orderData, itemId, pickedAt, deliveredAt, assignedAt }) => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
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

  const STATUS_ORDER = [t('ASSIGNED'), t('PICKED'), t('DELIVERED')]
  const { assignedOrders, loadingAssigned } = useContext(UserContext)
  const [order, setOrder] = useState(orderData)
  const { locationPin, deliveryAddressPin } = useOrderDetail()

  useEffect(() => {
    if (!loadingAssigned) {
      setOrder(assignedOrders.find(o => o._id === itemId))
    }
  }, [assignedOrders])

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

  console.log({ restaurant: order?.restaurant })

  console.log({
    pickupLocation:
      order?.restaurant && order?.restaurant?._id
        ? order?.restaurant?.location
        : order?.pickupLocation?.coordinates
  })
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statusMessage,
          { flexDirection: isArabic ? 'row-reverse' : 'row' }
        ]}>
        <Icon
          name={
            order.orderStatus === 'ACCEPTED'
              ? Restaurant
              : ['PICKED', 'ASSIGNED'].includes(order.orderStatus)
              ? DeliveryBoy
              : Tick
          }
        />
        <StatusMessage
          message={STATUS_MESSAGES[order.orderStatus].text}
          subText={STATUS_MESSAGES[order.orderStatus].subText}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} />
        </TouchableOpacity>
      </View>
      <View style={[styles.status]}>
        <StatusRow
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 0}
          status={STATUS_ORDER[0]}
          order={order}
          // address={
          //   order?.restaurant._id
          //     ? order?.restaurant?.address
          //     : order?.pickupAddress
          // }
          address={true}
          location={
            order?.restaurant._id
              ? order?.restaurant?.location
              : order?.pickupLocation
          }
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
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 1}
          status={STATUS_ORDER[1]}
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
          fillColor={STATUS_ORDER.indexOf(t(order.orderStatus)) >= 2}
          status={STATUS_ORDER[2]}
          time={order.deliveredAt ? formatTime(order.deliveredAt) : null}
          address={order.deliveryAddress.deliveryAddress}
          location={order.deliveryAddress.location}
          order={order}
        />
      </View>
    </View>
  )
}

// const StatusRow = ({
//   status,
//   time,
//   address = null,
//   location = null,
//   order,
//   fillColor = styles.bgSecondary
// }) => {
//   const { t, i18n } = useTranslation()
//   const isArabic = i18n.language === 'ar'

//   console.log({ location, address })

//   return (
//     <View
//       style={[
//         styles.statusRow,
//         { flexDirection: isArabic ? 'row-reverse' : 'row' }
//       ]}>
//       <View
//         style={[
//           styles.circle,
//           fillColor ? styles.bgPrimary : styles.bgSecondary,
//           isArabic ? { marginInlineStart: 10 } : {}
//         ]}
//       />
//       <View style={styles.statusOrder}>
//         <TextDefault
//           bolder
//           H3
//           textColor={fillColor ? colors.primary : colors.white}>
//           {status}
//         </TextDefault>
//         {address ? (
//           <View>
//             <TouchableOpacity
//               onPress={() =>
//                 openGoogleMaps({
//                   latitude: location?.coordinates
//                     ? location?.coordinates[1]
//                     : null,
//                   longitude: location?.coordinates
//                     ? location?.coordinates[0]
//                     : null
//                 })
//               }>
//               <View
//                 style={{
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center'
//                 }}>
//                 <TextDefault
//                   bold
//                   textColor={colors.white}
//                   style={{ textAlign: isArabic ? 'right' : 'left' }}>
//                   {address}
//                 </TextDefault>
//                 <EvilIcons
//                   size={24}
//                   name="external-link"
//                   style={{ color: '#fff', backgroundColor: 'gray' }}
//                 />
//               </View>
//             </TouchableOpacity>
//           </View>
//         ) : null}
//       </View>
//       <View style={styles.time}>
//         <TextDefault bolder H5 textColor={colors.fontSecondColor}>
//           {time}
//         </TextDefault>
//       </View>
//     </View>
//   )
// }

const StatusMessage = ({ message, subText }) => {
  return (
    <View style={styles.message}>
      <TextDefault bolder H3>
        {message}
      </TextDefault>
      <TextDefault bold H6 textColor={colors.fontSecondColor}>
        {subText}
      </TextDefault>
    </View>
  )
}

const Icon = ({ name }) => {
  return (
    <View style={styles.iconView}>
      <Image source={name} style={styles.icon} />
    </View>
  )
}

export default Status
