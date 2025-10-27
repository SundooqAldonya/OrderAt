import { React, useContext } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import { MaterialIcons } from '@expo/vector-icons'
import { scale } from '../../utils/scaling'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import { useTranslation } from 'react-i18next'
import ErrorSvg from '../../assets/SVG/error'
import { useNavigation } from '@react-navigation/native'
import UserContext from '../../context/User'
import { colors } from '../../utils/colors'

const ErrorView = ({ wentWrong, message, children }) => {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { isLoggedIn } = useContext(UserContext)

  const handleNavOtlobMandoob = () => {
    if (isLoggedIn) {
      navigation.navigate('RequestDelivery')
    } else {
      navigation.navigate('CreateAccount') // redirect to Login screen
    }
  }

  return (
    <View style={styles(currentTheme).errorViewContainer}>
      <ErrorSvg fill={'#000'} />
      <TextDefault center H3 bolder textColor={'#000'}>
        {wentWrong}
      </TextDefault>
      <TextDefault center H4 textColor={'#000'}>
        {message}
      </TextDefault>
      <TouchableOpacity style={styles1.btn} onPress={handleNavOtlobMandoob}>
        <TextDefault center H4 textColor={colors.primary}>
          {t('try_request_delivery')}
        </TextDefault>
      </TouchableOpacity>
      {children ? children : null}
    </View>
  )
}

const styles1 = StyleSheet.create({
  btn: {
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5
  }
})

export default ErrorView
