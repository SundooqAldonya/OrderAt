import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import InstructionMessageIcon from '../../assets/SVG/instructions-message-icon'
import ArrowForwardIcon from '../../assets/SVG/arrow-forward-icon'
import { useStyles } from './styles'
import TextDefault from '../Text/TextDefault/TextDefault'
import { moderateScale, scale } from '../../utils/scaling'
import { InstructionsModal } from './InstructionsModal'
import { useTranslation } from 'react-i18next'
 import { colors } from '../../utils/colors'

export const SpecialInstructions = ({
  theme,
  instructions,
  onSubmitInstructions
}) => {
  const [value, setValue] = useState(instructions)
  const [isVisible, setIsVisible] = useState(false)
  const { i18n, t } = useTranslation()

  const hideModal = (_) => {
    setIsVisible(false)
  }
  const showModal = (_) => {
    setIsVisible(true)
  }

  const onSubmit = (_) => {
    onSubmitInstructions(value)
    hideModal()
  }

  const styles = useStyles(theme)

  return (
    <TouchableOpacity
      onPress={showModal}
      style={{
        height: moderateScale(100),
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.lightGray,
        borderRadius: 8
      }}
    >
      <View left style={styles.iconContainer}>
        <InstructionMessageIcon stroke={theme.iconStroke} />
      </View>
      <View
        middle
        style={{ flex: 6, alignItems: 'center', justifyContent: 'center' }}
      >
        <TextDefault H5 bolder textColor={colors.dark}>
          {t('Add_a_message_for_the_restaurant')}
        </TextDefault>
        <TextDefault
          numberOfLines={3}
          textColor={theme.fontNewColor}
          style={{ lineHeight: scale(18) }}
        >
          {instructions || t('instructions')}
        </TextDefault>
      </View>
      <TouchableOpacity right style={styles.iconContainer} onPress={showModal}>
        <ArrowForwardIcon stroke={theme.iconStroke} />
      </TouchableOpacity>
      <InstructionsModal
        theme={theme}
        isVisible={isVisible}
        hideModal={hideModal}
        onSubmit={onSubmit}
        value={value}
        setValue={setValue}
      />
    </TouchableOpacity>
  )
}
