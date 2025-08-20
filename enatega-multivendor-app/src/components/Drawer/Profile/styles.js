import { moderateScale, scale } from '../../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'

const styles = (props = null) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: props !== null ? props.newheaderColor : 'transparent',
    },
    logInContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end',
      ...alignment.PLsmall,
      ...alignment.PBlarge
    },
    alignLeft: {
      textAlign: 'left'
    },
    loggedInContainer: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center'
    },
    subContainer: {
      width: '90%',
      height: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      // ...alignment.MBlarge
    },
    imgContainer: {
      width: moderateScale(50),
      height: moderateScale(50),
      borderRadius: scale(35),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.Pink.gray100
      // ...alignment.MTlarge
    }
  })

export default styles
