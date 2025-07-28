// App.js
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, StatusBar } from 'react-native'
import { colors } from '../../utilities'

export default function NoInternetConnection() {
  const { t } = useTranslation()
  return (
    <View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{t('no_internet')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    // marginTop: 20,
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
