import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'
import { colors } from '../../utils/colors'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    mainContainer: {
      backgroundColor: props != null ? props.themeBackground : '#fff'
    },
    scrollViewContainer: {
      width: '100%',
      height: '100%'
    },
    subContainer: {
      width: '90%',
      backgroundColor: 'black',
      alignSelf: 'center'
    },
    scrollViewStyle: {
      backgroundColor: 'black'
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: props != null ? props.themeBackground : '#fff',
      zIndex: 1
    },
    titleContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: props != null ? props.themeBackground : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2
    },
    line: {
      marginLeft: scale(10),
      width: '95%',
      height: StyleSheet.hairlineWidth,
      ...alignment.MBsmall,
      backgroundColor: props !== null ? props.black : 'black'
    },
    input: {
      backgroundColor: props !== null ? props.themeBackground : 'black',
      borderRadius: scale(10),
      height: scale(100),
      paddingLeft: scale(10),
      textAlignVertical: 'center',
      borderWidth: 1,
      borderColor: props != null ? props.verticalLine : '#B8B8B8'
      // color: '#000'
    },
    inputContainer: {
      width: '90%',
      alignSelf: 'center',
      zIndex: scale(1)
    },
    backBtnContainer: {
      borderRadius: scale(50),
      width: scale(55),
      alignItems: 'center'
    },
    fixedViewNavigation: {
      height: scale(40),
      width: '90%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'center',
      // height: height * 0.05,
      zIndex: 1,
      position: 'absolute',
      top: scale(30) // Adjust this to position the image correctly
    },
    backgroundIcon: {
      backgroundColor: colors.darkLight,
      height: 30,
      width: 30,
      borderRadius: 30 / 2,
      // marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
export default styles
