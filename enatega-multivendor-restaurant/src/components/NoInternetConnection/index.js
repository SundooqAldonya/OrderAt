// App.js
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, StatusBar } from 'react-native'

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* {!isConnected && ( */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>No Internet Connection</Text>
      </View>
      {/* )} */}

      {/* Your main app content */}
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  bannerText: {
    color: 'white',
    fontWeight: '600'
  }
})
