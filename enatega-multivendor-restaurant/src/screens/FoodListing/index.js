import React from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native'
import { useQuery } from '@apollo/client'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getFoodListByRestaurant } from '../../apollo'
import { useAccount } from '../../ui/hooks'
import { SafeAreaView } from 'react-native-safe-area-context'
import CardItem from '../../components/CardItem'
import { useTranslation } from 'react-i18next'

const FoodListing = () => {
  const { data: dataRestaurant } = useAccount()
  const { t } = useTranslation()

  const { loading, error, data } = useQuery(getFoodListByRestaurant, {
    variables: { id: dataRestaurant?.restaurant?._id },
    skip: !dataRestaurant,
    pollInterval: 10000
  })

  if (loading) return <Text style={styles.loader}>Loading...</Text>
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>

  const renderItem = ({ item }) => {
    return <CardItem key={item._id} item={item} />
  }

  return (
    <SafeAreaView>
      <Text
        style={{
          fontSize: 18,
          marginInlineStart: 18,
          marginTop: 15,
          fontWeight: 'bold'
        }}>
        {t('products')}
      </Text>
      <FlatList
        data={data?.foodListByRestaurant}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 16
  },

  loader: {
    textAlign: 'center',
    marginTop: 50
  },
  error: {
    textAlign: 'center',
    color: 'red',
    marginTop: 50
  }
})
export default FoodListing
