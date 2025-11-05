import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { scale } from '../../utilities/scaling'
import Feather from '@expo/vector-icons/Feather'
import colors from '../../utilities/colors'
import { useNavigation } from '@react-navigation/native'

const NoOrder = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={styles.arrowBack}>
        <Feather name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <View>
        <TextDefault style={{ fontSize: scale(24) }}>
          {t('orderCancelled')}
        </TextDefault>
      </View>
      <LottieView
        source={require('../../assets/order_cancelled.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={styles.btnHome}>
        <TextDefault style={{ color: '#fff' }}>{t('go_home')}</TextDefault>
      </TouchableOpacity>
    </View>
  )
}

export default NoOrder

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  lottie: {
    width: 200,
    height: 200
  },
  arrowBack: {
    position: 'absolute',
    top: 50,
    left: 20
  },
  btnHome: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  }
})
