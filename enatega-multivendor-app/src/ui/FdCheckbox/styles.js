import { moderateScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
const styles = (props = null) =>
  StyleSheet.create({
    mainContainer: {
      borderColor: props !== null ? props.color9 : 'gray',
      borderWidth: moderateScale(1),
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(4),
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
export default styles
