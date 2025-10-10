import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useEffect, useRef } from 'react'
import { colors } from '../../utils/colors'
import { useTranslation } from 'react-i18next'
import { moderateScale } from '../../utils/scaling'

const SCREEN_WIDTH = Dimensions.get('window').width
const CENTER_OFFSET = SCREEN_WIDTH / 2

const Categories = ({ categories, activeCategory, onCategoryPress }) => {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const scrollRef = useRef(null)
  const itemRefs = useRef({}) // store refs for each button

  // Ensure we start at the start (important for row-reverse)
  useEffect(() => {
    if (!scrollRef.current) return
    // run after layout
    requestAnimationFrame(() => {
      try {
        scrollRef.current.scrollTo({ x: 0, animated: false })
      } catch (e) {
        // ignore
      }
    })
  }, [isArabic, categories])

  // Auto-scroll to keep active tab visible/centered
 useEffect(() => {
  if (!scrollRef.current || !activeCategory) return
  const ref = itemRefs.current[activeCategory]
  if (!ref) return

  // Defer until next frame so layout is settled
  requestAnimationFrame(() => {
    ref.measureLayout(
      scrollRef.current,
      (x, y, width, height) => {
        if (width === 0) return // guard

        const itemCenter = x + width / 2
        let scrollToX = Math.max(0, itemCenter - CENTER_OFFSET)

        scrollRef.current.scrollTo({
          x: scrollToX,
          animated: true,
        })
      },
      (err) => {
        // fallback
        if (isArabic) {
          scrollRef.current.scrollToEnd({ animated: true })
        } else {
          scrollRef.current.scrollTo({ x: 0, animated: true })
        }
      }
    )
  })
}, [activeCategory, categories])


  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      directionalLockEnabled={true}
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={{
        alignItems: 'center',
        flexDirection: isArabic ? 'row-reverse' : 'row'
      }}
      style={styles.categoryBar}
    >
      {categories?.map((cat, index) => (
        <TouchableOpacity
          key={cat._id}
          ref={(r) => {
            if (r) itemRefs.current[cat._id] = r
            else delete itemRefs.current[cat._id]
          }}
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
                  fontSize: moderateScale(12)
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
