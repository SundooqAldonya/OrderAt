import React from 'react'
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { TextDefault } from '../../components'
import { colors, MAX_TIME } from '../../utilities'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import AntDesign from '@expo/vector-icons/AntDesign'

const NewOrderScreenNotification = ({ route }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const {
    activeBar,
    orderData,
    rider,
    preparationTime,
    createdAt
  } = route.params
  const createdTime = new Date(createdAt)
  const date = new Date(createdAt)
  const timeNow = new Date()
  const acceptanceTime = moment(date).diff(timeNow, 'seconds')
  let remainingTime = moment(createdTime)
    .add(MAX_TIME, 'seconds')
    .diff(timeNow, 'seconds')

  console.log({ params: route.params })

  const handleRedirect = () => {
    navigation.navigate('OrderDetail', {
      activeBar,
      orderData: orderData,
      rider: rider,
      remainingTime,
      createdAt,
      MAX_TIME,
      acceptanceTime,
      preparationTime
    })
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.green} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity
          style={{ marginTop: 50 }}
          onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={30} color="black" />
        </TouchableOpacity>
        <TextDefault bolder style={styles.title}>
          {t('new_order_title')}
        </TextDefault>
      </View>
      <TextDefault bolder style={styles.subtitle}>
        {t('orderId')}: {orderData.orderId}
      </TextDefault>
      <TouchableOpacity style={styles.btn} onPress={handleRedirect}>
        <TextDefault bold style={styles.btnText}>
          {t('review_new_order')}
        </TextDefault>
        <AntDesign name="arrowright" size={20} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkgreen,
    flex: 1,
    height: '100%',
    width: '100%',
    padding: 20
  },
  title: {
    marginTop: 50,
    fontSize: 30
  },
  subtitle: {
    marginTop: 50,
    fontSize: 20
  },
  btn: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  btnText: {
    fontSize: 20
  }
})

export default NewOrderScreenNotification
