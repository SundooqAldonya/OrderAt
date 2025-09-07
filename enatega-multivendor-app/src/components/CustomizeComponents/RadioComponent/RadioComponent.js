import React, { useState, useContext } from 'react'
import { View, TouchableOpacity } from 'react-native'
import RadioButton from '../../../ui/FdRadioBtn/RadioBtn'
import ConfigurationContext from '../../../context/Configuration'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { useTranslation } from 'react-i18next'

function RadioComponent(props) {
  const [selected, setSelected] = useState(props.selected || null)
  const [variations] = useState(props.variations)
  console.log({ variations })
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  function onPress(variation) {
    setSelected(variation)
    props.onPress(variation)
  }

  return (
    <View>
      {variations?.map((variation) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress.bind(this, variation)}
          key={variation._id}
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
            <RadioButton
              size={11}
              outerColor={currentTheme.iconColorDark}
              innerColor={currentTheme.main}
              animation={'bounceIn'}
              isSelected={selected ? selected._id === variation._id : false}
              onPress={onPress.bind(this, variation)}
            />
            <TextDefault
              textColor={currentTheme.fontMainColor}
              style={{
                marginHorizontal: 10
              }}
              bolder
            >
              {variation.title}
            </TextDefault>
          </View>
          <View
            style={[
              styles.rightContainer,
              {
                flexDirection: isArabic ? 'row-reverse' : 'row',
                gap: 20
              }
            ]}
          >
            <View>
              <TextDefault
                textColor={currentTheme.fontMainColor}
                bolder
              >{`${variation.price} ${configuration.currencySymbol}`}</TextDefault>
            </View>
            {variation.discounted ? (
              <View>
                <TextDefault
                  textColor={currentTheme.fontMainColor}
                  bolder
                  style={{ textDecorationLine: 'line-through' }}
                >{`${variation.price + variation.discounted} ${configuration.currencySymbol}`}</TextDefault>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default RadioComponent
