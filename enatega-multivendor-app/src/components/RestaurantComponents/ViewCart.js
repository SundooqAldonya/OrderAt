import {
  Animated,
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
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'
import { moderateScale, scale } from '../../utils/scaling'
import TextDefault from '../Text/TextDefault/TextDefault'
import { colors } from '../../utils/colors'
import Feather from '@expo/vector-icons/Feather'

const ViewCart = ({ cartCount, calculatePrice, minimumOrder }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  const circle = useSharedValue(0)

  const circleSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [moderateScale(18), moderateScale(24), moderateScale(18)],
    Extrapolation.CLAMP
  )
  const radiusSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [moderateScale(9), moderateScale(12), moderateScale(9)],
    Extrapolation.CLAMP
  )

  const scaleValue = useSharedValue(1)

  const scaleStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }))

  return (
    <TouchableOpacity
      style={[
        styles.container,
        Platform.OS === 'ios' && { marginBottom: 70 },
        { bottom: calculatePrice() > minimumOrder ? 0 : 40 }
      ]}
      onPress={() => navigation.navigate('Cart')}
    >
      <View
        activeOpacity={0.7}
        style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}
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
            <Animated.Text
              style={[
                {
                  color: '#fff',
                  fontSize: moderateScale(16),

                  // backgroundColor: 'red',
                  textAlign: 'center'
                }
              ]}
            >
              {cartCount}
            </Animated.Text>
          </Animated.View>
        </View>
        <TextDefault textColor={'#fff'} uppercase center bolder small H5>
          {t('viewCart')}
        </TextDefault>
        <View>
          <Feather name='shopping-cart' size={moderateScale(24)} color='#fff' />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ViewCart

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    bottom: 40,
    left: 0,
    right: 0,
    padding: 12,
    paddingVertical: 20,
    backgroundColor: colors.primary, // or your primary color
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 1000
  }
})
