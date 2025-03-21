import { View } from 'react-native'
import React from 'react'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'

export const PriceRow = ({ theme, title, currency, price, isArabic }) => {
  return (
    <View
      style={{
        ...styles.priceRow,
        flexDirection: isArabic ? 'row-reverse' : 'row'
      }}
    >
      <TextDefault H4 textColor={theme.gray900} bolder>
        {title}
      </TextDefault>
      <TextDefault H4 textColor={theme.gray900} bolder>
        {price} {currency}
      </TextDefault>
    </View>
  )
}
