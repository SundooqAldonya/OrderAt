import React, { useContext } from 'react'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import UserContext from '../../../context/User'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../utils/colors'

function DrawerProfile(props) {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { isLoggedIn, loadingProfile, profile } = useContext(UserContext)

  if (loadingProfile) return <TextDefault>{t('loading')}</TextDefault>
  return (
    <View style={[styles(currentTheme).mainContainer, { backgroundColor: colors.background, borderWidth: 0 }]}>


      <View style={styles().loggedInContainer}>
        <View style={styles().subContainer}>
          <View style={styles(currentTheme).imgContainer}>
            <TextDefault textColor={currentTheme.tagColor} bold H1>
              {profile?.name?.substr(0, 1)?.toUpperCase() ?? 'G'}
            </TextDefault>
          </View>
          <View style={{flex:1}}>

            <TextDefault textColor={colors.dark} bolder H2>
              {profile?.name ?? 'Mohammadaitia'}
            </TextDefault>
            <TextDefault textColor={colors.dark} H5  >
              {profile?.email ?? 'guest@gmail.com'}
            </TextDefault>
          </View>
        </View>
      </View>
    </View>
  )
}

export default DrawerProfile