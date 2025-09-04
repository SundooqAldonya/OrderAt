import React, { useContext } from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { moderateScale, scale } from '../../../utils/scaling'
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
        { backgroundColor: props?.backgroundColor || colors.primary }
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
                  size={moderateScale(18)}
                  color={currentTheme.fontSecondColor}
                />
              ) : null}
            </TouchableOpacity>
            <View style={styles().inputContainer}>
              <TextInput
                style={{
                  ...styles(currentTheme).bodyStyleOne,
                  color: currentTheme.fontMainColor,
                  paddingRight: 15,
                  paddingVertical: 10
                }}
                placeholder={t(props.placeHolder)}
                placeholderTextColor={'#bbb'}
                onChangeText={(text) => props.setSearch(text)}
                value={props.search}
              />
            </View>
          </View>
          <View style={styles().filterContainer}>
            <Ionicons
              name='search'
              color={currentTheme.gray500}
              size={moderateScale(20)}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default Search
