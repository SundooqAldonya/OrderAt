import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  View,
  ActivityIndicator,
  ImageBackground,
  Alert,
  ScrollView
} from 'react-native'
import { Spinner, TextDefault } from '../../components'
import { colors, MAX_TIME } from '../../utilities'
import styles from './styles'
import { Image, Button } from 'react-native-elements'
import OrderDetails from '../../components/OrderDetails/OrderDetails'
import { OverlayComponent } from '../../components/Overlay'
import BackButton from '../../components/BackButton/BackButton'
import moment from 'moment'
import { useCancelOrder, useOrderPickedUp, useOrderRing } from '../../ui/hooks'
import CountDown from 'react-native-countdown-component'
import { useTranslation } from 'react-i18next'
import Status from '../../components/Status'
import { Configuration } from '../../ui/context'
import { useRestaurantContext } from '../../ui/context/restaurant'
import { formatReceipt } from '../../utilities/formatReceipt'
import SpriteCapture, {
  SpriteCaptureHandle
} from '../../utilities/SpriteCapture'
import PrinterManager from '../../utilities/printers/printerManager'
import fs from 'react-native-fs'

import * as htmlToImage from 'html-to-image'
import { toPng } from 'html-to-image'
import RenderHtml from '@builder.io/react-native-render-html'
import { loadPrinterInfo } from '../../utilities/printers'
import * as ImageManipulator from 'expo-image-manipulator'
import { Asset } from 'expo-asset'

const ReceiptViewer = ({ receipt_HTML, width }) => {
  return <RenderHtml contentWidth={width} source={{ html: receipt_HTML }} />
}

export default function OrderDetail({ navigation, route }) {
  const { currency } = useContext(Configuration.Context)
  const receiptRef = useRef(null)
  // let b64 = ''
  const [b64, setB64] = useState(null)

  const { t, i18n } = useTranslation()
  const {
    activeBar,
    orderData,
    rider,
    preparationTime,
    createdAt
  } = route.params

  useEffect(() => {
    async function fetchData() {
      let base64 = await receiptRef.current.captureBase64()
      base64 = await fs.readFile(base64, 'base64')
      setB64(base64.replace(/\r?\n|\r/g, ''))
      console.log('fetched', b64?.substring(0, 40))
    }
    fetchData()
  }, [receiptRef])

  // Set navigation reference for PrinterManager
  useEffect(() => {
    PrinterManager.setNavigationRef(navigation)
  }, [navigation])

  const { _id, orderDate } = orderData
  const { cancelOrder, loading: cancelLoading } = useCancelOrder()
  const { pickedUp, loading: loadingPicked } = useOrderPickedUp()
  const { muteRing } = useOrderRing()
  const [overlayVisible, setOverlayVisible] = useState(false)
  const isAcceptButtonVisible = !moment().isBefore(orderDate)
  const [print, setPrint] = useState(false)

  const { data } = useRestaurantContext()
  const timeNow = new Date()

  const createdTime = new Date(createdAt)
  const remainingTime = moment(createdTime)
    .add(MAX_TIME, 'seconds')
    .diff(timeNow, 'seconds')

  const date = new Date(orderDate)
  const acceptTime = moment(date).diff(timeNow, 'seconds')

  const prep = new Date(preparationTime)
  const diffTime = prep - timeNow
  const totalPrep = diffTime > 0 ? diffTime / 1000 : 0

  const decision = !isAcceptButtonVisible
    ? acceptTime
    : remainingTime > 0
    ? remainingTime
    : 0

  const order = data?.restaurantOrders?.find(o => o._id === _id)
  const receiptHTML = formatReceipt(order, currency)
  const imagePath = require('../../assets/bowl.png')

  const toggleOverlay = () => {
    setPrint(false)
    setOverlayVisible(!overlayVisible)
  }

  const togglePrintOverlay = async () => {
    let printed = await printOrder()
    if (printed) {
      setPrint(true)
      setOverlayVisible(!overlayVisible)
    }
  }

  const getImageBase64 = async () => {
    try {
      const image = require('../../assets/logo_2.png')
      const asset = Asset.fromModule(image)
      await asset.downloadAsync()
      const fileUri = asset.localUri || asset.uri

      const manipulated = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: 300, height: 200 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
      )

      return manipulated.base64
    } catch (err) {
      console.error('Error reading image:', err)
      return null
    }
  }

  const printOrder = async () => {
    const lastPrinter = await loadPrinterInfo()
    console.log({ printerInfo: lastPrinter })
    console.log({ b64: b64?.substring(0, 40) })
    // await PrinterManager.disconnect(lastPrinter)
    await PrinterManager.connect(lastPrinter)
    // await new Promise(res => setTimeout(res, 300))
    // const imageBase64 = await getImageBase64()
    // await PrinterManager.printBase64(imageBase64, {
    //   align: 'center',
    //   width: 300, // make sure to fit printer width (≤ 384 for 58mm, ≤ 576 for 80mm)
    //   height: 200
    // })
    if (receiptRef.current) {
      try {
        // b64 = b64.replace(/\r?\n|\r/g, '')
        await new Promise(res => setTimeout(res, 1000))
        // console.log({ b64 })
        // await PrinterManager.escPrint()
        await PrinterManager.printBase64(b64, { width: 384 })
        await PrinterManager.print('\n', { align: 'center', cutPaper: true })
        return true
      } catch (err) {
        console.error(err)
      }
    } else {
      console.log('NO Ref FOUND!')
    }
    return false
  }

  const cancelOrderFunc = () => {
    cancelOrder(order._id, 'not available')
    muteRing(order.orderId)
    if (cancelLoading) {
      return <Spinner />
    } else {
      navigation.navigate('Orders')
    }
  }

  // const pickUpOrderFunc = () => {
  //   pickedUp(order._id)
  //   if (loadingPicked) {
  //     return <Spinner />
  //   } else {
  //     navigation.navigate('Orders')
  //   }
  // }

  const isArabic = i18n.language === 'ar'

  if (!order) return <TextDefault>⚠️ Order not available</TextDefault>

  return (
    <View style={{ flex: 1 }}>
      {orderData ? (
        <SpriteCapture ref={receiptRef} width={250}>
          <ReceiptViewer receipt_HTML={receiptHTML} width={384}></ReceiptViewer>
        </SpriteCapture>
      ) : null}

      <BackButton navigation={navigation} />
      <ImageBackground
        source={require('../../assets/bg.png')}
        resizeMode="cover"
        style={styles.image}>
        <View style={styles.topContainer}>
          <Image
            source={require('../../assets/HeaderLight.png')}
            PlaceholderContent={<ActivityIndicator />}
            style={{ width: 150, height: 140 }}
          />
        </View>
        <View style={styles.lowerContainer}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.roundedBar,
                isArabic && { flexDirection: 'row-reverse' }
              ]}>
              <View
                style={[styles.iconContainer, isArabic && { MarginLeft: 10 }]}>
                <Image
                  source={imagePath}
                  PlaceholderContent={<ActivityIndicator />}
                  style={{ width: 25, height: 25 }}
                />
              </View>
              <View
                style={[
                  styles.textContainer,
                  isArabic && {
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                  }
                ]}>
                <TextDefault
                  bolder
                  H4
                  style={isArabic && { textAlign: 'right' }}>
                  {activeBar === 2 ? t('prepared') : t('preparing')}
                </TextDefault>
                <TextDefault
                  style={{
                    textAlign: isArabic ? 'right' : 'left'
                  }}>
                  {t(orderData.orderStatus)}
                </TextDefault>
              </View>
            </View>
          </View>
          <ScrollView style={styles.scrollView}>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <View style={{ marginBottom: 20 }}>
                {!isAcceptButtonVisible && (
                  <TextDefault>{t('acceptOrderText')} </TextDefault>
                )}
                {activeBar === 0 && (
                  <CountDown
                    until={decision}
                    size={20}
                    timeToShow={['H', 'M', 'S']}
                    digitStyle={{ backgroundColor: colors.white }}
                    digitTxtStyle={{
                      color: 'black',
                      fontSize: 35
                    }}
                    timeLabels={{ h: null, m: null, s: null }}
                    showSeparator
                    separatorStyle={{
                      color: 'black'
                    }}
                  />
                )}
                {activeBar === 1 && (
                  <>
                    <TextDefault textColor="gray" bolder center>
                      {t('timeLeft')}
                    </TextDefault>
                    <CountDown
                      until={totalPrep}
                      size={20}
                      timeToShow={['H', 'M', 'S']}
                      digitStyle={{ backgroundColor: colors.white }}
                      digitTxtStyle={{
                        color: 'black',
                        fontSize: 35
                      }}
                      timeLabels={{ h: null, m: null, s: null }}
                      showSeparator
                      separatorStyle={{
                        color: 'black'
                      }}
                    />
                  </>
                )}
              </View>
              <Button
                title={t('Print')}
                buttonStyle={{
                  backgroundColor: 'black',
                  borderRadius: 10,
                  padding: 15
                }}
                titleStyle={{ color: colors.white, fontWeight: '500' }}
                containerStyle={{
                  width: 250,
                  marginVertical: 10
                }}
                onPress={printOrder}
              />
              {activeBar === 0 && isAcceptButtonVisible && (
                <>
                  {/* <Button
                    title={t('Print')}
                    buttonStyle={{
                      backgroundColor: 'black',
                      borderRadius: 10,
                      padding: 15
                    }}
                    titleStyle={{ color: colors.white, fontWeight: '500' }}
                    containerStyle={{
                      width: 250,
                      marginVertical: 10
                    }}
                    onPress={printOrder}
                  /> */}

                  <Button
                    title={t('acceptAndPrint')}
                    buttonStyle={{
                      backgroundColor: colors.green,
                      borderRadius: 10,
                      padding: 15
                    }}
                    titleStyle={{ color: 'black', fontWeight: '500' }}
                    containerStyle={{
                      width: 250
                    }}
                    onPress={togglePrintOverlay}
                  />

                  <Button
                    title={t('accept')}
                    buttonStyle={{
                      backgroundColor: 'black',
                      borderRadius: 10,
                      padding: 15
                    }}
                    titleStyle={{ color: colors.white, fontWeight: '500' }}
                    containerStyle={{
                      width: 250,
                      marginVertical: 10
                    }}
                    onPress={toggleOverlay}
                  />

                  <OverlayComponent
                    visible={overlayVisible}
                    toggle={toggleOverlay}
                    order={order}
                    print={print}
                    navigation={navigation}
                    printOrder={printOrder}
                  />
                </>
              )}
              {/* {activeBar === 1 && (
                <>
                  <Button
                    title={t('delivered')}
                    buttonStyle={{
                      backgroundColor: colors.green,
                      borderColor: colors.darkgreen,
                      borderWidth: 1.5,
                      borderRadius: 10,
                      padding: 15
                    }}
                    titleStyle={{
                      color: 'black',
                      fontWeight: '500'
                    }}
                    containerStyle={{
                      width: 250,
                      marginVertical: 10
                    }}
                    onPress={pickUpOrderFunc}
                  />
                </>
              )} */}
              {activeBar !== 2 && (
                <>
                  <Button
                    title={t('reject')}
                    buttonStyle={{
                      borderColor: colors.orderUncomplete,
                      borderWidth: 1.5,
                      borderRadius: 10,
                      padding: 15
                    }}
                    type="outline"
                    titleStyle={{
                      color: colors.orderUncomplete,
                      fontWeight: '500'
                    }}
                    containerStyle={{
                      width: 250
                    }}
                    onPress={cancelOrderFunc}
                  />
                </>
              )}
              {activeBar === 2 && (
                <>
                  <TextDefault H3 textColor={colors.darkgreen} bold>
                    {t('delivered')}
                  </TextDefault>
                </>
              )}
            </View>
            <View style={styles.borderContainer}>
              <TextDefault
                bold
                H2
                center
                style={isArabic && { textAlign: 'right' }}>
                {t('orderDetail')}
              </TextDefault>
            </View>
            {/* order details */}
            <OrderDetails orderData={orderData} isArabic={isArabic} />
            {/* order status */}
            <Status
              order={orderData}
              itemId={order?._id}
              pickedAt={order?.pickedAt}
              deliveredAt={order?.deliveredAt}
              assignedAt={order?.assignedAt}
            />
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  )
}
