import React, { useContext } from 'react'
import { TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import styles from './styles'
import { scale } from '../../../utils/scaling'
import Spinner from '../../../components/Spinner/Spinner'
import { theme } from '../../../utils/themeColors'
import ThemeContext from '../../ThemeContext/ThemeContext'
import { alignment } from '../../../utils/alignment'
import TextDefault from '../../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../utils/colors'

const FdPhonBtn = props => {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles(currentTheme).mainContainer,
        // {backgroundColor:colors?.primary, borderColor:colors?.primary}
        props.disabled && {
          backgroundColor: '#ccc',  
          borderColor: '#aaa',
          opacity: 0.3
        }
      ]}
      disabled={props.disabled}
      onPress={props.onPress}>
      {props.loadingIcon ? (
        <Spinner backColor="rgba(0,0,0,0.1)" spinnerColor={currentTheme.main} />
      ) : (
        <>
          <MaterialIcons
  name="smartphone"
  size={scale(18)}
            color={colors?.dark}
          />
          <TextDefault
            H4
            textColor={colors?.dark}
            style={alignment.MLlarge}
            bold>
        {  props.title }
          </TextDefault>
        </>
      )}
    </TouchableOpacity>
  )
}

export default FdPhonBtn
