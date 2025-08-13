import React, { useContext } from 'react'
import { View } from 'react-native'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'

function TitleComponent(props) {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { i18n } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  return (
    <View
      style={{
        ...styles.mainContainer,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: isArabic ? 'row-reverse' : 'row'
        // backgroundColor: 'red'
      }}
    >
      <View
        style={{
          ...styles.leftContainer
          // flexDirection: isArabic ? 'row-reverse' : 'row'
        }}
      >
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontMainColor}
          style={{ textAlign: isArabic ? 'right' : 'left', fontSize: 16 }}
          H6
          bolder
        >
          {props.title}
        </TextDefault>
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontSecondColor}
          style={{ textAlign: isArabic ? 'right' : 'left' }}
          small
        >
          {props.subTitle}
        </TextDefault>
      </View>
      <View style={styles.rightContainer}>
        <TextDefault
          textColor={currentTheme.color2}
          H6
          center
          // style={{ fontSize: 14 }}
        >
          {props.status}
        </TextDefault>
      </View>
    </View>
  )
}

export default TitleComponent
