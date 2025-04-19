import React, { Fragment, useContext, useEffect, useState } from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import { Spinner, TextDefault } from '..'
import styles from './styles'
import { colors, formatReceipt, TIMES } from '../../utilities'
import { Overlay } from 'react-native-elements'
import { useAcceptOrder, usePrintOrder, useOrderRing } from '../../ui/hooks'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setPrinter, showPrintersFn } from '../../../store/printersSlice'
import { NetPrinter } from 'react-native-thermal-receipt-printer'
import { formattedPrintedText } from '../../utilities/formattedPrintedText'
import { Configuration } from '../../ui/context'
import RNPrint from 'react-native-print'
import Toast from 'react-native-toast-message'

export default function OverlayComponent(props) {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { visible, toggle, order, print, navigation } = props
  const [selectedTime, setSelectedTime] = useState(TIMES[0])
  const { acceptOrder, loading } = useAcceptOrder()
  const { muteRing } = useOrderRing()
  const { printOrder } = usePrintOrder()
  const showPrinters = useSelector(state => state.printers)
  const printerIP = useSelector(state => state.printers.printerIP)
  const configuration = useContext(Configuration.Context)
  const currency = configuration?.currency || null

  console.log({ showPrinters })

  console.log({ printerIP })

  useEffect(() => {
    NetPrinter.init()
      .then(() => {
        console.log('Initialized printer')
      })
      .catch(error => {
        console.log('Initialization failed', error)
      })
  }, [])

  const btnPress = async () => {
    if (print) {
      // acceptOrder(order._id, selectedTime.toString())
      // muteRing(order.orderId)
      // printOrder(order._id)
      // dispatch(showPrintersFn())
      await startPrinting()
    } else {
      acceptOrder(order._id, selectedTime.toString())
      muteRing(order.orderId)
    }
    // toggle()
    // loading ? <Spinner /> : navigation.navigate('Orders')
  }

  const startPrinting = () => {
    // fetch(`http://${printerIP}:9100`)
    //   .then(response => {
    //     console.log({ response })
    //     console.log('Printer is reachable')
    //   })
    //   .catch(error => {
    //     console.log('Printer is not reachable', error)
    //   })
    // dispatch(setPrinter({ printerIP: '' }))
    if (printerIP) {
      NetPrinter.connectPrinter(printerIP, 9100)
        .then(() => {
          NetPrinter.printText(formattedPrintedText(order, currency))
          console.log('Printing...')
        })
        .catch(error => {
          console.log('Failed to connect to printer', error)
          toggle()
          Toast.show({
            type: 'error', // or 'error' | 'info'
            text1: 'No printer',
            text2: 'Failed to connect to printer with that IP'
          })
        })
    } else {
      toggle()
      Toast.show({
        type: 'error', // or 'error' | 'info'
        text1: 'No IP',
        text2: 'Please fill the printer IP from settings'
      })
    }
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.btn}
            onPress={btnPress}>
            <TextDefault bold style={{ color: colors.darkgreen }}>
              {t('setAndAccept')}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </Overlay>
    </Fragment>
  )
}
