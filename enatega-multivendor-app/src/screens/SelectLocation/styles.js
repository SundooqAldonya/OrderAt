import { moderateScale, scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
const { StyleSheet, I18nManager } = require('react-native')
const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    mapView: {
      // height: '50%',
      flex: 1
      // marginBottom: scale(-20)
    },
    container: {
      flex: 1,
      height: '50%',
      overflow: 'visible',
      justifyContent: 'space-around',
      borderTopLeftRadius: scale(30),
      borderTopRightRadius: scale(30),
      backgroundColor: props !== null ? props.themeBackground : '#f5f5f5',
      borderWidth: scale(1),
      borderColor: '#DAD6D6',
      paddingTop: scale(20),
      paddingBottom: scale(20)
    },
    container2: {
      flex: 1,
      height: '100%',
      overflow: 'visible',
      justifyContent: 'space-around',
      // borderTopLeftRadius: scale(30),
      // borderTopRightRadius: scale(30),
      backgroundColor: props !== null ? props.themeBackground : '#f5f5f5',
      borderWidth: scale(1),
      borderColor: '#DAD6D6',
      padding: scale(25)
    },
    heading: {
      paddingLeft: scale(20),
      ...alignment.MBlarge,
      ...alignment.MRmedium,
      textAlign: 'center'
    },
    button: {
      width: '95%',
      height: 40,
      alignItems: 'center',
      alignSelf: 'center',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      textAlign: 'auto',
      paddingLeft: scale(20),
      paddingRight: scale(20),
      marginTop: scale(10),
      marginBottom: scale(10),
      borderRadius: 20
    },
    dropdownContainer: {
      borderWidth: 1,
      borderColor: '#DAD6D6',
      borderRadius: 8,
      height: '18%',
      overflow: 'hidden',
      justifyContent: 'center'
    },
    button1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10
    },
    cityField: {
      fontSize: scale(12),
      color: props != null ? props.newFontcolor : '#E5E7EB'
    },
    icon1: {
      // marginLeft: 10,
      marginHorizontal: 10
      // marginHorizontal: I18nManager.isRTL ? 10 : 'row-reverse',
    },
    textInput: {
      width: '95%',
      height: 90, // Fixed height
      alignSelf: 'center',
      justifyContent: 'center',
      paddingHorizontal: moderateScale(10),
      marginTop: moderateScale(15),
      marginBottom: moderateScale(15),
      borderWidth: 1,
      borderColor: props != null ? props.borderBottomColor : '#E5E7EB',
      borderRadius: moderateScale(8),
      padding: 10,
      marginVertical: 10
    },
    overlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)'
    },
    icon: {
      backgroundColor: props != null ? props.iconBackground : '#E5E7EB',
      height: scale(30),
      width: scale(30),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: scale(15),
      marginRight: scale(16)
      //  marginHorizontal: scale(16)
      // marginRight: I18nManager.isRTL ? scale(16) : 'row-reverse',
    },
    line: {
      borderBottomWidth: scale(1),
      borderBottomColor: props != null ? props.borderBottomColor : '#DAD6D6',
      width: '100%'
    },
    emptyButton: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: 50,
      backgroundColor: props !== null ? props.main : 'transparent',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: scale(28)
      // marginTop: scale(50)
    },
    disabledButton: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: 50,
      backgroundColor: 'gray',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: scale(28)
      // marginTop: scale(50)
    },
    mainContainer: {
      width: scale(50),
      height: scale(50),
      position: 'absolute',
      top: '46%',
      left: '50%',
      zIndex: 1,
      translateX: scale(-25),
      translateY: scale(-25),
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ translateX: scale(-25) }, { translateY: scale(-25) }]
    },

    locationContainer: {
      justifyContent: 'space-around',
      paddingVertical: 15,
      marginHorizontal: 10
    },
    locationButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1.5,
      borderRadius: 4
    },
    buttonText: {
      paddingHorizontal: 5,
      fontSize: 15
    },
    icon: {
      // marginLeft: isArabic ? 0 : 5,
      // marginRight: isArabic ? 5 : 0,
    },
    markerContainer: {
      flexDirection: 'column',
      alignSelf: 'flex-start'
    },
    markerBubble: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      backgroundColor: '#06C167', // لون أخضر مشابه لأوبر
      padding: 8,
      borderRadius: 8,
      borderColor: '#fff',
      borderWidth: 1
    },
    markerText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold'
    },
    markerArrow: {
      backgroundColor: 'transparent',
      borderWidth: 8,
      borderColor: 'transparent',
      borderTopColor: '#06C167',
      alignSelf: 'center',
      marginTop: -1
    },

    // deliveryMarker: {
    //   alignItems: 'center',
    //   justifyContent: 'center'
    // },
    markerBubble: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      transform: [{ translateX: '-45%' }]
    },
    markerText: {
      color: '#fff',
      fontSize: moderateScale(10),
      fontWeight: 'bold',
      textAlign: 'center'
    },
    markerPin: {
      width: 24,
      height: 24,
      backgroundColor: '#fff',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#fff',
      transform: [{ translateY: -8 }],
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5
    },
    pinInner: {
      width: 12,
      height: 12,
      borderRadius: 6
    },
    solidButton: {
      backgroundColor: '#06C167',
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginVertical: 8,
      marginHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      elevation: 3, // Android
      shadowColor: '#000', // iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },

    buttonIcon: {
      marginRight: 8
    }
  })
export default styles
