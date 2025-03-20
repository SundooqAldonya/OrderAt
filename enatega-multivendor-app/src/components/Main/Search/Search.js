import React, { useContext } from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { scale } from '../../../utils/scaling'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../utils/colors'

function Search(props) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  return (
    <View
      style={[
        styles(currentTheme, props.newheaderColor).mainContainerHolder,
        { backgroundColor: colors.primary }
      ]}
    >
      <View style={styles(currentTheme, props.cartContainer).mainContainer}>
        <View style={{ ...styles().subContainer }}>
          <View style={styles().leftContainer}>
            <TouchableOpacity
              onPress={() => {
                props.setSearch('')
              }}
            >
              {props.search?.length ? (
                <AntDesign
                  name='closecircleo'
                  size={scale(18)}
                  color={currentTheme.fontSecondColor}
                />
              ) : null}
            </TouchableOpacity>
            <View style={styles().inputContainer}>
              <TextInput
                style={{
                  ...styles(currentTheme).bodyStyleOne,
                  color: currentTheme.secondaryText,
                  paddingRight: 25
                }}
                placeholder={t(props.placeHolder)}
                placeholderTextColor={
                  themeContext.ThemeValue === 'Dark' ? '#fff' : colors.border1
                }
                onChangeText={(text) => props.setSearch(text)}
                value={props.search}
              />
            </View>
          </View>
          <View style={styles().filterContainer}>
            <Ionicons
              name='search'
              color={currentTheme.gray500}
              size={scale(20)}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default Search
