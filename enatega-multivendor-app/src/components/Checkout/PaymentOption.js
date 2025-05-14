import React from 'react'
import { Pressable, View } from 'react-native'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'
import { FontAwesome } from '@expo/vector-icons'
import TextDefault from '../Text/TextDefault/TextDefault'
import RadioButton from '../../ui/FdRadioBtn/RadioBtn'
import { useTranslation } from 'react-i18next'

export const PaymentModeOption = ({
  theme,
  icon,
  title,
  selected,
  onSelect
}) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <Pressable
      onPress={onSelect}
      style={{
        flexDirection: isArabic ? 'row-reverse' : 'row',
        alignItems: 'center',
        marginVertical: scale(8),
        // backgroundColor: 'red',
        justifyContent: 'space-between'
      }}
    >
      <View>
        <TextDefault
          textColor={theme?.fontFourthColor}
          style={{
            ...alignment.MLsmall,
            textAlign: isArabic ? 'right' : 'left'
          }}
          bold
        >
          {title}
        </TextDefault>
      </View>
      <View>
        <RadioButton
          size={scale(10)}
          outerColor={theme?.color12}
          innerColor={theme?.main}
          animation={'bounceIn'}
          isSelected={selected}
          onPress={onSelect}
        />
      </View>
    </Pressable>
  )
}
