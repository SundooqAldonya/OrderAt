import React, { useContext } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { FontAwesome, AntDesign } from '@expo/vector-icons'
import styles from './styles'
import { scale } from '../../../utils/scaling'
import Spinner from '../../../components/Spinner/Spinner'
import { theme } from '../../../utils/themeColors'
import ThemeContext from '../../ThemeContext/ThemeContext'
import TextDefault from '../../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../utils/colors'
import Svg, { Path } from 'react-native-svg';


const FdGoogleBtn = props => {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation()
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles(currentTheme).mainContainer, { backgroundColor: colors?.blue, borderColor: colors?.blue, paddingLeft: 0, paddingRight: 0, overflow: 'hidden' }]}
      onPressIn={props.onPressIn}
      onPress={props.onPress}>
      {props.loadingIcon ? (
        <Spinner
          backColor={currentTheme.themeBackground}
          spinnerColor={currentTheme.main}
        />
      ) : (
        <>
          <View style={{ backgroundColor: colors?.background, width: "20%", height: "100%", justifyContent: 'center', alignItems: 'center' }} >
            {/* <FontAwesome name="google" size={scale(18)} color={currentTheme.newIconColor} /> */}
           <Image source={require('../../../assets/images/googleicon.png')}  style={{height:30, width:30}} />
          </View>
          <TextDefault H4 textColor={colors.white} style={alignment.MLlarge} bold>
            {t('ContinueWithGoogle')}
          </TextDefault>
        </>
      )}
    </TouchableOpacity>
  )
}

export default FdGoogleBtn
