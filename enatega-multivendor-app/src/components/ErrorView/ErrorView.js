import { React, useContext } from 'react'
import { View } from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import { MaterialIcons } from '@expo/vector-icons'
import { scale } from '../../utils/scaling'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import { useTranslation } from 'react-i18next'
import ErrorSvg from '../../assets/SVG/error'

const ErrorView = ({ wentWrong, message, children }) => {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation()

  return (
    <View style={styles(currentTheme).errorViewContainer}>
      <ErrorSvg fill={'#000'} />
      <TextDefault center H3 bolder textColor={'#000'}>
        {wentWrong}
      </TextDefault>
      <TextDefault center H4 textColor={'#000'}>
        {message}
      </TextDefault>
      {children ? children : null}
    </View>
  )
}

export default ErrorView
