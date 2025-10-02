import React, { useContext } from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { moderateScale, scale } from '../../../utils/scaling'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../utils/colors'

function Search({
  setSearch,
  search,
  handleSearch,
  newheaderColor,
  placeHolder,
  backgroundColor,
  cartContainer,
  refetch
}) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const handleSearchChange = (text) => {
    setSearch(text)
    if (handleSearch) {
      handleSearch(text)
    }
  }

  return (
    <View
      style={[
        styles(currentTheme, newheaderColor).mainContainerHolder,
        { backgroundColor: backgroundColor || colors.primary }
      ]}
    >
      <View style={styles(currentTheme, cartContainer).mainContainer}>
        <View style={{ ...styles().subContainer }}>
          <View style={styles().leftContainer}>
            <TouchableOpacity
              onPress={() => {
                setSearch('')
                refetch({ search: null })
              }}
            >
              {search?.length ? (
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
                  paddingHorizontal: 20,
                  paddingVertical: 10
                }}
                placeholder={t(placeHolder)}
                placeholderTextColor={'#bbb'}
                // onChangeText={(text) => setSearch(text)}
                onChangeText={handleSearchChange}
                autoCorrect={false}
                autoCapitalize='none'
                underlineColorAndroid='transparent'
                returnKeyType='search'
                value={search}
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
