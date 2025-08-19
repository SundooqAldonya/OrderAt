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
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker'
import dayjs from 'dayjs'

export default function OrderHistory() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [showPicker, setShowPicker] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: dayjs(),
    endDate: dayjs().add(5, 'day')
  })
  const defaultStyles = useDefaultStyles()

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

  console.log({ activeOrders })

  const orders = React.useMemo(() => {
    if (!data?.restaurantOrders) return []

    // Group orders into sections
    const inProgress = data?.restaurantOrders?.filter(order =>
      ['ACCEPTED', 'ASSIGNED', 'PICKED'].includes(order.orderStatus)
    )

    const completed = data.restaurantOrders.filter(
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
          date: moment(o.deliveredAt || o.orderDate).format(
            'D MMM YYYY, h:mm a'
          )
        }))
      }
    ]
  }, [data])

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
        {/* <Text style={styles.headerDate}>5 July 2025</Text> */}
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            {dateRange.startDate && dateRange.endDate
              ? `${moment(dateRange.startDate).format('D MMM YYYY')} - ${moment(
                  dateRange.endDate
                ).format('D MMM YYYY')}`
              : 'Select Date Range'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerFilter}>All orders</Text>
      </View>
      <Modal visible={showPicker} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
          <View
            style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
            <DateTimePicker
              mode="range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              selected={
                dateRange.startDate && dateRange.endDate
                  ? {
                      startDate: dateRange.startDate,
                      endDate: dateRange.endDate
                    }
                  : null
              }
              calendarTextStyle={{ color: '#222' }} // all labels (days/months/years)
              weekDaysTextStyle={{ color: '#666' }} // Su Mo Tu...
              headerTextStyle={{ color: '#111', fontWeight: '700' }} // Month/Year
              dayContainerStyle={{ borderRadius: 8 }} // round day cells
              todayContainerStyle={{
                borderWidth: 1,
                borderColor: '#2e7d32',
                borderRadius: 8
              }}
              todayTextStyle={{ color: '#2e7d32' }}
              selectedItemColor="#2e7d32" // start & end day background
              selectedTextStyle={{ color: '#fff', fontWeight: '700' }}
              selectedRangeBackgroundColor="#e8f5e9"
              selectedRangeTextStyle={{ color: '#2e7d32' }}
              disabledTextStyle={{ color: '#aaa' }}
              onChange={({ startDate, endDate }) =>
                setDateRange({ startDate, endDate })
              }
            />

            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={{
                marginTop: 20,
                backgroundColor: '#6200ee',
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
