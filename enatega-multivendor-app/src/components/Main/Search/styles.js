import { fontStyles } from '../../../utils/fontStyles'
import { moderateScale, scale, verticalScale } from '../../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'

const styles = (props = null, newheaderColor = theme.headerMenuBackground) =>
  StyleSheet.create({
    bodyStyleOne: {
      fontFamily: 'Montserrat_500Medium',
      fontSize: moderateScale(12),
      color: '#000',
      flex: 1,
      marginStart: 5
    },
    mainContainerHolder: {
      zIndex: 333,
      width: '100%',
      alignItems: 'center',
      backgroundColor: newheaderColor,
      // shadowColor: props != null ? props.shadowColor : 'black',
      // shadowOffset: {
      //   width: 0,
      //   height: verticalScale(1)
      // },
      // shadowOpacity: 0.1,
      // shadowRadius: verticalScale(1)
      // ...alignment.MBmedium
    },
    mainContainer: {
      width: '90%',
      height: moderateScale(35),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: moderateScale(8),
      // paddingVertical: verticalScale(20),
      // backgroundColor: props != null ? props.color1 : 'black',
      backgroundColor: props != null ? '#f2f2f2' : 'black',

      shadowColor: props != null ? props.shadowColor : 'black',
      shadowOffset: {
        width: 0,
        height: verticalScale(1)
      },
      shadowOpacity: 0.2,
      shadowRadius: verticalScale(1)
    },
    subContainer: {
      width: '90%',
      height: '60%',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row'
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '95%'
    },
    searchContainer: {
      width: '10%'
    },
    inputContainer: {
      width: '100%',
      height: scale(36),
      justifyContent: 'center',
      ...alignment.MLxSmall,
      ...alignment.MRxSmall
    },
    filterContainer: {
      width: '10%',
      height: '90%',
      justifyContent: 'center',
      alignItems: 'center'
      // backgroundColor: 'red'
    }
  })
export default styles
