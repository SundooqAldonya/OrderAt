import { View, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native'
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
const { width, height } = Dimensions.get('window')
import i18next from '../../../i18n'
import { searchCustomers } from '../../apollo'
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import { auth_token, getAccessToken } from '../../utilities/apiServices'
import { AuthContext, Configuration, Restaurant } from '../../ui/context'
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
  const client = useApolloClient()
  const navigation = useNavigation()
  const { loading: mutateLoading } = useAcceptOrder()
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState({})
  const QUERY_USERS = gql`
  query SearchUsers($searchText: String!) {
    search_users(search: $searchText) {
    _id
    name
    email
    phone
    userType
    isActive
    notificationToken
    isOrderNotification
    isOfferNotification
    addresses {
      _id
      deliveryAddress
      details
      label
      selected
    }
    favourite
    createdAt
    updatedAt
    }
  }
`;
  const customerData = useQuery(QUERY_USERS, {
    variables: { searchText: search },
  });
  const searchingCustomers = async () => {
    setShowResults(true)
    try {

      console.log(customerData.data);
      setCustomers(customerData?.data?.search_users ?? [])
      return customerData;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  const hideGmail = (text) => {
    const email = text;
    const mail = email.replace(/^(.)(.*)(.@gmail\.com)$/, (match, firstChar, middle, domain) => {
      return `${firstChar}${'*'.repeat(middle.length)}${domain}`;
    });
    console.log(mail)
    return mail
  }
  const { addressToken,
    setAddressToken } = useContext(AuthContext);
  const loadAccessToken = async () => {
    await getAccessToken().then(res => auth_token.auth_token = res.data?.auth_token).catch(res => console.log(res))
  }
  const createOrder = () => {
    setIsVisible(false);

    navigation.navigate('Checkout', { userData: selectedCustomer })
  }
  useEffect(() => {
    loadAccessToken()
    console.log(addressToken)
  }, [])

  useEffect(() => {
    console.log('OrdersScreen loaded')
    if (!loading && data) {
      console.log('Orders:', data)
    }
  }, [loading, data])
  if (error) return <TextError text={error.message} />
  return (
    <>
      {mutateLoading ? (
        <Spinner />
      ) : (
        <>
          <View style={styles.topContainer}>
            <Image
              source={require('../../assets/orders.png')}
              PlaceholderContent={<ActivityIndicator />}
              style={{ width: 250, height: 100 }}
            />
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
            <TouchableOpacity onPress={() => setIsVisible(true)} style={{ backgroundColor: "#000", marginHorizontal: 16, padding: 10, marginTop: 10, borderRadius: 10 }}><TextDefault H4 style={{ textAlign: 'center' }} bold textColor={colors.green}>Create New Order</TextDefault></TouchableOpacity>
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
      <Modal visible={isVisible} transparent animationType='slide'>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(false)} style={{ flex: 1, backgroundColor: "#00000050", marginBottom: -20 }} ></TouchableOpacity>
        <View style={{ flex: 1, backgroundColor: colors.green, padding: 16, minHeight: 400, elevation: 10, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
          <TextDefault H3 bold>Search Customer</TextDefault>
          <View style={{ flexDirection: 'row', backgroundColor: '#fff', alignItems: 'center', padding: 10, borderRadius: 10, paddingVertical: 0, marginVertical: 10 }}>
            <FontAwesome name='search' size={scale(20)} color={colors.tagColor} />
            <TextInput keyboardType='number-pad' placeholder='Search from number' value={search} onChangeText={(text) => {
              setSearch(text)
              setShowResults(false)
              setCustomers([])
            }} style={{ flex: 1, fontSize: scale(16) }} placeholderTextColor={'#66666670'} />
          </View>
          <View style={{ flex: 1 }}>

            <FlatList
              ListEmptyComponent={
                showResults && <View >
                  <TextDefault style={{ marginVertical: scale(20), textAlign: 'center' }} H3>Customer Not Found</TextDefault>
                  <TouchableOpacity onPress={() => {
                    setIsVisible(false);
                    const search1 = search;
                    setSearch('')
                    setShowResults(false)
                    setCustomers([])
                    navigation.navigate("RegisterUser", { phone: search1 })
                  }} style={{ backgroundColor: "#000", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 10, borderRadius: 10 }}>
                    <FontAwesome name='user' color={'#fff'} size={scale(20)} />
                    <TextDefault H4 bold textColor={"#fff"} style={{ marginLeft: 10 }} >Add new customer</TextDefault></TouchableOpacity>
                </View>
              }
              data={customers}
              ListHeaderComponent={showResults && <TextDefault H5 bold>Results for "{search}"</TextDefault>}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCustomer(item)
                      console.log(item)
                    }}
                    key={item.id + index} style={{ marginVertical: 5, borderRadius: 5, padding: 10, backgroundColor: "#fff", flexDirection: 'row', alignItems: 'center', borderWidth: selectedCustomer?.phone === item?.phone ? 2 : 0 }}>
                    <View style={{ backgroundColor: colors.fontMainColor, borderRadius: 10, width: 30, height: 30, justifyContent: 'center' }}>
                      <FontAwesome name='user' size={20} color={colors.borderColor} style={{ alignSelf: 'center' }} />
                    </View>
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <TextDefault textColor={"#000000"} H5 bold >{item.name}</TextDefault>
                      <View style={{ flexDirection: 'row', marginTop: scale(5), alignItems: 'center', gap: 5 }}>
                        <FontAwesome name='phone' size={scale(12)} color={"#333"} />
                        <TextDefault textColor={"#000000"}  >{item.phone}</TextDefault>
                      </View>
                      {item.email && <View style={{ flexDirection: 'row', flex: 1, marginTop: scale(3), alignItems: 'center', gap: 5 }}>
                        <FontAwesome name='envelope' size={scale(12)} color={"#333"} />
                        <TextDefault textColor={"#000000"}    >{hideGmail(item.email)}</TextDefault>
                      </View>}
                      {item?.addresses?.map((address, index) => (
                        <View style={{ flex:1,flexDirection: 'row', marginTop: scale(3), alignItems: 'flex-start', gap: 5 }}>
                          <View style={{height:scale(20), width:scale(20), paddingTop:5}}>
                            <FontAwesome name='location-arrow' size={scale(18)} />
                          </View>
                          <TextDefault style={{flex:1}}>
                            {address.deliveryAddress}
                          </TextDefault>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          </View>
          {selectedCustomer?.name &&
            <TouchableOpacity onPress={createOrder} style={{ backgroundColor: "#fff", borderWidth: 2, padding: 10, marginTop: 10, borderRadius: 10 }}><TextDefault H4 style={{ textAlign: 'center' }} bold textColor={"#000"}>Continue</TextDefault></TouchableOpacity>
          }
          <TouchableOpacity onPress={searchingCustomers} style={{ backgroundColor: "#000", padding: 10, marginTop: 10, borderRadius: 10 }}><TextDefault H4 style={{ textAlign: 'center' }} bold textColor={colors.green}>Search Customer</TextDefault></TouchableOpacity>

        </View>
      </Modal>
    </>
  )
}

export default Orders
