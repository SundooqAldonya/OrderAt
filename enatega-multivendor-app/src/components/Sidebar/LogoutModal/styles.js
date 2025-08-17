import { StyleSheet } from 'react-native'
import { moderateScale } from '../../../utils/scaling'
import { colors} from '../../../utils/colors'

const styles = (props = null) => {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        props !== null ? props.customizeOpacityBtn : 'rgba(0, 0, 0, 0.74)'
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: moderateScale(20),
      borderRadius: moderateScale(10)
    },
    modalText: {
      fontSize: moderateScale(15),
      marginBottom: moderateScale(10),
      color: colors.border2
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: moderateScale(10)
    },
    modalHeader: {
      fontSize: moderateScale(20),
      marginBottom: moderateScale(10),
      fontWeight: 'bold',
      color: colors.border1
    }
  })
}
export default styles
