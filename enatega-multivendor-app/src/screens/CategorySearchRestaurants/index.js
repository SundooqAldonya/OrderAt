import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native'
import { EvilIcons, Ionicons } from '@expo/vector-icons'
import ConfigurationContext from '../../context/Configuration'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useLazyQuery } from '@apollo/client'
import { searchRestaurantsCustomer } from '../../apollo/queries'
import { useLocation } from '../../ui/hooks'
import { LocationContext } from '../../context/Location'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { StarRatingDisplay } from 'react-native-star-rating-widget'
import { moderateScale } from '../../utils/scaling'

const burgers = [
  {
    id: '1',
    name: 'Burger Restaurant',
    restaurant: 'Rose Garden',
    price: 40,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '2',
    name: "Smokin' Restaurant",
    restaurant: 'Cafenio Restaurant',
    price: 60,
    image:
      'https://images.unsplash.com/photo-1614873658551-c89ecc8ac973?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '3',
    name: 'Restaurant Burgers',
    restaurant: 'Kaji Firm Kitchen',
    price: 75,
    image:
      'https://images.unsplash.com/photo-1509710279439-9d856fa07d75?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '4',
    name: 'Bullseye Restaurant',
    restaurant: 'Kabab Restaurant',
    price: 94,
    image:
      'https://images.unsplash.com/photo-1581340387428-daa644fbedb3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
]

const CategorySearchRestaurants = () => {
  const configuration = useContext(ConfigurationContext)
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { location } = useContext(LocationContext)
  const routes = useRoute()
  const { categoryId, categoryName } = routes.params || {}

  const [restaurants, setRestaurants] = useState(null)

  console.log({ categoryId, categoryName })

  const [fetchRestaurants, { data, loading, error }] = useLazyQuery(
    searchRestaurantsCustomer
  )

  console.log({ dataRestaurantsFilter: data, loading, error })
  console.log({ restaurants })

  useEffect(() => {
    if (categoryId) {
      fetchRestaurants({
        variables: {
          businessCategoryId: categoryId,
          latitude: location?.latitude || 25.276987,
          longitude: location?.longitude || 55.296249
        }
      })
    }
  }, [categoryId])

  useEffect(() => {
    if (data?.searchRestaurantsCustomer?.length) {
      setRestaurants(data.searchRestaurantsCustomer)
    }
  }, [data])

  // Render each restaurant item
  const renderItem = ({ item }) => {
    console.log({ itemBusinessCategories: item.businessCategories })
    const businessCategoriesNames =
      (item?.businessCategories || [])
        .map((cat) => cat.name)
        .filter(Boolean)
        .join(', ') || null
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <EvilIcons name='star' size={16} color='black' />
            <Text>{item.reviewAverage}</Text>
          </View>
          <Text
            style={{ ...styles.title, textAlign: isArabic ? 'right' : 'left' }}
          >
            {item.name}
          </Text>
        </View>

        {/* <Text style={styles.subtitle}>{item.restaurant}</Text> */}
        {businessCategoriesNames?.length ? (
          <View>
            <TextDefault
              style={{
                color: '#000',
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {businessCategoriesNames?.substring(0, 20)}...
            </TextDefault>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.metaText}>⏱ {item.deliveryTime}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 5 }}
        >
          <Ionicons name='chevron-back' size={24} color='black' />
        </TouchableOpacity>
        <View style={styles.dropdown}>
          {categoryId ? (
            <Text style={styles.dropdownText}>{categoryName} ⌄</Text>
          ) : (
            <Text style={styles.dropdownText}>BURGER ⌄</Text>
          )}
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
      <Text style={styles.sectionTitle}>
        Popular Restaurants With {categoryName}
      </Text>

      {/* Burger Grid */}
      <FlatList
        data={restaurants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Open Restaurants Example */}
      {/* <Text style={styles.sectionTitle}>Open Restaurants</Text>
      <Image
        source={{ uri: 'https://i.ibb.co/SQ6m8Qd/food-banner.png' }}
        style={styles.banner}
      />
      <Text style={styles.restaurantTitle}>Tasty Treat Gallery</Text> */}
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
  subtitle: { color: '#777', fontSize: 12, marginBottom: 0 },
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

export default CategorySearchRestaurants
