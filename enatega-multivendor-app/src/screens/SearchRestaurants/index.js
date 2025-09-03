import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const burgers = [
  {
    id: '1',
    name: 'Burger Bistro',
    restaurant: 'Rose Garden',
    price: 40,
    image: 'https://i.ibb.co/5nR0L7K/burger1.png'
  },
  {
    id: '2',
    name: "Smokin' Burger",
    restaurant: 'Cafenio Restaurant',
    price: 60,
    image: 'https://i.ibb.co/7X8mQf2/burger2.png'
  },
  {
    id: '3',
    name: 'Buffalo Burgers',
    restaurant: 'Kaji Firm Kitchen',
    price: 75,
    image: 'https://i.ibb.co/D5yV1F6/burger3.png'
  },
  {
    id: '4',
    name: 'Bullseye Burgers',
    restaurant: 'Kabab Restaurant',
    price: 94,
    image: 'https://i.ibb.co/8dZfMZc/burger4.png'
  }
]

const SearchRestaurants = () => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.restaurant}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>${item.price}</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name='add' size={20} color='white' />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name='chevron-back' size={24} color='black' />
        <View style={styles.dropdown}>
          <Text style={styles.dropdownText}>BURGER ⌄</Text>
        </View>
        <Ionicons
          name='search'
          size={24}
          color='black'
          style={{ marginLeft: 'auto', marginRight: 15 }}
        />
        <Ionicons name='options-outline' size={24} color='black' />
      </View>

      {/* Title */}
      <Text style={styles.sectionTitle}>Popular Burgers</Text>

      {/* Burger Grid */}
      <FlatList
        data={burgers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Open Restaurants Example */}
      <Text style={styles.sectionTitle}>Open Restaurants</Text>
      <Image
        source={{ uri: 'https://i.ibb.co/SQ6m8Qd/food-banner.png' }}
        style={styles.banner}
      />
      <Text style={styles.restaurantTitle}>Tasty Treat Gallery</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dropdown: {
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10
  },
  dropdownText: { fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginVertical: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    flex: 0.48,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3
  },
  image: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  title: { fontWeight: '700', fontSize: 14 },
  subtitle: { color: '#777', fontSize: 12, marginBottom: 5 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: { fontWeight: '700', fontSize: 14 },
  addBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    padding: 6
  },
  banner: { width: '100%', height: 120, borderRadius: 12, marginVertical: 10 },
  restaurantTitle: { fontWeight: '700', fontSize: 16 }
})

export default SearchRestaurants
