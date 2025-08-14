import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'
import { colors } from '../../utils/colors'
import { useTranslation } from 'react-i18next'
import { moderateScale } from '../../utils/scaling'

const Categories = ({ categories, activeCategory, onCategoryPress }) => {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: isArabic ? 'row-reverse' : 'row',
        justifyContent: 'flex-start'
      }}
      style={{
        ...styles.categoryBar,
        flexDirection: isArabic ? 'row-reverse' : 'row'
      }}
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
            style={[
              activeCategory === cat._id
                ? styles.activeText
                : styles.inactiveText,
                {
                  fontSize: moderateScale(14)
                }
            ]}
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
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  categoryButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    marginHorizontal: 4,
    borderRadius: moderateScale(20),
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
