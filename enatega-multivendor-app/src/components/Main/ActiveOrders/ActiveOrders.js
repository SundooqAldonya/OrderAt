import React, { useContext, useState, useEffect, useRef } from 'react'
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import ConfigurationContext from '../../../context/Configuration'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { moderateScale } from '../../../utils/scaling'
import { useNavigation } from '@react-navigation/native'
import TextError from '../../Text/TextError/TextError'
import OrdersContext from '../../../context/Orders'
import Spinner from '../../Spinner/Spinner'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { Modalize } from 'react-native-modalize'
import { ProgressBar, checkStatus } from './ProgressBar'
import styles from './styles'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'
import { calulateRemainingTime } from '../../../utils/customFunctions'
import { Ionicons } from '@expo/vector-icons'

const SCREEN_HEIGHT = Dimensions.get('screen').height
const MODAL_HEIGHT = Math.floor(SCREEN_HEIGHT / 4.9)

const orderStatusActive = ['PENDING', 'PICKED', 'ACCEPTED', 'ASSIGNED']

const ActiveOrders = ({ onActiveOrdersChange }) => {
  const modalRef = useRef()
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const { loadingOrders, errorOrders, orders } = useContext(OrdersContext)
  const foundAcceptedOrder = orders?.find(
    (order) => order.status === 'ACCEPTED'
  )
  const [alwaysOpen, setAlwaysOpen] = useState(MODAL_HEIGHT)
  console.log({ foundAcceptedOrder })
  const configuration = useContext(ConfigurationContext)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const activeOrders = orders.filter((o) =>
    orderStatusActive.includes(o.orderStatus)
  )
  const onPressDetails = (order) => {
    navigation.navigate('OrderDetail', {
      _id: order._id,
      currencySymbol: configuration.currencySymbol
    })
  }

  const [showAll, setShowAll] = useState(false)

  const displayOrders = showAll ? activeOrders : activeOrders.slice(0, 2)

  useEffect(() => {
    const hasActiveOrders = displayOrders.length > 0
    onActiveOrdersChange(hasActiveOrders)
  }, [displayOrders, onActiveOrdersChange])

  if (loadingOrders) return null
  if (errorOrders && !orders) return <TextError text={errorOrders.message} />
  if (!displayOrders.length) return null
  const order = displayOrders[0]
  const remainingTime = calulateRemainingTime(order)
  const modalStyle = {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: currentTheme.themeBackground
  }

  const closeCompletely = () => {
    // Step 1: Set alwaysOpen to 0
    setAlwaysOpen(0)

    // Step 2: Wait for state to apply, then close the modal
    setTimeout(() => {
      modalRef.current?.close()
    }, 50) // small delay to allow re-render
  }

  return (
    <Modalize
      ref={modalRef}
      alwaysOpen={alwaysOpen}
      withHandle={false}
      modalHeight={MODAL_HEIGHT}
      modalStyle={modalStyle}
    >
      <TouchableOpacity
        onPress={closeCompletely}
        style={{
          position: 'absolute',
          top: 5,
          right: 10
        }}
      >
        <Ionicons name='close' size={moderateScale(24)} color='#333' />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          marginTop: moderateScale(30),
          marginHorizontal: moderateScale(10)
        }}
        onPress={() => onPressDetails(order)}
      >
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <TextDefault Regular textColor={currentTheme.fontGrayNew}>
            {t('estimatedDeliveryTime')}
          </TextDefault>
          <TouchableOpacity onPress={() => onPressDetails(order)}>
            <TextDefault textColor={currentTheme.gray700} bolder>
              {t('details')}
            </TextDefault>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: moderateScale(10),
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          {!isArabic ? (
            <TextDefault Regular textColor={currentTheme.gray900} H1 bolder>
              {remainingTime}-{remainingTime + 5} {t('mins')}
            </TextDefault>
          ) : (
            <TextDefault Regular textColor={currentTheme.gray900} H1 bolder>
              {t('mins')} {remainingTime}-{remainingTime + 5}
            </TextDefault>
          )}
        </View>
        <View>
          <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}>
            <ProgressBar
              configuration={configuration}
              currentTheme={currentTheme}
              item={order}
              navigation={navigation}
            />
          </View>
          <View
            style={{
              marginTop: moderateScale(10)
            }}
          >
            <TextDefault
              numberOfLines={2}
              style={{
                ...styles(currentTheme).statusText,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {t(order.orderStatus)}
            </TextDefault>
          </View>
        </View>
      </TouchableOpacity>
    </Modalize>
  )
}

export default ActiveOrders
