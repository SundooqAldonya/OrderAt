import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useContext } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ConfigurationContext from '../../context/Configuration'
import { Extrapolation, interpolate } from 'react-native-reanimated'
import { scale } from '../../utils/scaling'

const ViewCart = ({ cartCount }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const configuration = useContext(ConfigurationContext)

  const circle = useSharedValue(0)

  const circleSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [scale(18), scale(24), scale(18)],
    Extrapolation.CLAMP
  )
  const radiusSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [scale(9), scale(12), scale(9)],
    Extrapolation.CLAMP
  )

  const fontStyles = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(
        circle.value,
        [0, 0.5, 1],
        [8, 12, 8],
        Extrapolation.CLAMP
      )
    }
  })

  const scaleValue = useSharedValue(1)

  const scaleStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }))

  return (
    <View
      style={[styles.container, Platform.OS === 'ios' && { marginBottom: 70 }]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Cart')}
      >
        <View>
          <Animated.View
            style={[
              {
                width: circleSize,
                height: circleSize,
                borderRadius: radiusSize
              },
              scaleStyles
            ]}
          >
            <Animated.Text style={[fontStyles]}>{cartCount}</Animated.Text>
          </Animated.View>
        </View>
        <TextDefault textColor={'#fff'} uppercase center bolder small H5>
          {t('viewCart')}
        </TextDefault>
        <View style={styles.buttonTextRight} />
      </TouchableOpacity>
    </View>
  )
}

export default ViewCart

const styles = StyleSheet.create({})
