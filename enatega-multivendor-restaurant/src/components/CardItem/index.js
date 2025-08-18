import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import FoodPlaceholderImage from '../../assets/food_placeholder.jpeg'

const { width } = Dimensions.get('window')

const CardItem = ({ item }) => {
  const navigation = useNavigation()
  const cheapestVariation = item.variations.reduce(
    (min, v) => (v.price < min.price ? v : min),
    item.variations[0]
  )

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.main}
        onPress={() => navigation.navigate('FoodDetail', { food: item })}>
        <Image
          source={item?.image ? { uri: item.image } : FoodPlaceholderImage}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.category}>{item.category?.title}</Text>
          <View style={styles.priceRow}>
            {cheapestVariation.discounted ? (
              <>
                <Text style={styles.discounted}>
                  ${cheapestVariation.discounted.toFixed(2)}
                </Text>
                <Text style={styles.original}>
                  ${cheapestVariation.price.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={styles.price}>
                ${cheapestVariation.price.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default CardItem

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden'
  },
  main: {
    flexDirection: 'row',
    flex: 1
  },
  image: {
    width: width * 0.3,
    height: width * 0.3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  category: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333'
  },
  discounted: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E53935',
    marginRight: 8
  },
  original: {
    fontSize: 13,
    color: '#888',
    textDecorationLine: 'line-through'
  }
})
