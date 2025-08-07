import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AntDesign } from '@expo/vector-icons'
import { getReviews } from '../../apollo/queries'
import { useQuery } from '@apollo/client'
import ReviewCard from './ReviewCard'

const ReviewsModal = ({
  reviewModalVisible,
  setReviewModalVisible,
  restaurantId
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, error } = useQuery(getReviews, {
    variables: {
      restaurant: restaurantId
    },
    skip: !restaurantId,
    fetchPolicy: 'network-only'
  })

  const reviews = data?.reviews || []

  console.log('Reviews Data:', reviews)

  const renderItem = ({ item }) => {
    return <ReviewCard key={item._id} review={item} />
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Text style={{ textAlign: 'center', marginTop: 20 }}>
        {t('noReviewsYet')}
      </Text>
    )
  }

  return (
    <Modal
      visible={reviewModalVisible}
      animationType='slide'
      onRequestClose={() => setReviewModalVisible(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 16, paddingBottom: 25 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('customerReviews')}</Text>
            <TouchableOpacity
              onPress={() => setReviewModalVisible(false)}
              style={styles.closeIcon}
            >
              <AntDesign name='close' size={24} color='black' />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`${t('searchReviews')}...`}
            placeholderTextColor='#888'
            style={styles.searchInput}
          />

          {/* List of Reviews */}
          <FlatList
            data={reviews}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ReviewsModal

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  closeIcon: {
    paddingHorizontal: 8
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12
  }
})
