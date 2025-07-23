import { StyleSheet } from 'react-native'
import { scale, verticalScale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'

const styles = (props = null) => {
  return StyleSheet.create({
    headerTitleContainer: {
      flex: 1,
      width: '95%',
      justifyContent: 'center',
      paddingBottom: scale(8)
    },
    locationIcon: {
      backgroundColor: props != null ? props.iconBackground : colors.primary,
      width: scale(24),
      height: scale(24),
      borderRadius: scale(24),
      justifyContent: 'center',
      alignItems: 'center'
    },
    headerContainer: {
      width: '90%',
      paddingLeft: scale(5),
      marginTop: scale(10)
    }
  })
}
export default styles
