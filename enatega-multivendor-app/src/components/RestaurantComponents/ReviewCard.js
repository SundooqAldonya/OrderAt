import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const ReviewCard = ({ review }) => {
  const userName = review?.order?.user?.name || 'Anonymous'
  const date = new Date(Number(review.createdAt)).toLocaleDateString()
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{userName || 'Anonymous'}</Text>
      <Text style={styles.rating}>⭐ {review.rating}/5</Text>
      <Text style={styles.comment}>{review.description}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  )
}

export default ReviewCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    elevation: 2
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16
  },
  rating: {
    marginVertical: 4,
    color: '#f39c12'
  },
  comment: {
    color: '#555'
  },
  date: {
    marginTop: 8,
    fontSize: 12,
    color: '#999'
  }
})
