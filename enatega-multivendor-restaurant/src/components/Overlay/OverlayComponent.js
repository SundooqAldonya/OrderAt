import React, { Fragment, useContext, useEffect, useRef, useState } from 'react'
import {
  View,
  Pressable,
  TouchableOpacity,
  Text,
  NativeModules
} from 'react-native'
import { Spinner, TextDefault } from '..'
import styles from './styles'
import { colors, formatReceipt, TIMES } from '../../utilities'
import { Overlay } from 'react-native-elements'
import { useAcceptOrder, usePrintOrder, useOrderRing } from '../../ui/hooks'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setPrinter, showPrintersFn } from '../../../store/printersSlice'
import ThermalPrinterModule, {
  NetPrinter
} from 'react-native-thermal-receipt-printer'
import { formattedPrintedText } from '../../utilities/formattedPrintedText'
import { Configuration } from '../../ui/context'
import Toast from 'react-native-toast-message'
import { captureRef } from 'react-native-view-shot'
import {
  convertTo1BitBitmap,
  convertToBWBitmap,
  downloadLogo,
  generateEscPosBitmap,
  imageToBase64
} from '../../utilities/printerHelpers'
import { Buffer } from 'buffer'
import iconv from 'iconv-lite'
import RNFS from 'react-native-fs'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'

const { RNNetPrinter } = NativeModules

export default function OverlayComponent(props) {
  const viewRef = useRef()
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

  const printArabic = async () => {
    try {
      // Connect to the network printer (replace IP/port)
      await ThermalPrinterModule.connectNet('192.168.1.100', 9100)

      // Encode Arabic text to Windows-1256 (common for ESC/POS printers)
      const arabicText = 'مرحبا بالعالم'
      const encodedText = iconv.encode(arabicText, 'win1256')

      // Create ESC/POS commands
      const commands = [
        { command: 'ESC', value: '@' }, // Initialize printer
        { command: 'ESC', value: 't', args: [16] }, // Set code page to Windows-1256
        { command: 'TEXT', text: encodedText.toString('hex'), hex: true }, // Send hex data
        { command: 'CUT' } // Cut paper
      ]

      // Print
      await ThermalPrinterModule.print(commands)
    } catch (err) {
      console.error('Print error:', err)
    } finally {
      await ThermalPrinterModule.disconnect() // Disconnect after printing
    }
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

  const captureReceipt = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile' // can also be 'base64' or 'data-uri'
      })

      console.log('Captured URI:', uri)

      const asset = Asset.fromModule(require('../../assets/JsLogo.bmp'))
      await asset.downloadAsync() // ensure it's on device
      // 2) Read the BMP file as Base64
      const base64Bmp = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64
      })
      RNNetPrinter.connectPrinter(
        printerIP,
        9100,
        () => {
          console.log('✅ Connected to printer')
          // now you can send the data

          RNNetPrinter.printRawData(base64Bmp, err => {
            if (err) console.warn('Print error', err)
            else console.log('Printed OK!')
            RNNetPrinter.closeConn()
          })
        },
        error => {
          console.warn('❌ Failed to connect to printer:', error)
        }
      )
      // NetPrinter.connectPrinter(printerIP, 9100)
      //   .then(() => {
      //     NetPrinter.printText(imageBase64)
      //     console.log('Printing...')
      //   })
      //   .catch(error => {
      //     console.log('Failed to connect to printer', error)
      //     toggle()
      //     Toast.show({
      //       type: 'error', // or 'error' | 'info'
      //       text1: 'No printer',
      //       text2: 'Failed to connect to printer with that IP'
      //     })
      //   })
      // Now you can convert it to base64, or send it to the printer
    } catch (err) {
      console.error('Capture failed', err)
    }
  }

  console.log({ viewRef })

  return (
    <Fragment>
      <View
        ref={viewRef}
        collapsable={false}
        style={{
          backgroundColor: 'white',
          padding: 20
        }}>
        <Text style={{ fontSize: 20 }}>🧾 Receipt</Text>
        <Text>Item 1: $5</Text>
        <Text>Item 2: $3</Text>
        <Text>Total: $8</Text>
      </View>
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
            style={styles.btn}
            // onPress={btnPress}
            onPress={() => downloadLogo(viewRef.current, printerIP)}>
            <TextDefault bold style={{ color: colors.darkgreen }}>
              {t('donwload')}
            </TextDefault>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            // onPress={btnPress}
            onPress={captureReceipt}>
            <TextDefault bold style={{ color: colors.darkgreen }}>
              {t('setAndAccept')}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </Overlay>
    </Fragment>
  )
}
