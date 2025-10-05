import { View } from 'react-native'
import React from 'react'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'

export const PriceRow = ({
  theme,
  title,
  currency,
  price,
  originalPrice,
  coupon,
  isArabic
}) => {
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
      <View
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 10
        }}
      >
        {coupon ? (
          <TextDefault
            numberOfLines={1}
            textColor={theme.fontFourthColor}
            normal
            bold
            style={{ textDecorationLine: 'line-through' }}
          >
            {parseFloat(originalPrice).toFixed(2)}
            {currency}
          </TextDefault>
        ) : null}
        <TextDefault H4 textColor={theme.gray900} bolder>
          {price} {currency}
        </TextDefault>
      </View>
    </View>
  )
}
