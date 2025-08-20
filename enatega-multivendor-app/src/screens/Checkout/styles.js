import { verticalScale, moderateScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { fontStyles } from '../../utils/fontStyles'
import { colors } from '../../utils/colors'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },

    pT10: {
      ...alignment.PTsmall
    },

    mB10: {
      ...alignment.MBsmall
    },
    map: {
      width: '100%',
      height: '100%'
    },
    width100: {
      width: '100%'
    },
    width30: {
      width: '30%'
    },
    screenBackground: {
      backgroundColor: props != null ? props.themeBackground : '#FFF'
    },
    mainContainer: {
      flex: 1,
      backgroundColor: props !== null ? props.themeBackground : 'transparent'
      //...alignment.PTsmall
    },
    paymentSecInner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      ...alignment.MTxSmall
    },
    totalOrder: {
      color: props != null ? props.fontNewColor : '#6B7280',
      marginBottom: moderateScale(12)
    },
    termsContainer: {
      ...alignment.PLmedium,
      ...alignment.PRmedium
    },
    tipSec: {
      ...alignment.MLmedium,
      ...alignment.MRmedium,
      marginVertical: moderateScale(22)
    },
    tipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(8)
    },
    itemContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.backgroundColor : 'transparent'
    },
    priceContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      borderRadius: moderateScale(20),
      borderBottomColor:
        props !== null ? props.lightHorizontalLine : 'transparent',
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      marginVertical: moderateScale(13)
    },
    modal: {
      backgroundColor: props != null ? props.themeBackground : '#FFF',
      borderTopEndRadius: moderateScale(20),
      borderTopStartRadius: moderateScale(20),
      shadowOpacity: 0,
      paddingTop: 24,
      paddingBottom: 24,
      paddingLeft: 16,
      paddingRight: 16
    },
    overlay: {
      backgroundColor: props !== null ? props.backgroundColor2 : 'transparent'
    },
    handle: {
      width: 150,
      backgroundColor: props !== null ? props.hex : '#b0afbc'
    },
    floatView: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center'
    },
    floatLeft: {
      width: '30%',
      textAlign: 'left'
    },
    floatRight: {
      width: '70%',
      textAlign: 'right'
    },
    horizontalLine: {
      borderWidth: 0.5,
      borderColor: props !== null ? props.iconBackground : 'white'
    },
    horizontalLine2: {
      marginVertical: moderateScale(11)
    },
    deliveryTime: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: moderateScale(5),
      ...alignment.PLxSmall
    },

    suggestedItems: {
      paddingBottom: moderateScale(30),
      ...alignment.PLlarge
    },
    suggestItemDesciption: {
      ...alignment.PRlarge
    },
    suggestItemImg: {
      width: '100%',
      // aspectRatio: 18/8,
      height: moderateScale(70)
    },
    suggestItemContainer: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 12,
      padding: moderateScale(8),
      width: moderateScale(120),
      marginTop: moderateScale(14)
    },
    suggestItemImgContainer: {
      backgroundColor: '#F3F4F6',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: moderateScale(4)
    },
    suggestItemName: {
      marginVertical: moderateScale(5)
    },
    suggestItemPrice: {
      marginTop: moderateScale(5)
    },
    addToCart: {
      width: moderateScale(25),
      height: moderateScale(25),
      borderRadius: moderateScale(12.5),
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center'
    },

    buttonContainer: {
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      ...alignment.PBlarge,
      paddingVertical: moderateScale(10),
      marginBottom: moderateScale(15)
    },
    changeBtn: {
      backgroundColor: props !== null ? props.main : 'gray',
      justifyContent: 'center',
      alignItems: 'center',
      width: moderateScale(100),
      height: moderateScale(30),
      borderRadius: 40
    },
    changeBtnInner: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5
    },
    button: {
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      height: moderateScale(50),
      borderRadius: 40
      // borderColor: props !== null ? props.black : 'black'
    },
    buttonDisabled: {
      backgroundColor: 'gray'
      // borderWidth: 1
      // borderColor: props !== null ? props.black : 'black'
    },

    // totalBill:{
    //   fontSize:moderateScale(27)
    // },
    // buttontLeft: {
    //   width: '35%',
    //   height: '50%',
    //   justifyContent: 'center'
    // },
    // buttonLeftCircle: {
    //   backgroundColor: props != null ? props.black : 'black',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   width: moderateScale(18),
    //   height: moderateScale(18),
    //   borderRadius: moderateScale(9)
    // },
    // iconStyle: {
    //   height: verticalScale(18),
    //   width: verticalScale(18)
    // },
    subContainerImage: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center'
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.MBlarge
    },
    image: {
      width: moderateScale(100),
      height: moderateScale(100)
    },
    descriptionEmpty: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.Plarge
    },
    emptyButton: {
      backgroundColor: props !== null ? props.newheaderColor : 'transparent',
      width: '70%',
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    },
    placeHolderContainer: {
      backgroundColor: props != null ? props.cartContainer : '#B8B8B8',
      borderRadius: 3,
      elevation: 3,
      marginBottom: 12,
      padding: 12
    },
    placeHolderFadeColor: {
      backgroundColor: props != null ? props.gray : '#B8B8B8'
    },
    height100: {
      height: 100
    },
    height60: {
      height: 60
    },
    trashIcon: {
      backgroundColor: 'red',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    trashContainer: {
      ...alignment.PLmedium,
      ...alignment.MBxSmall,
      justifyContent: 'center',
      alignItems: 'center',
      width: '20%'
    },

    buttonInline: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between'
      // gap:moderateScale(8),
    },
    labelButton: {
      borderRadius: moderateScale(40),
      width: '23%',
      borderWidth: 1,
      borderColor: props !== null ? props.iconBackground : 'transparent',
      backgroundColor: props !== null ? props.color5 : 'transparent',
      justifyContent: 'center',
      height: moderateScale(37)
    },
    activeLabel: {
      borderRadius: moderateScale(40),
      backgroundColor: props !== null ? props.main : 'transparent',
      width: '23%',
      justifyContent: 'center',
      borderColor: props !== null ? props.main : 'transparent',
      height: moderateScale(37)
    },
    headerContainer: {
      backgroundColor: props !== null ? props.themeBackground : '#6FCF97'
    },
    mapView: {
      height: moderateScale(119)
    },
    marker: {
      width: 50,
      height: 50,
      position: 'absolute',
      top: '50%',
      left: '50%',
      zIndex: 1,
      translateX: -25,
      translateY: -25,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ translateX: -25 }, { translateY: -25 }]
    },
    voucherSec: {
      ...alignment.PLmedium,
      ...alignment.PRmedium
    },
    voucherSecInner: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(5),
      marginTop: moderateScale(10),
      marginBottom: moderateScale(10)
    },
    paymentSec: {
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      marginTop: moderateScale(13)
    },

    imageContainer: {
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    cartInnerContainer: {
      marginTop: 4,
      padding: 6,
      backgroundColor: props != null ? props.black : '#B8B8B8',
      width: '50%',
      borderRadius: 6
    },
    couponContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end'
    },
    tipContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    billsec: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    changeAddressContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    changeAddressBtn: {
      borderRadius: moderateScale(10),
      backgroundColor: props != null ? props.main : '#B8B8B8',
      width: '40%',
      justifyContent: 'center',
      alignItems: 'center',
      height: moderateScale(30)
    },
    addressAllignment: {
      // display: 'flex',
      // flexDirection: 'column',
      // // justifyContent: 'flex-end',
      width: '100%',
      marginLeft: moderateScale(15)
    },
    addressDetailAllign: {
      width: '65%',
      display: 'flex',
      alignItems: 'flex-end'
    },
    modalContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 24
    },
    modalHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    modalheading: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5
    },
    modalInput: {
      height: moderateScale(60),
      borderWidth: 1,
      borderColor: props != null ? props.verticalLine : '#B8B8B8',
      padding: 10,
      borderRadius: 6,
      fontSize: moderateScale(14),
      color: props !== null ? props.newFontcolor : '#f9f9f9'
    },
    labelContainer: {
      width: '80%'
    },
    iconContainer: {
      flex: 1,
      padding: moderateScale(2)
    },
    icon: {
      backgroundColor: props != null ? props.iconBackground : '#E5E7EB',
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center'
    },
    pickupButton: {
      backgroundColor: props !== null ? props.color3 : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      height: moderateScale(40),
      borderRadius: 40,
      borderWidth: 1,
      borderColor: props !== null ? props.borderColor : 'black',
      width: '70%',
      alignSelf: 'center'
    },
    applyButton: {
      fontSize: 20,
      fontWeight: '500',
      color: props != null ? props.newFontcolor : '#E5E7EB'
    }
  })
export default styles
