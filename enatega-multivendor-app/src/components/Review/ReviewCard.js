import React from 'react'
import { View } from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import SmallStarIcon from '../../assets/SVG/small-star-icon'
import { styles } from './styles'
import { alignment } from '../../utils/alignment'
import { useTranslation } from 'react-i18next'

const ReviewCard = ({ theme, name, rating, description, date }) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  return (
    <View style={styles.cardContainer(theme)}>
      <View
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <TextDefault
          bold
          H5
          textColor={theme.gray700}
          // style={{ textTransform: 'capitalize', color: '#000' }}
        >
          {name}
        </TextDefault>
        <View style={{ ...styles.reviewContainer }}>
          <StarRating numberOfStars={5} rating={rating} />
        </View>
      </View>
      <TextDefault
        textColor={theme.gray500}
        numberOfLines={5}
        style={{ textAlign: isArabic ? 'right' : 'left' }}
      >
        {description}
      </TextDefault>
      <TextDefault
        textColor={theme.gray500}
        style={{ marginTop: 10, textAlign: isArabic ? 'right' : 'left' }}
      >
        {date} {t('daysAgo')}
      </TextDefault>
    </View>
  )
}

const StarRating = ({ numberOfStars, rating }) => {
  const { t } = useTranslation()
  const stars = Array.from({ length: numberOfStars }, (_, index) => index)
  return (
    <View style={styles.smallStarContainer}>
      {stars.map((index) => (
        <View key={`star-${index}`} style={{ ...alignment.MxSmall }}>
          <SmallStarIcon isFilled={index + 1 <= rating} />
        </View>
      ))}
    </View>
  )
}

export default ReviewCard
