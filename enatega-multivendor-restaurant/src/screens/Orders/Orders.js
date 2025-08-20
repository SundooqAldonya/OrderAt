import {
  View,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Text,
  StyleSheet
} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import styles from './styles'
import { TextError, Spinner, TextDefault } from '../../components'
import { useOrders, useAcceptOrder } from '../../ui/hooks'
import { colors, scale } from '../../utilities'
import { Image } from 'react-native-elements/dist/image/Image'
import { TabBars } from '../../components/TabBars'
import { HomeOrderDetails } from '../../components/HomeOrderDetails'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import i18next from '../../../i18n'
import { QUERY_USERS_MUTATION, searchCustomers } from '../../apollo'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import { auth_token, getAccessToken } from '../../utilities/apiServices'
import { AuthContext, Configuration, Restaurant } from '../../ui/context'
import { Icon } from 'react-native-elements'
import createStyles from './styles'

const { width, height } = Dimensions.get('window')

const Orders = props => {
  const {
    loading,
    error,
    data,
    activeOrders,
    processingOrders,
    deliveredOrders,
    active,
    refetch,
    setActive
  } = useOrders()

  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  )

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height)
    })
    return () => subscription?.remove()
  }, [])

  const navigation = useNavigation()
  const { loading: mutateLoading } = useAcceptOrder()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [search, setSearch] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [searched, setSearched] = useState(false)
  const [errorSearch, setErrorSearch] = useState(false)
  const [digitsError, setDigitsError] = useState(false)
  const [message, setMessage] = useState(false)
  const [customer, setCustomer] = useState(null)

  const [searchMutation] = useMutation(QUERY_USERS_MUTATION, {
    onCompleted: data => {
      console.log({ dataUserSearch: data })
      setCustomer(data.searchUsersByBusiness)
      setSearched(true)
    },
    onError: err => {
      console.log({ err })
      const errorMessage = err?.toString()?.match(/digits_error/)
        ? err?.toString()?.match(/digits_error/)[0]
        : null
      const errorMessage1 = err?.toString()?.match(/no_user_found/)
        ? err?.toString()?.match(/no_user_found/)[0]
        : null
      console.log({ errorMessage })
      if (errorMessage === 'digits_error') {
        setMessage(t(`${errorMessage}`))
        setDigitsError(true)
      }
      if (errorMessage1 === 'no_user_found') {
        setSearched(true)
        setErrorSearch(true)
      }
    }
  })

  const searchingCustomers = () => {
    setDigitsError(false)
    setErrorSearch(false)
    searchMutation({
      variables: {
        searchText: search
      }
    })
  }

  const hideGmail = text => {
    const email = text
    const mail = email.replace(
      /^(.)(.*)(.@gmail\.com)$/,
      (match, firstChar, middle, domain) => {
        return `${firstChar}${'*'.repeat(middle.length)}${domain}`
      }
    )
    console.log(mail)
    return mail
  }

  // const { addressToken, setAddressToken } = useContext(AuthContext)

  const loadAccessToken = async () => {
    await getAccessToken()
      .then(res => (auth_token.auth_token = res.data?.auth_token))
      .catch(res => console.log(res))
  }

  const createOrder = () => {
    setIsVisible(false)
    navigation.navigate('Checkout', { userData: customer })
  }

  useEffect(() => {
    loadAccessToken()
    // console.log(addressToken)
  }, [])

  useEffect(() => {
    console.log('OrdersScreen loaded')
    // if (!loading && data) {
    //   console.log('Orders:', data)
    // }
  }, [loading, data])

  if (error) return <TextError text={error.message} />

  const styles = createStyles(isLandscape)

  return (
    <>
      {mutateLoading ? (
        <Spinner />
      ) : (
        <>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.hamburger}
              onPress={() => navigation.openDrawer()}>
              <View style={styles.line}></View>
              <View style={styles.line}></View>
              <View style={styles.line}></View>
            </TouchableOpacity>
            {!isLandscape ? (
              <Image
                source={require('../../assets/orders.png')}
                PlaceholderContent={<ActivityIndicator />}
                style={{
                  width: isLandscape ? width * 0.4 : width * 0.7,
                  height: isLandscape ? height * 0.25 : height * 0.15,
                  resizeMode: 'contain'
                }}
              />
            ) : (
              <TouchableOpacity
                // onPress={() => setIsVisible(true)}
                onPress={() => navigation.navigate('AddNewOrder')}
                style={{
                  backgroundColor: '#000',
                  marginHorizontal: 16,
                  padding: 10,
                  marginBlock: 10,
                  borderRadius: 10,
                  alignSelf: 'flex-end'
                }}>
                <TextDefault
                  H4
                  style={{ textAlign: 'center' }}
                  bold
                  textColor={colors.green}>
                  {t('createneworder')}
                </TextDefault>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.lowerContainer,
              {
                backgroundColor:
                  active === 0
                    ? colors.green
                    : active === 1
                    ? colors.white
                    : colors.white
              }
            ]}>
            <TabBars
              newAmount={activeOrders}
              processingAmount={processingOrders}
              activeBar={active}
              setActiveBar={setActive}
              refetch={refetch}
              orders={
                data &&
                data.restaurantOrders.filter(
                  order => order.orderStatus === 'PENDING'
                )
              }
            />
            {!isLandscape ? (
              <TouchableOpacity
                // onPress={() => setIsVisible(true)}
                onPress={() => navigation.navigate('AddNewOrder')}
                style={{
                  backgroundColor: '#000',
                  marginHorizontal: 16,
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 10
                }}>
                <TextDefault
                  H4
                  style={{ textAlign: 'center' }}
                  bold
                  textColor={colors.green}>
                  {t('createneworder')}
                </TextDefault>
              </TouchableOpacity>
            ) : null}
            {loading ? (
              <View style={{ marginTop: height * 0.25 }}>
                <Spinner spinnerColor={colors.fontSecondColor} />
              </View>
            ) : (
              <ScrollView style={styles.scrollView}>
                <View style={{ marginBottom: 30 }}>
                  {active === 0 && activeOrders > 0
                    ? data &&
                      data.restaurantOrders
                        .filter(order => order.orderStatus === 'PENDING')
                        .map((order, index) => {
                          return (
                            <HomeOrderDetails
                              key={index}
                              activeBar={active}
                              setActiveBar={setActive}
                              navigation={props.navigation}
                              order={order}
                            />
                          )
                        })
                    : active === 0 && (
                        <View
                          style={{
                            minHeight: height - height * 0.45,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                          <TextDefault H2 bold>
                            {t('unReadOrders')}
                          </TextDefault>
                          <LottieView
                            style={{
                              width: width - 100,
                              height: 250
                            }}
                            source={require('../../assets/loader.json')}
                            autoPlay
                            loop
                          />
                        </View>
                      )}
                  {active === 1 && processingOrders > 0
                    ? data &&
                      data.restaurantOrders
                        .filter(order =>
                          ['ACCEPTED', 'ASSIGNED', 'PICKED'].includes(
                            order.orderStatus
                          )
                        )
                        .map((order, index) => {
                          return (
                            <HomeOrderDetails
                              key={index}
                              activeBar={active}
                              setActiveBar={setActive}
                              navigation={props.navigation}
                              order={order}
                            />
                          )
                        })
                    : active === 1 && (
                        <View
                          style={{
                            minHeight: height - height * 0.45,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                          <TextDefault H2 bold>
                            {t('unReadOrders')}
                          </TextDefault>
                          <LottieView
                            style={{
                              width: width - 100,
                              height: 250
                            }}
                            source={require('../../assets/loader.json')}
                            autoPlay
                            loop
                          />
                        </View>
                      )}
                  {active === 2 && deliveredOrders > 0
                    ? data &&
                      data.restaurantOrders
                        .filter(order => order.orderStatus === 'DELIVERED')
                        .map((order, index) => {
                          return (
                            <HomeOrderDetails
                              key={index}
                              activeBar={active}
                              setActiveBar={setActive}
                              navigation={props.navigation}
                              order={order}
                            />
                          )
                        })
                    : active === 2 && (
                        <View
                          style={{
                            minHeight: height - height * 0.45,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                          <TextDefault H2 bold>
                            {t('unReadOrders')}
                          </TextDefault>
                          <LottieView
                            style={{
                              width: width - 100,
                              height: 250
                            }}
                            source={require('../../assets/loader.json')}
                            autoPlay
                            loop
                          />
                        </View>
                      )}
                </View>
              </ScrollView>
            )}
          </View>
        </>
      )}
      <Modal visible={isVisible} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setIsVisible(false)
            setCustomer(null)
          }}
          style={{
            flex: 1,
            backgroundColor: '#00000050',
            marginBottom: -20
          }}></TouchableOpacity>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.green,
            padding: 16,
            minHeight: 400,
            elevation: 10,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10
          }}>
          <TextDefault
            H3
            bold
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {t('searchcustomer')}
          </TextDefault>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              alignItems: 'center',
              padding: 10,
              borderRadius: 10,
              paddingVertical: 0,
              marginVertical: 10,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}>
            <FontAwesome
              name="search"
              size={scale(20)}
              color={colors.tagColor}
            />
            <TextInput
              keyboardType="phone-pad"
              placeholder={t('searchfromnumber')}
              value={search}
              onChangeText={text => {
                setSearch(text)
                setCustomer(null)
              }}
              style={{ flex: 1, fontSize: scale(16) }}
              placeholderTextColor={'#66666670'}
            />
          </View>
          <View style={{ flex: 1 }}>
            {searched && customer ? (
              <TouchableOpacity
                onPress={createOrder}
                style={{
                  marginVertical: 5,
                  borderRadius: 5,
                  padding: 10,
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                  // height: 300
                }}>
                <View
                  style={{
                    backgroundColor: colors.fontMainColor,
                    borderRadius: 10,
                    width: 30,
                    height: 30,
                    justifyContent: 'center'
                  }}>
                  <FontAwesome
                    name="user"
                    size={20}
                    color={colors.borderColor}
                    style={{ alignSelf: 'center' }}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10 }}>
                  <TextDefault
                    textColor={'#000000'}
                    H5
                    bold
                    style={{ textAlign: isArabic ? 'right' : 'left' }}>
                    {customer.name}
                  </TextDefault>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: scale(5),
                      alignItems: 'center',
                      gap: 5,
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}>
                    <FontAwesome name="phone" size={scale(12)} color={'#333'} />
                    <TextDefault textColor={'#000000'}>
                      {customer.phone}
                    </TextDefault>
                  </View>
                  {customer.email ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        marginTop: scale(3),
                        alignItems: 'center',
                        gap: 5,
                        flexDirection: isArabic ? 'row-reverse' : 'row'
                      }}>
                      <FontAwesome
                        name="envelope"
                        size={scale(12)}
                        color={'#333'}
                      />
                      <TextDefault textColor={'#000000'}>
                        {hideGmail(customer.email)}
                      </TextDefault>
                    </View>
                  ) : null}

                  {customer?.addresses.length
                    ? customer?.addresses?.map((address, index) => (
                        <View
                          key={address._id}
                          style={{
                            flexDirection: 'row',
                            marginTop: 10,
                            alignItems: 'flex-start',
                            gap: 5,
                            flexDirection: isArabic ? 'row-reverse' : 'row'
                          }}>
                          <View
                            style={{
                              height: scale(20),
                              width: scale(20),
                              paddingTop: 5
                            }}>
                            <FontAwesome name="location-arrow" size={22} />
                          </View>
                          <TextDefault style={{ width: '90%' }}>
                            {address.deliveryAddress}
                          </TextDefault>
                        </View>
                      ))
                    : null}
                </View>
              </TouchableOpacity>
            ) : null}

            {digitsError && message ? (
              <View>
                <TextDefault
                  style={{ marginVertical: scale(20), textAlign: 'center' }}
                  H3>
                  {message}
                </TextDefault>
              </View>
            ) : null}

            {!digitsError && searched && errorSearch ? (
              <View>
                <TextDefault
                  style={{ marginVertical: scale(20), textAlign: 'center' }}
                  H3>
                  {t('customernotfound')}
                </TextDefault>
                <TouchableOpacity
                  onPress={() => {
                    setIsVisible(false)
                    const search1 = search
                    setSearch('')
                    setSearched(false)
                    setCustomer(null)
                    navigation.navigate('RegisterUser', { phone: search1 })
                  }}
                  style={{
                    backgroundColor: '#000',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: isArabic ? 'row-reverse' : 'row'
                  }}>
                  <FontAwesome name="user" color={'#fff'} size={scale(20)} />
                  <TextDefault
                    H4
                    bold
                    textColor={'#fff'}
                    style={{ MarginLeft: 10, MarginRight: 10 }}>
                    {t('addnewcustomer')}
                  </TextDefault>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={searchingCustomers}
            style={{
              backgroundColor: '#000',
              padding: 10,
              marginTop: 10,
              borderRadius: 10
            }}>
            <TextDefault
              H4
              style={{ textAlign: 'center' }}
              bold
              textColor={colors.green}>
              {t('searchfromnumber')}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
}

export default Orders
