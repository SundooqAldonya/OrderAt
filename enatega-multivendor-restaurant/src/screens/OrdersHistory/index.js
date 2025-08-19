import React from 'react'
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'
import OrderHistoryCard from '../../components/OrderHistoryComponents/OrderHistoryCard'

const orders = [
  {
    title: 'Delivery in progress',
    data: [
      {
        id: '77C3B',
        customer: 'Moataz E.',
        total: 145.45,
        items: 2,
        status: 'Delivery in progress',
        eta: 'Est. delivery 7:12 pm'
      }
    ]
  },
  {
    title: 'Completed',
    data: [
      {
        id: '1DB51',
        customer: 'Melissa M.',
        total: 26.0,
        items: 1,
        status: 'Delivered',
        date: '5 July 2025, 7:04 pm'
      }
    ]
  }
]

export default function OrderHistory() {
  const { t } = useTranslation()
  const navigation = useNavigation()

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
        <Text style={styles.headerDate}>5 July 2025</Text>
        <Text style={styles.headerFilter}>All orders</Text>
      </View>

      {/* Orders grouped by status */}
      <SectionList
        sections={orders}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
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
