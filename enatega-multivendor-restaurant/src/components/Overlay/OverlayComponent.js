import React, { Fragment, useContext, useEffect, useRef, useState } from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import { Spinner, TextDefault } from '..'
import styles from './styles'
import { colors, TIMES } from '../../utilities'
import { Overlay } from 'react-native-elements'
import { useAcceptOrder, usePrintOrder, useOrderRing } from '../../ui/hooks'
import { useTranslation } from 'react-i18next'

export default function OverlayComponent({
  visible,
  toggle,
  order,
  print,
  navigation,
  printOrder
}) {
  const { t } = useTranslation()

  const [selectedTime, setSelectedTime] = useState(TIMES[0])
  const { acceptOrder, loading } = useAcceptOrder()
  const { muteRing } = useOrderRing()
  //const { printOrder } = usePrintOrder()

  const btnPress = async () => {
    if (print) {
      acceptOrder(order._id, selectedTime.toString())
      muteRing(order.orderId)
      printOrder()
      // dispatch(showPrintersFn())
      // await startPrinting()
    } else {
      acceptOrder(order._id, selectedTime.toString())
      muteRing(order.orderId)
    }
    toggle()
    loading ? <Spinner /> : navigation.navigate('Orders')
  }

  return (
    <Fragment>
      <Overlay
        isVisible={visible}
        onBackdropPress={toggle}
        overlayStyle={styles.container}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TextDefault H1 bolder>
              {t('setTime')}
            </TextDefault>
            <TextDefault bold>{t('forPreparation')}</TextDefault>
          </View>
          <View style={styles.time}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}>
              {TIMES.map((time, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedTime(time)}
                  style={[
                    styles.timeBtn,
                    {
                      backgroundColor:
                        selectedTime === time ? 'black' : colors.white
                    }
                  ]}>
                  <TextDefault
                    small
                    style={{
                      color: selectedTime === time ? colors.darkgreen : 'black'
                    }}>
                    {time + t('mins')}
                  </TextDefault>
                </Pressable>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={btnPress}>
            <TextDefault bold style={{ color: colors.darkgreen }}>
              {t('setAndAccept')}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </Overlay>
    </Fragment>
  )
}
