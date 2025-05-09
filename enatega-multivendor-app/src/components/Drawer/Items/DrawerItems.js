import React, { useContext } from 'react'
import { TouchableOpacity, View } from 'react-native'
import styles from './styles.js'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext.js'
import { theme } from '../../../utils/themeColors.js'
import TextDefault from '../../../components/Text/TextDefault/TextDefault'
import { SimpleLineIcons } from '@expo/vector-icons'
import { scale, verticalScale } from '../../../utils/scaling.js'
import { colors } from '../../../utils/colors.js'

function DrawerItems(props) {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  return (
    <View style={[styles().flex, { borderBottomWidth: 0 }]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles().container}
        onPress={props.onPress}
      >
        <View style={styles(currentTheme).leftContainer}>
          {/* <SimpleLineIcons
            name={props.icon}
            size={verticalScale(18)}
            color={currentTheme.darkBgFont}
          /> */}
          {props.icon}
        </View>
        <View style={styles().rightContainer}>
          <TextDefault
            style={[
              styles().drawerContainer,
              {
                fontSize: scale(12),
                fontWeight: '600',
                color: themeContext.ThemeValue === 'Dark' ? '#fff' : colors.dark
              }
            ]}
            // textColor={
            //   themeContext.ThemeValue === 'Dark' ? '#fff' : colors.dark
            // }
            small
            bold
          >
            {props.title}
          </TextDefault>
        </View>
      </TouchableOpacity>
    </View>
  )
}
export default DrawerItems
