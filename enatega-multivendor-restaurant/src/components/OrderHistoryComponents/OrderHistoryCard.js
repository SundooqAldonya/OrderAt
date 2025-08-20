import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Configuration } from '../../ui/context'
import { callNumber } from '../../utilities/callNumber'

const OrderHistoryCard = ({ item }) => {
  const configuration = useContext(Configuration.Context)

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.customer}>{item.customer}</Text>
        <Text style={styles.total}>
          {configuration.currency} {item.total.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.meta}>
        {item.orderId} • {item.items} {item.items > 1 ? 'items' : 'item'}
      </Text>

      <View style={styles.row}>
        <Text style={styles.status}>{item.status}</Text>
        <View style={styles.icons}>
          {item.eta && <Text style={styles.eta}>{item.eta}</Text>}
          {item.date && <Text style={styles.eta}>{item.date}</Text>}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => callNumber(item.phone)}>
            <MaterialIcons name="phone" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default OrderHistoryCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  customer: {
    fontSize: 15,
    fontWeight: '600'
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000'
  },
  meta: {
    fontSize: 13,
    color: '#777',
    marginVertical: 4
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444'
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  eta: {
    fontSize: 12,
    color: '#666',
    marginRight: 8
  },
  iconBtn: {
    padding: 4
  }
})
