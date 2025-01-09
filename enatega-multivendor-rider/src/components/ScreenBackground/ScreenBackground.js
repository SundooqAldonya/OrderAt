import React from 'react'
import { View, StatusBar, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './style'
import { useNavigation } from '@react-navigation/native'
const RiderLogin = require('../../assets/svg/RiderLogin.png')

const ScreenBackground = ({ children }) => {
  const navigation = useNavigation()
  return (
    <SafeAreaView style={[styles.flex, styles.bgColor]}>
      <StatusBar
        backgroundColor={styles.bgColor.backgroundColor}
        barStyle="dark-content"
      />
      <TouchableOpacity
        style={styles.hamburger}
        onPress={() => navigation.openDrawer()}>
        <View style={styles.line}></View>
        <View style={styles.line}></View>
        <View style={styles.line}></View>
      </TouchableOpacity>
      <View style={styles.container}>
        <Image
          source={RiderLogin}
          style={[styles.image]}
          height={150}
          width={250}
        />
        {children}
      </View>
    </SafeAreaView>
  )
}

export default ScreenBackground
