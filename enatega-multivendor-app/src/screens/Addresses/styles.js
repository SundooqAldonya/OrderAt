import { verticalScale, moderateScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { colors } from '../../utils/colors'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: props !== null ? props.themeBackground : 'transparent'
    },
    containerInfo: {
      width: '100%',
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'white',
      marginTop: moderateScale(20),
      paddingBottom: moderateScale(20),
      borderRadius: moderateScale(20)
    },
    subContainerImage: {
      width: '100%',
      alignContent: 'center',
      justifyContent: 'center'
    },
    descriptionEmpty: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    viewTitle: {
      ...alignment.Msmall
    },
    mainView: {
      paddingBottom: moderateScale(100),
      marginBottom: moderateScale(65)
    },
    containerButton: {
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      width: '90%',
      height: moderateScale(60),
      bottom: verticalScale(0),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      display: 'flex'
    },
    addButton: {
      backgroundColor: colors.secondaryOrange,
      width: '100%',
      height: moderateScale(40),
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    },
    containerSpace: {
      backgroundColor: props !== null ? props.gray100 : 'transparent',
      width: '92%',
      margin: moderateScale(10),
      padding: moderateScale(5),
      paddingHorizontal: moderateScale(15),
      borderRadius: moderateScale(10),
      borderWidth: 1,
      alignSelf: 'center',
      borderColor: props !== null ? props.gray200 : '#E5E7EB'
    },
    width100: {
      width: '100%'
    },
    width10: {
      width: '10%'
    },
    titleAddress: {
      flexGrow: 1,
       paddingLeft: moderateScale(20),
      justifyContent: 'center',
      marginTop: -4
    },
    labelStyle: {
      textAlignVertical: 'bottom',
      fontSize: moderateScale(14),
      fontWeight: '700',
      textAlign: 'left'
    },
    midContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    homeIcon: {
      color: props !== null ? props.darkBgFont : '#000',
      width: moderateScale(24),
      height: moderateScale(24),
      display: 'flex',
      justifyContent: 'center'
    },
    addressDetail: {
      width: '80%',
      alignSelf: 'flex-end',
      fontSize: moderateScale(4),
      fontWeight: '300',
      textAlign: 'justify',
      paddingHorizontal: moderateScale(45)
    },
    line: {
      width: '80%',
      alignSelf: 'flex-end',
      borderBottomColor: props !== null ? 'transparent' : 'transparent',
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    buttonsAddress: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 20,
      alignSelf: 'flex-end',
      paddingBottom: moderateScale(3),
      zIndex: 999
    },
    rowContainer: {
      marginTop: moderateScale(5),
      flexDirection: 'row',
      alignItems: 'center', // Adjust this as needed
      // justifyContent: 'space-between'
    },
    footer: {
      flex: 1,
      width: '100%',
      backgroundColor: props !== null ? props.white : 'transparent'
    }
  })
export default styles
