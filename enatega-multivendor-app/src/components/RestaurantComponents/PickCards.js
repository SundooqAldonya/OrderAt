import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const PickCards = ({ item }) => {
  return (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.foodImage} />
      {item.topRated && <Text style={styles.topRated}>Top rated</Text>}
      <Text style={styles.foodTitle}>{item.title}</Text>
      <Text style={styles.foodPrice}>{item.price}</Text>
    </View>
  )
}

export default PickCards

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: 8,
    alignItems: 'center'
  },
  foodImage: {
    width: 150,
    height: 100,
    borderRadius: 8
  },
  foodTitle: {
    fontWeight: '600',
    marginTop: 8
  },
  foodPrice: {
    color: '#555',
    marginTop: 4
  },
  topRated: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#ffa726',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12
  }
})
