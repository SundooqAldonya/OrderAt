import { Animated, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HEADER_COLLAPSED_HEIGHT } from '../../screens/Restaurant/helpers'

const RestaurantHeader = ({ stickyHeaderAnim, title }) => {
  return (
    <Animated.View
      style={[
        styles.stickyHeader,
        {
          opacity: stickyHeaderAnim,
          transform: [
            {
              translateY: stickyHeaderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0] // Slide in from top
              })
            }
          ]
        }
      ]}
    >
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </Animated.View>
  )
}

export default RestaurantHeader

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: HEADER_COLLAPSED_HEIGHT,
    backgroundColor: '#fff',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    elevation: 5
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginInlineStart: 50,
    marginTop: 18
  }
})
