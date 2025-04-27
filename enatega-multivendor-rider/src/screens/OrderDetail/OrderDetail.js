import {
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import styles from './styles'
import colors from '../../utilities/colors'
import Status from '../../components/OrderDetail/Status/Status'
import Details from '../../components/OrderDetail/Details/Details'
import useOrderDetail from './useOrderDetail'
import MapViewOrderDetails from '../../components/MapViewOrderDetails'

const OrderDetail = () => {
  const {
    distance,
    duration,
    order,
    route,
    navigation,
    orderID
  } = useOrderDetail()

  console.log({ order })

  return (
    <SafeAreaView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ ...styles.container, paddingTop: 50 }}>
        {/* <MapViewOrderDetails /> */}
        <View style={styles.iconView}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="chevron-back"
            size={26}
            color={colors.white}
            style={styles.icon}
          />
        </View>

        <View style={styles.status}>
          <Status
            orderData={route.params?.order}
            itemId={orderID}
            pickedAt={order?.pickedAt}
            deliveredAt={order?.deliveredAt}
            assignedAt={order?.assignedAt}
          />
        </View>
        <View>
          <Details
            orderData={route.params?.order}
            itemId={orderID}
            distance={distance}
            duration={duration}
            navigation={navigation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default OrderDetail
