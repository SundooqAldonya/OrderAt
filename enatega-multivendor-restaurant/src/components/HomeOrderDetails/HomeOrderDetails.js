import { View, Pressable, I18nManager } from 'react-native'
import React, { useContext, useState, useRef, useEffect } from 'react'
import styles from './styles'
import { TextDefault } from '../../components'
import { colors, MAX_TIME } from '../../utilities'
import { Badge } from 'react-native-elements'
import { Configuration } from '../../ui/context'
import { useSubscription, gql } from '@apollo/client'
import moment from 'moment'
import { subscriptionOrder } from '../../apollo'
import CountDown from 'react-native-countdown-component'
import { useTranslation } from 'react-i18next'
import { getAccessToken } from '../../utilities/apiServices'
import { detectLanguageDir } from '../../../helpers'
import SoundContext from '../../ui/context/sound'
import 'moment-timezone'

function HomeOrderDetails(props) {
  const { activeBar, navigation } = props
  const {
    orderId,
    orderAmount,
    paymentMethod,
    orderDate,
    _id,
    preparationTime,
    createdAt,
    isRinged,
    orderStatus,
    user,
    deliveredAt,
    pickedAt,
    assignedAt,
    acceptedAt
  } = props?.order
  const timeNow = new Date()
  const { i18n, t } = useTranslation()
  const dir = detectLanguageDir(i18n.language)
  const date = new Date(orderDate)
  const acceptanceTime = moment(date).diff(timeNow, 'seconds')
  const createdTime = new Date(createdAt)
  var remainingTime = moment(createdTime)
    .add(MAX_TIME, 'seconds')
    .diff(timeNow, 'seconds')

  const configuration = useContext(Configuration.Context)
  const { stopSound } = useContext(SoundContext)

  const prep = new Date(preparationTime)
  const diffTime = prep - timeNow
  const totalPrep = diffTime > 0 ? diffTime / 1000 : 0

  const [isAcceptButtonVisible, setIsAcceptButtonVisible] = useState(
    !moment().isBefore(date)
  )
  const timer = useRef()
  const decision = !isAcceptButtonVisible
    ? acceptanceTime
    : remainingTime > 0
    ? remainingTime
    : 0
  if (decision === acceptanceTime) {
    remainingTime = 0
  }
  useEffect(() => {
    let isSubscribed = true
    ;(() => {
      timer.current = setInterval(() => {
        const isAcceptButtonVisible = !moment().isBefore(orderDate)
        isSubscribed && setIsAcceptButtonVisible(isAcceptButtonVisible)
        if (isAcceptButtonVisible) {
          timer.current && clearInterval(timer.current)
        }
      }, 10000)
    })()
    return () => {
      timer.current && clearInterval(timer.current)
      isSubscribed = false
    }
  }, [])

  useSubscription(
    gql`
      ${subscriptionOrder}
    `,
    { variables: { id: _id } }
  )

  const textAlignment = dir === 'rtl' ? 'right' : 'left'
  const flexDirection = dir === 'rtl' ? 'row-reverse' : 'row'

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor:
            activeBar === 0
              ? colors.white
              : activeBar === 1
              ? colors.white
              : colors.darkgreen,
          borderColor: orderStatus === 'ASSIGNED' ? colors.rounded : '',
          borderWidth: orderStatus === 'ASSIGNED' ? 2 : 0
        }
      ]}
      onPress={() => {
        stopSound()
        navigation.navigate('OrderDetail', {
          activeBar,
          orderData: props?.order,
          rider: props?.order.rider,
          remainingTime,
          createdAt,
          MAX_TIME,
          acceptanceTime,
          preparationTime
        })
      }}>
      {activeBar === 0 ? (
        <Badge
          status="success"
          containerStyle={{ position: 'absolute', top: 0, right: 0 }}
          badgeStyle={{
            backgroundColor: colors.rounded,
            width: 10,
            height: 10,
            borderRadius: 10
          }}
        />
      ) : null}

      <View style={[styles.itemRowBar, { flexDirection }]}>
        <TextDefault
          style={[styles.heading, { textAlign: textAlignment }]}
          H5
          bolder>
          {t('orderId')}:
        </TextDefault>
        <TextDefault style={styles.text} H5 bolder>
          {orderId}
        </TextDefault>
      </View>
      <View style={[styles.itemRowBar, { flexDirection }]}>
        <TextDefault
          style={[styles.heading, { textAlign: textAlignment }]}
          H5
          bolder>
          {t('name')}:
        </TextDefault>
        <TextDefault
          style={{ ...styles.text, textTransform: 'capitalize' }}
          H5
          bolder>
          {user.name}
        </TextDefault>
      </View>
      <View style={[styles.itemRowBar, { flexDirection }]}>
        <TextDefault
          H5
          bolder
          style={[styles.heading, { textAlign: textAlignment }]}>
          {t('orderAmount')}:
        </TextDefault>
        <TextDefault H5 bolder style={styles.text}>
          {dir === 'rtl'
            ? `${orderAmount} ${configuration.currencySymbol}`
            : `${configuration.currencySymbol} ${orderAmount}`}
        </TextDefault>
      </View>
      <View style={[styles.itemRowBar, { flexDirection }]}>
        <TextDefault
          H5
          bolder
          style={[styles.heading, { textAlign: textAlignment }]}>
          {t('paymentMethod')}:
        </TextDefault>
        <TextDefault H5 bolder style={styles.text}>
          {t(paymentMethod)}
        </TextDefault>
      </View>

      {/* <View style={[styles.itemRowBar, { flexDirection }]}>
        <TextDefault H5
          bolder style={[styles.heading, { textAlign: textAlignment }]}>
          {t('time')}:
        </TextDefault>
        <TextDefault H5
          bolder style={styles.text}>
          {moment(props.order?.createdAt).format('lll')}
        </TextDefault>
      </View> */}
      <View style={[styles.itemRowBar, { flexDirection }]}>
        <TextDefault
          H5
          bolder
          style={[styles.heading, { textAlign: textAlignment }]}>
          {t('status')}:
        </TextDefault>
        <TextDefault H5 bolder style={styles.text}>
          {t(orderStatus)}
        </TextDefault>
      </View>
      <View
        style={{
          borderBottomColor: colors.fontSecondColor,
          borderBottomWidth: 1
        }}
      />

      <View style={styles.timerBar}>
        {activeBar === 0 && (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              flexBasis: '50%'
            }}>
            <CountDown
              until={decision}
              size={20}
              timeToShow={['H', 'M', 'S']}
              digitStyle={{
                backgroundColor: colors.white
              }}
              digitTxtStyle={{
                color: 'black',
                fontSize: 20
              }}
              timeLabels={{ h: null, m: null, s: null }}
              showSeparator
              separatorStyle={{
                marginTop: -5,
                color: 'black'
              }}
            />
          </View>
        )}
        {/* {activeBar === 1 && (
          <View>
            <CountDown
              until={totalPrep}
              size={20}
              timeToShow={['H', 'M', 'S']}
              digitStyle={{
                backgroundColor: colors.white
              }}
              digitTxtStyle={{
                color: 'black',
                fontSize: 20
              }}
              timeLabels={{ h: null, m: null, s: null }}
              showSeparator
              separatorStyle={{
                marginTop: -5,
                color: 'black'
              }}
            />
          </View>
        )} */}
        {activeBar === 2 && orderStatus === 'DELIVERED' ? (
          <View>
            <TextDefault bolder>
              {moment(deliveredAt).format('hh:mm:ss A')}
            </TextDefault>
          </View>
        ) : null}
        {activeBar === 1 && orderStatus === 'PICKED' ? (
          <View>
            <TextDefault bolder>
              {moment(pickedAt).format('hh:mm:ss A')}
            </TextDefault>
          </View>
        ) : null}
        {activeBar === 1 && orderStatus === 'ASSIGNED' ? (
          <View>
            <TextDefault bolder>
              {moment(assignedAt).format('hh:mm:ss A')}
            </TextDefault>
          </View>
        ) : null}
        {activeBar === 1 && orderStatus === 'ACCEPTED' ? (
          <View>
            <TextDefault bolder>
              {moment(acceptedAt).format('hh:mm:ss A')}
            </TextDefault>
          </View>
        ) : null}
        <View>
          <Pressable
            style={[
              styles.btn,
              {
                backgroundColor:
                  activeBar === 0
                    ? 'black'
                    : activeBar === 1
                    ? colors.green
                    : colors.white
              }
            ]}
            onPress={() =>
              navigation.navigate('OrderDetail', {
                activeBar,
                orderData: props?.order,
                remainingTime,
                createdAt,
                MAX_TIME,
                acceptanceTime,
                preparationTime,
                isRinged
              })
            }>
            <TextDefault
              bold
              style={{
                color:
                  activeBar === 0
                    ? colors.green
                    : activeBar === 1
                    ? colors.orderUncomplete
                    : 'black'
              }}>
              {activeBar === 0
                ? t('pending')
                : activeBar === 1
                ? t('reject')
                : t('delivered')}
            </TextDefault>
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}
export default HomeOrderDetails
