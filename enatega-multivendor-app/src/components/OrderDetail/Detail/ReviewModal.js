import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../utils/colors'

const ReviewModal = ({
  visible,
  onClose,
  order,
  restaurantMutation,
  riderReviewMutation,
  restaurant,
  title
}) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  const handleRating = (value) => setRating(value)

  const handleSubmit = () => {
    if (restaurant) {
      restaurantMutation({ review, rating })
    } else {
      riderReviewMutation({ review, rating })
    }
    setRating(0)
    setReview('')
    onClose()
  }

  return (
    <Modal visible={visible} animationType='slide' transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text
            style={{ ...styles.title, textAlign: isArabic ? 'right' : 'left' }}
          >
            {title}
          </Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                {star <= rating ? (
                  <FontAwesome name='star' size={24} color='orange' />
                ) : (
                  <FontAwesome name='star-o' size={24} color='orange' />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder={t('write_review')}
            style={styles.input}
            multiline
            value={review}
            onChangeText={setReview}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={{ color: '#000' }}>{t('Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submit}>
              <Text style={styles.buttonText}>{t('submit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
    gap: 5
  },
  star: {
    fontSize: 30,
    marginHorizontal: 5
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  cancel: {
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6
  },
  submit: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6
  },
  buttonText: {
    color: '#fff'
  }
})

export default ReviewModal
