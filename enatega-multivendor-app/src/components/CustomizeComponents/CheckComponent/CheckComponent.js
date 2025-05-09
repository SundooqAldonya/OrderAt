import React, { useState, useContext, useEffect } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import CheckboxBtn from '../../../ui/FdCheckbox/CheckboxBtn'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../../../context/Configuration'
import { theme } from '../../../utils/themeColors'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { useTranslation } from 'react-i18next'

function CheckComponent(props) {
  const [options, setOptions] = useState(null)
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  useEffect(() => {
    setOptions(props.options.map((option) => ({ ...option, checked: false })))
  }, [props.options])

  function onPress(option) {
    const tempOptions = options
    const index = tempOptions.findIndex((opt) => opt._id === option._id)
    tempOptions[index].checked = !tempOptions[index].checked
    setOptions(tempOptions)
    props.onPress(option)
  }

  return (
    <View>
      {options?.map((option) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPress(option)}
          key={option._id}
          style={[
            styles.mainContainer,
            {
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }
          ]}
        >
          <View
            style={[
              styles.leftContainer,
              {
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }
            ]}
          >
            <CheckboxBtn
              onPress={() => onPress(option)}
              checked={option.checked}
            />
            <TextDefault
              numberOfLines={1}
              textColor={currentTheme.gray900}
              style={[alignment.MLsmall, alignment.PRsmall]}
              H6
              bolder
            >
              {option.title}
            </TextDefault>
          </View>
          <View
            style={[
              styles.rightContainer,

              {
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }
            ]}
          >
            <TextDefault
              textColor={currentTheme.gray900}
              H6
              bolder
            >{`${option.price} ${configuration.currencySymbol}`}</TextDefault>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default CheckComponent
