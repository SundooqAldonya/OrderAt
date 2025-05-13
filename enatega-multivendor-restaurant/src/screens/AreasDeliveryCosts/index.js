import React, { useEffect, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity
} from 'react-native'
import { Card, Title, Paragraph } from 'react-native-paper' // optional
import { useQuery } from '@apollo/client'
import { areasCalculatedList } from '../../apollo'
import { useAccount } from '../../ui/hooks'
import { TextDefault } from '../../components'
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'
import { Configuration } from '../../ui/context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const AreasDeliveryCosts = () => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigation = useNavigation()
  const { currencySymbol } = useContext(Configuration.Context)

  const { data: restaurantData } = useAccount()

  const { data, error, loading } = useQuery(areasCalculatedList, {
    variables: { restaurantId: restaurantData?.restaurant?._id },
    fetchPolicy: 'no-cache',
    skip: !restaurantData
  })

  const dataList = data?.areasCalculatedList || null

  console.log({ dataList })

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator style={styles.centered} />
      </View>
    )
  }
  if (error)
    return <Paragraph style={styles.centered}>Error: {error.message}</Paragraph>

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        <TextDefault style={styles.cardTitle}>{item.title}</TextDefault>
        {/* <Paragraph style={{ textAlign: isArabic ? 'right' : 'left' }}>
          {t('city')}: {item.city?.name}
        </Paragraph> */}
        {/* <Paragraph style={{ textAlign: isArabic ? 'right' : 'left' }}>
          {t('distance')}: {item.distance?.toFixed(2)} km
        </Paragraph> */}
        {isArabic ? (
          <Paragraph
            style={{ textAlign: isArabic ? 'right' : 'left', fontSize: 20 }}>
            {item.cost?.toFixed(2)} {currencySymbol}
          </Paragraph>
        ) : (
          <Paragraph
            style={{ textAlign: isArabic ? 'right' : 'left', fontSize: 20 }}>
            {currencySymbol} {item.cost?.toFixed(2)}
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  )
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.arrowContainer}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <TextDefault bolder style={styles.title}>
        {t('areas_cost')}
      </TextDefault>
      <FlatList
        data={dataList}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100
  },
  title: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 20
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 30,
    marginVertical: 2,
    letterSpacing: 0.15
  },
  centered: {
    marginTop: 20,
    textAlign: 'center'
  },
  listContainer: {
    padding: 16
  },
  arrowContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingHorizontal: 10,
    zIndex: 999 // <-- for iOS
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 8
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default AreasDeliveryCosts
