import { StyleSheet } from 'react-native'
import { moderateScale, scale } from '../../../utils/scaling'
import { theme } from '../../../utils/themeColors'
import { alignment } from '../../../utils/alignment'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: moderateScale(15),
      paddingVertical: moderateScale(5),
      ...alignment.MLxSmall
    },
    leftContainer: {
      height: moderateScale(35),
      width: moderateScale(35),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props !== null ? props.gray100 : 'transparent',
      borderRadius: 25,
      // marginHorizontal:20,
    },
    img: {
      width: '100%',
      height: '100%'
    },
    rightContainer: {
      marginLeft:10,
      justifyContent: 'center',
    },
    drawerContainer: {
      alignSelf: 'flex-start'
    }
  })
export default styles
