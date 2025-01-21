import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './style'
import TextDefault from '../Text/TextDefault/TextDefault'
import colors from '../../utilities/colors'
import useOrder from './useOrder'
import Spinner from '../Spinner/Spinner'
import { useTranslation } from 'react-i18next'
import { useSoundContext } from '../../context/sound'

const Order = ({ order, orderAmount }) => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const {
    active,
    navigation,
    time,
    mutateAssignOrder,
    loadingAssignOrder
  } = useOrder(order)

  const { stopSound, seenOrders, setSeenOrders } = useSoundContext()

  const handlePress = async id => {
    setSeenOrders([...seenOrders, id])
    await stopSound()
    navigation.navigate('OrderDetail', {
      itemId: order?._id,
      order
    })
  }

  const formatPrice = price => {
    if (!price) return price

    const numericPart = price.replace(/[^\d-]/g, '')
    const currencyPart = price.replace(/[\d-]/g, '')

    if (isArabic) {
      return `${numericPart} ${currencyPart}`
    }

    return `${currencyPart} ${numericPart}`
  }

  return (
    <>
      <View
        style={{
          marginTop: 20,
          flexDirection: isArabic ? 'row-reverse' : 'row'
        }}>
        {order?.orderStatus === 'ACCEPTED' ||
        order?.orderStatus === 'PICKED' ? (
          <View
            style={[
              styles.badge,
              active === 'MyOrders' ? styles.bgRed : styles.bgBlack
            ]}
          />
        ) : null}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.container,
            active === 'NewOrders' ? styles.bgPrimary : styles.bgWhite
          ]}
          onPress={() => handlePress(order._id)}>
          {isArabic ? (
            <>
              <View style={styles.row}>
                <TextDefault style={styles.rowItem2} bolder H4>
                  {order?.orderId}
                </TextDefault>
                <TextDefault
                  style={{ ...styles.rowItem1, textAlign: 'right' }}
                  bolder
                  H4>
                  {t('orderID')}
                </TextDefault>
              </View>
              <View
                style={{
                  ...styles.row
                }}>
                <TextDefault bolder H5>
                  {order.restaurant.name}
                </TextDefault>
                <TextDefault
                  style={{ ...styles.rowItem1, textAlign: 'right' }}
                  bolder
                  H5
                  textColor={colors.fontSecondColor}>
                  {t('businessName')}:
                </TextDefault>
              </View>
              <View style={styles.row}>
                <TextDefault bolder H5>
                  {formatPrice(orderAmount)}
                </TextDefault>
                <TextDefault
                  style={{ ...styles.rowItem1, textAlign: 'right' }}
                  bolder
                  H5
                  textColor={colors.fontSecondColor}>
                  {t('orderAmount')}:
                </TextDefault>
              </View>
              <View style={styles.row}>
                <TextDefault style={styles.rowItem2} bolder H5>
                  {order?.paymentMethod}
                </TextDefault>
                <TextDefault
                  style={{ ...styles.rowItem1, textAlign: 'right' }}
                  bolder
                  H5
                  textColor={colors.fontSecondColor}>
                  {t('paymentMethod')}:
                </TextDefault>
              </View>
              {active === 'MyOrders' && (
                <View style={styles.row}>
                  <TextDefault style={styles.rowItem2} bolder H5>
                    {new Date(order?.createdAt).toLocaleDateString()}{' '}
                    {new Date(order?.createdAt).toLocaleTimeString()}
                  </TextDefault>
                  <TextDefault
                    style={{ ...styles.rowItem1, textAlign: 'right' }}
                    bolder
                    H5
                    textColor={colors.fontSecondColor}>
                    {t('deliveryTime')}:
                  </TextDefault>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.row}>
                <TextDefault style={styles.rowItem1} bolder H4>
                  {t('orderID')}
                </TextDefault>
                <TextDefault style={styles.rowItem2} bolder H4>
                  {order?.orderId}
                </TextDefault>
              </View>
              <View
                style={{
                  ...styles.row,
                  flexDirection: 'row-reverse'
                }}>
                <TextDefault bolder H5>
                  {order.restaurant.name}
                </TextDefault>
                <TextDefault
                  style={styles.rowItem1}
                  bolder
                  H5
                  textColor={colors.fontSecondColor}>
                  {t('businessName')}:
                </TextDefault>
              </View>
              <View style={styles.row}>
                <TextDefault
                  style={styles.rowItem1}
                  bolder
                  H5
                  textColor={colors.fontSecondColor}>
                  {t('orderAmount')}:
                </TextDefault>
                <TextDefault
                  style={[styles.rowItem2, { paddingRight: 65 }]}
                  bolder
                  H5>
                  {formatPrice(orderAmount)}
                </TextDefault>
              </View>
              <View style={styles.row}>
                <TextDefault
                  style={styles.rowItem1}
                  bolder
                  H5
                  textColor={colors.fontSecondColor}>
                  {t('paymentMethod')}:
                </TextDefault>
                <TextDefault style={styles.rowItem2} bolder H5>
                  {order?.paymentMethod}
                </TextDefault>
              </View>
              {active === 'MyOrders' && (
                <View style={styles.row}>
                  <TextDefault
                    style={styles.rowItem1}
                    bolder
                    H5
                    textColor={colors.fontSecondColor}>
                    {t('deliveryTime')}:
                  </TextDefault>
                  <TextDefault style={styles.rowItem2} bolder H5>
                    {new Date(order?.createdAt).toLocaleDateString()}{' '}
                    {new Date(order?.createdAt).toLocaleTimeString()}
                  </TextDefault>
                </View>
              )}
            </>
          )}

          <View style={styles.horizontalLine} />
          <View style={styles.row}>
            {active === 'NewOrders' && (
              <View style={[styles.row, styles.rowItem1, styles.timeLeft]}>
                <TextDefault bold H6 textColor={colors.fontSecondColor}>
                  {t('timeLeft')}
                </TextDefault>
                <TextDefault bolder H2 style={styles.time}>
                  {time}
                </TextDefault>
              </View>
            )}
            {active === 'MyOrders' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.rowItem2,
                  styles.btn,
                  active === 'MyOrders' && styles.paddingBottom
                ]}
                disabled>
                <TextDefault bolder center textColor={colors.primary}>
                  {order?.orderStatus === 'DELIVERED'
                    ? t('DELIVERED')
                    : t('inProgress')}
                </TextDefault>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.rowItem2,
                  styles.btn,
                  active === 'MyOrders' && styles.paddingBottom
                ]}
                onPress={() => {
                  mutateAssignOrder({
                    variables: { id: order?._id }
                  })
                }}>
                <TextDefault bolder center textColor={colors.white}>
                  {loadingAssignOrder ? (
                    <Spinner size="small" color="transparent" />
                  ) : (
                    t('assignMe')
                  )}
                </TextDefault>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default Order
