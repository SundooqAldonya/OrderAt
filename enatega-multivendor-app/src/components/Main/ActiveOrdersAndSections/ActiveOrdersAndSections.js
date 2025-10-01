import React, { useContext } from 'react'
import { View } from 'react-native'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { scale } from '../../../utils/scaling'
import { useTranslation } from 'react-i18next'
import styles from './styles'

function ActiveOrdersAndSections({ menuPageHeading, restaurantLength }) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  return (
    <View style={styles().menuPageHeading}>
      <TextDefault
        numberOfLines={1}
        textColor={currentTheme.fontFourthColor}
        bolder
        H4
        style={{ textAlign: isArabic ? 'right' : 'left' }}
      >
        {menuPageHeading}
      </TextDefault>
      <TextDefault
        Normal
        regular
        textColor={currentTheme.secondaryText}
        style={{
          marginTop: scale(5),
          textAlign: isArabic ? 'right' : 'left'
        }}
      >
        {t('mostOrderedNow')}
      </TextDefault>
    </View>
  )
}

export default ActiveOrdersAndSections
