import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const SkeletonBox = ({ height, width, borderRadius = 8, style }) => (
  <View
    style={[
      {
        height,
        width,
        borderRadius,
        backgroundColor: '#E0E0E0',
        marginBottom: 12
      },
      style
    ]}
  />
)
export default SkeletonBox
