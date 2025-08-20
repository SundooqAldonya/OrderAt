import { verticalScale, moderateScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { theme } from '../../utils/themeColors'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    width85: {
      width: '70%'
      //backgroundColor: theme.Pink.deleteButton
    },
    shadow: {
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowColor: theme.Pink.black,
      shadowOpacity: 0.3,
      shadowRadius: moderateScale(1),
      elevation: 5,
      borderWidth: 0.4,
      borderColor: '#e1e1e1'
    },
    backButton: {
      backgroundColor: theme.Pink.white,
      borderRadius: moderateScale(50),
      width: moderateScale(40),
      alignItems: 'flex-start',
      marginLeft: moderateScale(5)
    },
    mainContainerArea: {
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      borderRadius: moderateScale(30),
      shadowOffset: { width: 0 },
      shadowColor: theme.Pink.black,
      shadowOpacity: 0.1,
      marginTop: moderateScale(20)
    },
    mainContainer: {
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      ...alignment.PLxSmall,
      ...alignment.PRxSmall,
      ...alignment.PTmedium
    },
    languageContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.gray100 : '#FFF',
      borderRadius: moderateScale(10),
      borderWidth: 1,
      flexDirection: 'row',
      alignSelf: 'center',
      borderColor: props !== null ? props.gray200 : '#E5E7EB',
      ...alignment.PRmedium,
      ...alignment.PTlarge,
      ...alignment.PBlarge,
      ...alignment.PLmedium
    },
    changeLanguage: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingInline: 0,
      width: '100%',
      ...alignment.MBsmall
    },
    button: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-end'
    },
    notificationContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      ...alignment.PTmedium,
      ...alignment.PBmedium,
      ...alignment.PRsmall,
      ...alignment.PLsmall,
      ...alignment.MTxSmall
    },
    notificationChekboxContainer: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    buttonContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    deleteButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(10),
      borderRadius: moderateScale(6),
      backgroundColor: theme.Pink.deleteButton
    },
    deleteButtonText: {
      color: 'white',
      fontSize: moderateScale(18),
      fontWeight: '600'
    },
    versionContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      ...alignment.MTlarge
    },
    modalContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.themeBackground : '#FFF',
      borderRadius: verticalScale(4),
      ...alignment.Plarge,
      borderColor: props !== null ? props.gray200 : '#E5E7EB',
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(10)
    },
    radioContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.themeBackground : '#FFF',
      flexDirection: 'row',
      alignItems: 'center',
      ...alignment.PTxSmall,
      ...alignment.PBxSmall
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end'
    },
    modalButtons: {
      ...alignment.Msmall,
      marginBottom: 0,
      ...alignment.PTxSmall,
      ...alignment.PBxSmall
    },
    checkboxSettings: {
      marginBottom: moderateScale(10)
    }
  })

export default styles
