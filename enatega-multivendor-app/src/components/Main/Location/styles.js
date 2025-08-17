import { StyleSheet } from 'react-native'
import { moderateScale, scale, verticalScale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'

const styles = (props = null) => {
  return StyleSheet.create({
    headerTitleContainer: {
      width: '95%',
      paddingBottom: scale(8),
    },
    locationIcon: {
      backgroundColor: props != null ? props.iconBackground : colors.primary,
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: scale(24),
      justifyContent: 'center',
      alignItems: 'center'
    },
    headerContainer: {
      width: '90%',
      paddingLeft: scale(5),
    }
  })
}
export default styles
