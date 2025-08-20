import React, { useContext } from 'react'
import { TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

import styles from './styles'
import { moderateScale } from '../../utils/scaling'
import ThemeContext from '../ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { colors } from '../../utils/colors'

function CheckboxBtn(props) {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[
        styles(currentTheme).mainContainer,
        props.checked
          ? { backgroundColor: colors.primary, borderColor: 'transparent' }
          : { backgroundColor: colors.white }
      ]}>
      {props.checked ? (
        <FontAwesome
          name="check"
          size={moderateScale(13)}
          color={colors.white}
        />
      ) : null}
    </TouchableOpacity>
  )
}
export default CheckboxBtn
