import React, { useContext } from 'react'
import { View, TouchableOpacity } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { LocationContext } from '../../../context/Location'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import { EvilIcons, Feather } from '@expo/vector-icons'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'

function Location({
  navigation,
  addresses,
  locationIconGray,
  modalOn,
  location: locationParam,
  locationLabel,
  forwardIcon = false,
  screenName
}) {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { location } = useContext(LocationContext)

  let translatedLabel
  if (location.label === 'Current Location') {
    translatedLabel = t('currentLocation')
  } else {
    translatedLabel = t(location.label)
  }

  const translatedAddress = location.deliveryAddress
    ? location.deliveryAddress
    : location.deliveryAddress &&
        location.deliveryAddress === 'Current Location'
      ? t('currentLocation')
      : location.area
        ? `${location.city.title}, ${location.area.title}`
        : null

  const onLocationPress = (event) => {
    if (screenName === 'checkout') {
      if (addresses && !addresses.length) {
        navigation.navigate('NewAddress', {
          backScreen: 'Cart'
        })
      } else {
        navigation.navigate('CartAddress', {
          address: location
        })
      }
    } else modalOn()
  }

  return (
    <TouchableOpacity
      onPress={onLocationPress}
      style={{ marginHorizontal: scale(10) }}
    >
      <View style={styles(currentTheme).headerTitleContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: scale(10),
            gap: 5
          }}
        >
          <View
            style={[
              styles().locationIcon,
              locationIconGray,
              { marginTop: scale(8) }
            ]}
          >
            <EvilIcons
              name='location'
              size={scale(20)}
              color={currentTheme.secondaryText}
            />
          </View>
          <View style={styles(currentTheme).headerContainer}>
            <View style={styles.textContainer}>
              <TextDefault
                textColor={colors?.white}
                small
                numberOfLines={1}
                H5
                bolder
              >
                {/* {translatedAddress?.slice(0, 40)}... */}
                {translatedAddress}
              </TextDefault>
            </View>
            <TextDefault textColor={colors?.white} left>
              {''}
              {t(translatedLabel)}
            </TextDefault>
          </View>
          {forwardIcon && (
            <Feather name='chevron-right' size={20} color={colors.white} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Location
