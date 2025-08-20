import { StyleSheet, Dimensions } from 'react-native'
import { alignment } from '../../utils/alignment'
import { moderateScale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
const { height } = Dimensions.get('window')

const BACKDROP_HEIGHT = Math.floor(moderateScale(height / 5))

export const useStyles = (theme) =>
  StyleSheet.create({
    iconContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    backdrop: {
      height: BACKDROP_HEIGHT
    },
    layout: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    container: {
      flex: 1,
      backgroundColor: theme.white,
      borderTopLeftRadius: moderateScale(15),
      borderTopRightRadius: moderateScale(15),
      ...alignment.Psmall,
      flex: 1,
      justifyContent: 'space-around'
    },
    topContainer: {
      flex: 1,
      maxHeight: moderateScale(40),
      alignItems: 'flex-end'
    },
    closeButton: {
      backgroundColor: colors.secondaryGreen,
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(10),
      borderRadius: moderateScale(8),
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: moderateScale(50),
      justifyContent: 'space-evenly',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: moderateScale(28)
      // marginTop: moderateScale(50)
    },
    disabledButton: {
      opacity: 0.4, // Optional: reduce opacity
      backgroundColor: colors.secondaryGreen,
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(10),
      borderRadius: moderateScale(8),
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: moderateScale(50),
      justifyContent: 'space-evenly',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: moderateScale(28)
    },
    secondaryText: {
      lineHeight: moderateScale(24),
      marginTop: moderateScale(8)
    },
    ternaryText: {
      lineHeight: moderateScale(18),
      marginTop: moderateScale(10)
    },
    inputContainer: {
      ...alignment.MTlarge,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.verticalLine,
      borderRadius: moderateScale(5),
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10
    }
  })
