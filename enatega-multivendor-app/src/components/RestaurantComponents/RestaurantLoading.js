import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SkeletonBox from '../SkeletonBox'

const RestaurantLoading = () => {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Restaurant Header Skeleton */}
      <SkeletonBox height={180} width='100%' />

      {/* Categories Skeleton */}
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        {[...Array(4)].map((_, index) => (
          <SkeletonBox
            key={index}
            height={40}
            width={80}
            style={{ marginRight: 12 }}
          />
        ))}
      </View>

      {/* Food Items Skeleton (2 columns) */}
      <View style={styles.foodSkeletonContainer}>
        {[...Array(6)].map((_, index) => (
          <SkeletonBox
            key={index}
            height={180}
            width='47%'
            style={{
              marginBottom: 16,
              marginRight: index % 2 === 0 ? '6%' : 0
            }}
          />
        ))}
      </View>
    </View>
  )
}

export default RestaurantLoading

const styles = StyleSheet.create({})
