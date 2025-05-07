import { TouchableOpacity } from 'react-native'
import React from 'react'
import TextDefault from '../Text/TextDefault/TextDefault'

export default function Button({
  text,
  textStyles,
  buttonStyles,
  buttonProps,
  textProps
}) {
  return (
    <TextDefault {...textProps} style={textStyles} bolder>
      {text}
    </TextDefault>
  )
}
