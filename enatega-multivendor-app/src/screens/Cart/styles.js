import { moderateScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },

    pT10: {
      ...alignment.PTsmall
    },
    locationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    mB10: {
      ...alignment.MBsmall
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
    dealContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      borderRadius: moderateScale(10),
      ...alignment.PLsmall,
      ...alignment.PRsmall
    },
    totalOrder: {
      marginBottom: moderateScale(12)
    },
    termsContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.backgroundColor : 'transparent',
      borderRadius: moderateScale(5),
      ...alignment.PLsmall,
      ...alignment.PRsmall
    },
    itemContainer: {
      width: '100%',
      backgroundColor: props !== null ? props.backgroundColor : 'transparent'
    },
    priceContainer: {
      width: '100%',
      borderRadius: moderateScale(20),
      borderBottomColor:
        props !== null ? props.lightHorizontalLine : 'transparent',
      ...alignment.PLsmall,
      ...alignment.PRsmall
    },
    modal: {
      backgroundColor: props != null ? props.themeBackground : '#FFF',
      borderTopEndRadius: moderateScale(20),
      borderTopStartRadius: moderateScale(20),
      shadowOpacity: 0
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
      borderBottomColor: props !== null ? props.black : 'black',
      borderBottomWidth: StyleSheet.hairlineWidth
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
      marginVertical: moderateScale(10)
    },
    suggestItemPrice: {
      marginTop: moderateScale(5)
    },
    addToCart: {
      width: moderateScale(25),
      height: moderateScale(25),
      borderRadius: moderateScale(12.5),
      backgroundColor: props !== null ? props.newFontcolor : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center'
    },
    totalBillContainer: {
      width: '100%',
      height: '15%',
      backgroundColor: props !== null ? props.newheaderColor : '#90E36D',
      ...alignment.PLlarge,
      ...alignment.PRlarge
    },
    cartAmount: {
      width: '50%'
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
      // paddingTop: moderateScale(28)
    },
    button: {
      backgroundColor: '#111827',
      justifyContent: 'center',
      alignItems: 'center',
      width: moderateScale(140),
      height: moderateScale(40),
      borderRadius: 40
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
    tipRow: {
      // justifyContent: 'space-between',
      alignItems: 'center',
      ...alignment.MBxSmall
    },
    buttonInline: {
      width: '100%',
      flexDirection: 'row'
    },
    labelButton: {
      marginRight: 10,
      borderRadius: moderateScale(10),
      width: '22%',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: props !== null ? props.horizontalLine : 'transparent',
      justifyContent: 'center',
      height: moderateScale(30)
    },
    activeLabel: {
      marginRight: 10,
      borderRadius: moderateScale(10),
      backgroundColor: props !== null ? props.main : 'transparent',
      width: '22%',
      //borderWidth: 2,
      justifyContent: 'center',
      color: props !== null ? props.tagColor : 'transparent',
      borderColor: props !== null ? props.tagColor : 'transparent',
      height: moderateScale(30)
    },
    headerContainer: {
      backgroundColor: props !== null ? props.themeBackground : '#6FCF97',
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      ...alignment.PLsmall,
      ...alignment.PRlarge,
      ...alignment.PBsmall
    },
    location: {
      ...alignment.PLsmall,
      ...alignment.PRsmall
    },
    cartInnerContainer: {
      ...alignment.MTxSmall
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
    locationIcon: {
      backgroundColor: props != null ? props.newBorderColor : '#E5E7EB',
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: moderateScale(10),
      borderWidth: 1,
      borderColor: props?.iconBackground || '#E5E7EB'
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
