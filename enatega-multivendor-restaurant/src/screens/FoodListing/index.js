import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput
} from 'react-native'
import { useQuery } from '@apollo/client'
import { getFoodListByRestaurant } from '../../apollo'
import { useAccount } from '../../ui/hooks'
import { SafeAreaView } from 'react-native-safe-area-context'
import CardItem from '../../components/CardItem'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'

const stockFilters = [
  { id: 'all', label: 'All Items' },
  { id: 'in', label: 'In Stock' },
  { id: 'low', label: 'Low Stock' },
  { id: 'out', label: 'Out of Stock' }
]

const FoodListing = () => {
  const navigation = useNavigation()
  const { data: dataRestaurant } = useAccount()
  const { t } = useTranslation()
  const [items, setItems] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('all')

  const { loading, error, data } = useQuery(getFoodListByRestaurant, {
    variables: { id: dataRestaurant?.restaurant?._id },
    skip: !dataRestaurant,
    pollInterval: 10000
  })

  useEffect(() => {
    if (data) {
      setItems(data?.foodListByRestaurant)
    }
  }, [data])

  const filteredData = useMemo(() => {
    if (!items) return []
    if (!search.trim()) return items
    return items.filter(food =>
      food.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  const handleSelectStock = ({ item }) => {
    console.log({ item })
    setSelected(item.id)
    if (data) {
      console.log({ data: data?.foodListByRestaurant })
      if (item.id === 'all') {
        setItems(data?.foodListByRestaurant)
        return
      }
      const filtered = data?.foodListByRestaurant?.filter(
        food => food.stock === item.label
      )
      console.log({ filtered })
      setItems([...filtered])
    }
  }

  if (loading) return <Text style={styles.loader}>Loading...</Text>
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>

  const renderItem = ({ item }) => {
    return <CardItem key={item._id} item={item} />
  }

  return (
    <SafeAreaView>
      {/* Top title */}
      <View style={styles.top}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginTop: 10,
              marginInlineStart: 18
            }}>
            <AntDesign name="arrowleft" size={30} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 18,
            marginInlineStart: 18,
            marginTop: 15,
            fontWeight: 'bold'
          }}>
          {dataRestaurant?.restaurant.name} {t('products')}
        </Text>
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="#888" />
        <TextInput
          placeholder={t('search')}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={'#888'}
        />
      </View>

      {/* selection of stock */}
      <View style={styles.stockContainer}>
        <FlatList
          horizontal
          data={stockFilters}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.stockButton,
                selected === item.id && styles.activeStockButton
              ]}
              onPress={() => handleSelectStock({ item })}>
              <Text style={[styles.stockBtnText]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Food listing */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 150 }} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    gap: 5
  },
  list: {
    padding: 16,
    paddingBottom: 50
  },
  loader: {
    textAlign: 'center',
    marginTop: 50
  },
  error: {
    textAlign: 'center',
    color: 'red',
    marginTop: 50
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15
  },
  stockContainer: {
    marginStart: 18,
    paddingBottom: 10
  },
  stockButton: {
    backgroundColor: '#888',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  stockBtnText: {
    color: '#fff'
  },
  activeStockButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  }
})
export default FoodListing
