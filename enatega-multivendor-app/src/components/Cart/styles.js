import { StyleSheet, Dimensions } from 'react-native'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
const { height } = Dimensions.get('window')

const BACKDROP_HEIGHT = Math.floor(scale(height / 5))

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
      borderTopLeftRadius: scale(15),
      borderTopRightRadius: scale(15),
      ...alignment.Psmall,
      flex: 1,
      justifyContent: 'space-around'
    },
    topContainer: {
      flex: 1,
      maxHeight: scale(40),
      alignItems: 'flex-end'
    },
    closeButton: {
      backgroundColor: colors.secondaryGreen,
      paddingVertical: scale(8),
      paddingHorizontal: scale(10),
      borderRadius: scale(8),
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: 50,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: scale(28)
      // marginTop: scale(50)
    },
    disabledButton: {
      opacity: 0.4, // Optional: reduce opacity
      backgroundColor: colors.secondaryGreen,
      paddingVertical: scale(8),
      paddingHorizontal: scale(10),
      borderRadius: scale(8),
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: 50,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: scale(28)
    },
    secondaryText: {
      lineHeight: scale(24),
      marginTop: scale(8)
    },
    ternaryText: {
      lineHeight: scale(18),
      marginTop: scale(10)
    },
    inputContainer: {
      ...alignment.MTlarge,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.verticalLine,
      borderRadius: scale(5),
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10
    }
  })
