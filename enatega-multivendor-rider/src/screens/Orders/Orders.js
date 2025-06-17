import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  AppState,
  InteractionManager
} from 'react-native'
import { useContext, useState, useEffect, useRef, useCallback } from 'react'
import ScreenBackground from '../../components/ScreenBackground/ScreenBackground'
import styles from './style'
import Tabs from '../../components/Tabs/Tabs'
import Order from '../../components/Order/Order'
import { TabsContext } from '../../context/tabs'
import { useFocusEffect } from '@react-navigation/native'
import ConfigurationContext from '../../context/configuration'
import UserContext from '../../context/user'
import Spinner from '../../components/Spinner/Spinner'
import TextError from '../../components/Text/TextError/TextError'
import LottieView from 'lottie-react-native'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import colors from '../../utilities/colors'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import { orderSeenByRider } from '../../apollo/mutations'

const { height, width } = Dimensions.get('window')
const Orders = ({ navigation }) => {
  const { t } = useTranslation()
  const [riderIsActive, setRiderIsActive] = useState(false)
  const appState = useRef(AppState.currentState)
  const [isMounted, setIsMounted] = useState(false)

  const { setActive } = useContext(TabsContext)
  const configuration = useContext(ConfigurationContext)
  const {
    loadingProfile,
    errorProfile,
    dataProfile,
    loadingAssigned,
    errorAssigned,
    assignedOrders,
    refetchAssigned,
    networkStatusAssigned
  } = useContext(UserContext)

  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (assignedOrders) {
      setOrders(
        assignedOrders.length > 0
          ? assignedOrders.filter(
              o =>
                ['PICKED', 'ACCEPTED', 'DELIVERED', 'ASSIGNED'].includes(
                  o?.orderStatus
                ) &&
                o?.rider &&
                dataProfile?.rider?._id === o?.rider?._id
            )
          : []
      )
    }
  }, [assignedOrders])

  useFocusEffect(() => {
    setActive('MyOrders')
  })

  // useEffect(() => {
  //   const subscription = AppState.addEventListener(
  //     'change',
  //     async nextAppState => {
  //       if (
  //         appState.current.match(/inactive|background/) &&
  //         nextAppState === 'active'
  //       ) {
  //         try {
  //           const result = await refetchAssigned()

  //           if (result?.data?.assignedOrders) {
  //             const filtered = updateOrders(result.data.assignedOrders)

  //             // ✅ This guarantees it runs on the UI thread
  //             setTimeout(() => {
  //               setOrders(filtered)
  //             }, 0)
  //           }
  //         } catch (err) {
  //           console.error('Failed to refetch on app resume', err)
  //         }
  //       }

  //       appState.current = nextAppState
  //     }
  //   )

  //   return () => {
  //     subscription.remove()
  //   }
  // }, [refetchAssigned, dataProfile?.rider?._id])

  // useFocusEffect(
  //   useCallback(() => {
  //     let isActive = true
  //     refetchAssigned().then(result => {
  //       if (result?.data?.assignedOrders && isActive) {
  //         const filtered = updateOrders(result.data.assignedOrders)
  //         setTimeout(() => {
  //           setOrders(filtered)
  //         }, 0)
  //       }
  //     })
  //     return () => {
  //       isActive = false
  //     }
  //   }, [dataProfile?.rider?._id])
  // )

  useEffect(() => {
    if (dataProfile) {
      setRiderIsActive(dataProfile?.rider?.isActive)
    }
  }, [dataProfile, riderIsActive])

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0)
  }, [])

  const updateOrders = rawOrders => {
    if (!dataProfile?.rider?._id) return []
    const filtered = rawOrders.filter(
      o =>
        ['PICKED', 'ACCEPTED', 'DELIVERED', 'ASSIGNED'].includes(
          o?.orderStatus
        ) &&
        o?.rider &&
        dataProfile?.rider?._id === o?.rider?._id
    )
    InteractionManager.runAfterInteractions(() => {
      setOrders(filtered)
    })
  }

  return (
    <ScreenBackground>
      <View style={styles.innerContainer}>
        <View>
          <Tabs navigation={navigation} riderIsActive={riderIsActive} />
        </View>
        {!riderIsActive ? (
          <View>
            <TextDefault
              bold
              center
              H3
              textColor={colors.fontSecondColor}
              style={{
                marginTop: 100
              }}>
              {t('inactive_screen_message')}
            </TextDefault>
            <TouchableOpacity style={styles.btn} onPress={() => logout()}>
              <TextDefault style={styles.btnText}>
                {t('titleLogout')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        ) : (riderIsActive && loadingProfile) || loadingAssigned ? (
          <View style={styles.margin500}>
            <Spinner />
          </View>
        ) : errorProfile || errorAssigned ? (
          <View style={styles.margin500}>
            <TextError text={t('errorText')} />
          </View>
        ) : orders.length > 0 ? (
          <FlatList
            style={styles.ordersContainer}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
            keyExtractor={item => item._id}
            data={orders.sort((a, b) => {
              const order = ['DELIVERED', 'PICKED', 'ACCEPTED', 'ASSIGNED']
              if (
                a.orderStatus === b.orderStatus &&
                order.includes(a.orderStatus)
              ) {
                return a.orderStatus - b.orderStatus
              } else {
                return (
                  order.indexOf(b.orderStatus) - order.indexOf(a.orderStatus)
                )
              }
            })}
            showsVerticalScrollIndicator={false}
            refreshing={networkStatusAssigned === 4}
            onRefresh={refetchAssigned}
            renderItem={({ item }) => (
              <Order
                order={item}
                alwaysShow={true}
                key={item._id}
                id={item._id}
                orderAmount={`${configuration.currencySymbol}${item.orderAmount}`}
              />
            )}
          />
        ) : (
          <View
            style={{
              minHeight:
                height > 670 ? height - height * 0.5 : height - height * 0.6,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            {isMounted && (
              <LottieView
                style={{
                  width: width - 100,
                  height: 250
                }}
                source={require('../../assets/loader.json')}
                autoPlay
                loop
              />
            )}
            <TextDefault bolder center H3 textColor={colors.fontSecondColor}>
              {t('notAnyOrdersYet')}
            </TextDefault>
          </View>
        )}
      </View>
    </ScreenBackground>
  )
}

export default Orders
