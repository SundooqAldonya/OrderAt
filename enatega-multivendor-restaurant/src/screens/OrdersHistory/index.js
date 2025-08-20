import React, { useState } from 'react'
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'
import OrderHistoryCard from '../../components/OrderHistoryComponents/OrderHistoryCard'
import { useOrders } from '../../ui/hooks'
import moment from 'moment'
import { colors } from '../../utilities'
import { Calendar } from 'react-native-calendars'
import { eachDayOfInterval, format } from 'date-fns'
import { useQuery } from '@apollo/client'
import { restaurantOrdersHistory } from '../../apollo'

export default function OrderHistory() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  let today = new Date()
  const [showPicker1, setShowPicker1] = useState(false)
  const [date1UI, setDate1UI] = useState(null)
  const [date2UI, setDate2UI] = useState(null)

  // const {
  //   loading,
  //   error,
  //   data,
  //   activeOrders,
  //   processingOrders,
  //   deliveredOrders,
  //   active,
  //   refetch,
  //   setActive
  // } = useOrders()

  const { data, loading, error } = useQuery(restaurantOrdersHistory, {
    variables: {
      startDate: date1UI,
      endDate: date2UI
    },
    pollInterval: 10000
  })

  console.log({ data })

  const orders = React.useMemo(() => {
    if (!data?.restaurantOrdersHistory) return []

    // Group orders into sections
    const inProgress = data?.restaurantOrdersHistory?.filter(order =>
      ['ACCEPTED', 'ASSIGNED', 'PICKED'].includes(order.orderStatus)
    )

    const completed = data?.restaurantOrdersHistory.filter(
      order => order.orderStatus === 'DELIVERED'
    )

    return [
      {
        title: 'Delivery in progress',
        data: inProgress?.map(o => ({
          orderId: o.orderId || o._id,
          customer: o.user?.name || 'Unknown',
          total: o.paidAmount || o.orderAmount,
          items: o.items?.length || 0,
          status: 'Delivery in progress',
          phone: o.user.phone || null,
          eta: o.preparationTime
            ? `Est. delivery ${moment(o.createdAt)
                .add(o.preparationTime, 'minutes')
                .format('h:mm a')}`
            : null
        }))
      },
      {
        title: 'Completed',
        data: completed?.map(o => ({
          orderId: o.orderId || o._id,
          customer: o.user?.name ?? 'Unknown',
          total: o.paidAmount || o.orderAmount,
          items: o.items?.length ?? 0,
          status: 'Delivered',
          phone: o.user.phone || null,
          date: moment(o.deliveredAt || o.orderDate).format(
            'D MMM YYYY, h:mm a'
          )
        }))
      }
    ]
  }, [data])

  const getMarkedDates = () => {
    let marked = {}

    if (date1UI && date2UI) {
      const range = eachDayOfInterval({
        start: new Date(date1UI),
        end: new Date(date2UI)
      })

      range.forEach((day, i) => {
        const date = format(day, 'yyyy-MM-dd')
        if (i === 0) {
          marked[date] = {
            startingDay: true,
            color: 'blue',
            textColor: 'white'
          }
        } else if (i === range.length - 1) {
          marked[date] = {
            endingDay: true,
            color: 'blue',
            textColor: 'white'
          }
        } else {
          marked[date] = { color: '#a3c9f9', textColor: 'white' }
        }
      })
    } else if (date1UI) {
      marked[date1UI] = { selected: true, color: 'blue', textColor: 'white' }
    }

    return marked
  }

  const handleDayPress = day => {
    if (!date1UI || (date1UI && date2UI)) {
      // start a new range
      setDate1UI(day.dateString)
      setDate2UI(null)
    } else if (!date2UI) {
      // end date
      if (new Date(day.dateString) < new Date(date1UI)) {
        // if tapped before start date, swap
        setDate2UI(date1UI)
        setDate1UI(day.dateString)
      } else {
        setDate2UI(day.dateString)
      }
    }
  }

  const renderItems = ({ item }) => {
    return <OrderHistoryCard item={item} />
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Date and Filters */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerDate}>{t('orders_history')}</Text>
      </View>
      <View style={styles.headerRow}>
        {!date1UI && !date2UI ? (
          <TouchableOpacity onPress={() => setShowPicker1(true)}>
            <Text style={styles.headerDate}>
              {moment().format('D MMM YYYY')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setShowPicker1(true)}>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {`${moment(date1UI).format('D MMM YYYY')}`}
              </Text>
            </TouchableOpacity>
            <Text> - </Text>
            <TouchableOpacity onPress={() => setShowPicker1(true)}>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {`${moment(date2UI).format('D MMM YYYY')}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.headerFilter}>All orders</Text>
      </View>
      <Modal visible={showPicker1} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              marginHorizontal: 10
            }}>
            <Calendar
              markingType="period"
              onDayPress={handleDayPress}
              markedDates={getMarkedDates()}
            />
            <TouchableOpacity
              onPress={() => {
                setShowPicker1(false)
              }}
              style={{
                marginTop: 20,
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Orders grouped by status */}
      <SectionList
        sections={orders}
        keyExtractor={item => item.orderId}
        renderSectionHeader={({ section: { title, data } }) => (
          <Text style={styles.sectionHeader}>
            {title} {data?.length}
          </Text>
        )}
        renderItem={renderItems}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 12
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerDate: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  headerFilter: {
    fontSize: 14,
    color: '#555'
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 6
  }
})
