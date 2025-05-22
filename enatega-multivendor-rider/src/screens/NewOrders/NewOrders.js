import { View, FlatList, Dimensions, TouchableOpacity } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
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
import { NetworkStatus, useMutation } from '@apollo/client'
import i18next from '../../../i18next'
import { useTranslation } from 'react-i18next'
import useSidebar from '../../components/Sidebar/useSidebar'
import { orderSeenByRider } from '../../apollo/mutations'
import { useRef } from 'react'

const { height, width } = Dimensions.get('window')

const NewOrders = ({ navigation }) => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [riderIsActive, setRiderIsActive] = useState(false)
  const { setActive } = useContext(TabsContext)
  const configuration = useContext(ConfigurationContext)
  const {
    loadingAssigned,
    errorAssigned,
    assignedOrders,
    refetchAssigned,
    networkStatusAssigned,
    dataProfile
  } = useContext(UserContext)

  const { logout, isEnabled, toggleSwitch, datas } = useSidebar()

  const [mutateSeen] = useMutation(orderSeenByRider, {
    onCompleted: res => {
      console.log({ res })
    },
    onError: err => {
      console.log({ err })
    }
  })
  const riderIdRef = useRef()

  useEffect(() => {
    riderIdRef.current = dataProfile?.rider?._id
  }, [dataProfile?.rider?._id])

  useFocusEffect(() => {
    setActive('NewOrders')
  })

  useEffect(() => {
    if (assignedOrders) {
      setOrders(
        assignedOrders.filter(
          order =>
            order?.orderStatus === 'ACCEPTED' &&
            !order?.rider &&
            !order?.isPickedUp
        )
      )
    }
  }, [assignedOrders])

  useEffect(() => {
    if (dataProfile) {
      setRiderIsActive(dataProfile?.rider?.isActive)
    }
  }, [dataProfile, riderIsActive])

  console.log({ riderIsActive })

  const noNewOrders = orders.length === 0
  useEffect(() => {
    // Trigger refetch when orders length changes
    if (noNewOrders) {
      // if true refetch new order
      refetchAssigned()
    }
  }, [noNewOrders])

  const seenOrders = useRef(new Set())

  console.log({ seenOrders })

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    viewableItems.forEach(viewToken => {
      const item = viewToken.item
      if (!seenOrders.current.has(item._id)) {
        seenOrders.current.add(item._id)
        setTimeout(() => {
          mutateSeen({
            variables: { id: item._id, riderId: riderIdRef.current }
          })
        }, 1000)
      }
    })
  }).current

  return (
    <ScreenBackground>
      <View style={styles.innerContainer}>
        <View>
          <Tabs navigation={navigation} riderIsActive={riderIsActive} />
        </View>
        {loadingAssigned && (
          <View style={styles.margin500}>
            <Spinner />
          </View>
        )}
        {errorAssigned && (
          <View style={styles.margin500}>
            <TextError text={t('errorText')} />
          </View>
        )}
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
        ) : riderIsActive && isEnabled && dataProfile?.rider ? (
          <FlatList
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    minHeight:
                      height > 670
                        ? height - height * 0.5
                        : height - height * 0.6,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <LottieView
                    style={{
                      width: width - 100,
                      height: 250
                    }}
                    source={require('../../assets/loader.json')}
                    autoPlay
                    loop
                  />

                  {noNewOrders ? (
                    <TextDefault
                      bold
                      center
                      H3
                      textColor={colors.fontSecondColor}>
                      {t('noNewOrders')}
                    </TextDefault>
                  ) : (
                    <TextDefault
                      bold
                      center
                      H3
                      textColor={colors.fontSecondColor}>
                      {t('pullToRefresh')}
                    </TextDefault>
                  )}
                </View>
              )
            }}
            style={styles.ordersContainer}
            keyExtractor={item => item._id}
            data={orders}
            showsVerticalScrollIndicator={false}
            refreshing={networkStatusAssigned === NetworkStatus.loading}
            onRefresh={refetchAssigned}
            renderItem={({ item }) => (
              <Order
                order={item}
                key={item._id}
                id={item._id}
                orderAmount={`${configuration.currencySymbol}${item.orderAmount}`}
              />
            )}
          />
        ) : (
          <TextDefault
            bold
            center
            H3
            textColor={colors.fontSecondColor}
            style={{
              marginTop: 100
            }}>
            {t('turnOnAvailability')}
          </TextDefault>
        )}
      </View>
    </ScreenBackground>
  )
}

export default NewOrders
