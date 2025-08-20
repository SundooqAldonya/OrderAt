import { verticalScale, moderateScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    safeAreaViewStyles: {
      flex: 1,
      backgroundColor: props !== null ? props.headerBackground : 'transparent'
    },
    container: {
      flex: 1,
      backgroundColor: props !== null ? props.themeBackground : 'transparent'
    },
    contentContainer: {
      flexGrow: 1,
      ...alignment.PBsmall
    },
    subContainerImage: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center',
      ...alignment.PBlarge
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.MBxSmall
    },
    image: {
      width: moderateScale(130),
      height: moderateScale(130)
    },
    descriptionEmpty: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.Plarge
    },
    emptyButton: {
      width: '85%',
      padding: moderateScale(10),
      backgroundColor: props !== null ? props.buttonBackground : 'grey',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: moderateScale(10)
    },
    subContainer: {
      flex: 1,
      backgroundColor: props !== null ? props.cartContainer : '#FFF',
      borderRadius: moderateScale(10),
      elevation: 3,
      shadowColor: 'black',
      shadowOffset: {
        width: 0,
        height: verticalScale(1)
      },
      shadowOpacity: 0.5,
      shadowRadius: verticalScale(1),
      flexDirection: 'row',
      justifyContent: 'space-between',
      ...alignment.MRsmall,
      ...alignment.MLsmall,
      ...alignment.MTsmall,
      ...alignment.PTxSmall,
      ...alignment.PBxSmall,
      ...alignment.PRsmall,
      ...alignment.PLxSmall
    },
    restaurantImage: {
      height: '100%',
      width: '28%',
      borderRadius: 10
    },
    textContainer: {
      width: '58%',
      ...alignment.PTsmall,
      //...alignment.PBlarge,
      ...alignment.PLsmall
    },
    subContainerLeft: {
      width: '100%'
    },
    subContainerRight: {
      ...alignment.PTsmall,
      width: '15%',
      justifyContent: 'space-between'
    },
    subContainerButton: {
      backgroundColor: props !== null ? props.buttonBackground : 'grey',
      ...alignment.MTxSmall,
      borderRadius: 10,
      width: moderateScale(80),
      height: verticalScale(25),
      alignItems: 'center',
      justifyContent: 'center'
    },
    subContainerReviewButton: {
      backgroundColor: props !== null ? props.secondaryBackground : 'grey',
      ...alignment.MTxSmall,
      borderRadius: 10,
      width: moderateScale(80),
      height: verticalScale(25),
      alignItems: 'center',
      justifyContent: 'center'
    },
    rateOrderContainer: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: moderateScale(10),
      marginBottom: moderateScale(10),
      justifyContent: 'space-around',
      alignItems: 'flex-end'
    },
    backBtnContainer: {
      backgroundColor: 'white',
      borderRadius: moderateScale(50),
      marginLeft: moderateScale(10),
      width: moderateScale(55),
      alignItems: 'center'
    },
    tabContainer: {
      width: '100%',
      height: moderateScale(45),
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: props !== null ? props.newheaderBG : 'transparent'
    },
    activeTabStyles: {
      width: '45%',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: props !== null ? props.newheaderColor : 'transparent',
    },
    inactiveTabStyles: {
      width: '45%',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent'
    }
  })

export default styles
