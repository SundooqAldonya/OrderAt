import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'
import { colors } from '../../utils/colors'

const Categories = ({ categories, activeCategory, onCategoryPress }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryBar}
    >
      {categories?.map((cat, index) => (
        <TouchableOpacity
          key={cat._id}
          onPress={() => onCategoryPress(cat._id)}
          style={[
            styles.categoryButton,
            activeCategory === cat._id && styles.activeCategory
          ]}
        >
          <Text
            style={
              activeCategory === cat._id
                ? styles.activeText
                : styles.inactiveText
            }
          >
            {cat.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

export default Categories
const styles = StyleSheet.create({
  categoryBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  activeCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  activeText: {
    color: '#fff'
  },
  inactiveText: {
    color: '#333'
  }
})
