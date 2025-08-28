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
import { moderateScale, scale } from '../../../utils/scaling'
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
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
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
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginInlineStart: moderateScale(10),
            gap: 8,
            marginTop: moderateScale(10)
          }}
        >
          <View
            style={[
              styles().locationIcon,
              locationIconGray
            ]}
          >
            <EvilIcons
              name='location'
              size={moderateScale(25)}
              color={currentTheme.secondaryText}
            />
          </View>
          <View style={styles(currentTheme).headerContainer}>
            <TextDefault
              textColor={colors?.white}
              left
              bolder
              style={{ textAlign: isArabic ? 'right' : 'left' }}
            >
              ({t(translatedLabel)})
            </TextDefault>
            <View style={styles.textContainer}>
              <TextDefault
                textColor={colors?.white}
                small
                numberOfLines={1}
                H5
                bolder
                style={{ textAlign: isArabic ? 'right' : 'left' }}
              >
                {/* {translatedAddress?.slice(0, 40)}... */}
                {translatedAddress}
              </TextDefault>
            </View>
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
