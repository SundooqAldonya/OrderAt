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
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data, loading, error } = useQuery(getReviews, {
    variables: {
      restaurant: restaurantId
    },
    skip: !restaurantId,
    fetchPolicy: 'network-only'
  })

  const reviews = data?.reviews || []

  const renderItem = ({ item }) => {
    return <ReviewCard key={item._id} review={item} />
  }

  return (
    <Modal
      visible={reviewModalVisible}
      animationType='slide'
      onRequestClose={() => setReviewModalVisible(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View
            style={{
              ...styles.header,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <Text style={styles.title}>{t('customerReviews')}</Text>
            <TouchableOpacity
              onPress={() => setReviewModalVisible(false)}
              style={styles.closeIcon}
            >
              <AntDesign name='close' size={24} color='black' />
            </TouchableOpacity>
          </View>

          {/* List of Reviews */}
          {reviews?.length ? (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              {t('noReviewsYet')}
            </Text>
          )}
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
