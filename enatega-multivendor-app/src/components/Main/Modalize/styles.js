import { verticalScale, moderateScale } from '../../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
const windowWidth = Dimensions.get('window').width
import { alignment } from '../../../utils/alignment'
import { colors } from '../../../utils/colors'

const SCREEN_HEIGHT = Dimensions.get('screen').height
const MODAL_HEIGHT = Math.floor(SCREEN_HEIGHT / 4)

const styles = (props = null, hasActiveOrders = false) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    mainItemsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: moderateScale(20),
      marginTop: moderateScale(16),
      marginBottom: moderateScale(30)
    },
    mainItem: {
      padding: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      width: windowWidth / 2 - 30,
      borderRadius: 8,
      justifyContent: 'space-between'
    },
    popularMenuImg: {
      width: '100%',
      // aspectRatio: 15 / 8
      height: moderateScale(90)
    },

    screenBackground: {
      backgroundColor: props != null ? props.themeBackground : '#FFF',
      ...alignment.PBlarge
    },
    mainContentContainer: {
      width: '100%',
      height: '100%',
      alignSelf: 'center'
    },
    searchbar: {
      backgroundColor: props != null ? props.main : 'black',
      ...alignment.PBmedium
    },

    addressbtn: {
      backgroundColor: props != null ? props.color8 : '#f0f0f0',
      marginLeft: moderateScale(10),
      marginRight: moderateScale(10),
      marginBottom: moderateScale(10),
      borderRadius: moderateScale(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: moderateScale(5),
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(20),
      borderColor: props != null ? props.color10 : '#FFF',
      flex: 1
    },
    addNewAddressbtn: {
      padding: moderateScale(5),
      ...alignment.PLmedium,
      ...alignment.PRmedium
    },
    addressContainer: {
      width: '95%',
      ...alignment.PTsmall,
      ...alignment.PBsmall
    },
    addButton: {
      backgroundColor: colors.primary,
      width: '100%',
      height: moderateScale(40),
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    },
    addressSubContainer: {
      width: '90%',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center'
    },
    content: {
      ...alignment.PTlarge
    },

    addressTextContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    addressTick: {
      width: '10%',
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginRight: moderateScale(5)
    },
    addressbtn: {
      backgroundColor: props ? props.color8 : '#f0f0f0',
      marginHorizontal: moderateScale(10),
      marginBottom: moderateScale(10),
      borderRadius: moderateScale(20),
      borderWidth: moderateScale(1),
      borderColor: props ? props.color10 : '#FFF',
      padding: moderateScale(12),
      flexDirection: 'column', // changed from 'row'
      gap: moderateScale(8)
    },

    addressSubContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: moderateScale(10)
    },

    homeIcon: {
      color: props ? props.darkBgFont : '#000',
      width: moderateScale(24),
      height: moderateScale(24),
      alignItems: 'center',
      justifyContent: 'center'
    },

    titleAddress: {
      flex: 1,
      justifyContent: 'center'
    },

    labelStyle: {
      textAlignVertical: 'bottom',
      fontSize: moderateScale(14),
      fontWeight: '700',
      textAlign: 'left'
    },

    addressTextContainer: {
      flexDirection: 'row'
    },

    addressDetail: {
      flex: 1,
      fontSize: moderateScale(12),
      fontWeight: '300',
      textAlign: 'right',
      paddingHorizontal: moderateScale(10),
    },

    addressTick: {
      position: 'absolute',
      top: moderateScale(10),
      end: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center'
    },
    modal: {
      backgroundColor: props != null ? props.themeBackground : '#FFF',
      paddingTop: moderateScale(10),
      borderTopEndRadius: moderateScale(20),
      borderTopStartRadius: moderateScale(20),
      position: 'relative',
      zIndex: 999,
      shadowOpacity: 0,
      borderWidth: moderateScale(1),
      borderColor: props != null ? props.color10 : '#FFF'
    },
    overlay: {
      backgroundColor:
        props != null ? props.backgroundColor2 : 'rgba(0, 0, 0, 0.5)'
    },
    handle: {
      width: moderateScale(150),
      backgroundColor: props != null ? props.backgroundColor : 'transparent'
    },
    relative: {
      position: 'relative'
    },
    placeHolderContainer: {
      backgroundColor: props != null ? props.cartContainer : '#B8B8B8',
      borderRadius: moderateScale(3),
      elevation: moderateScale(3),
      marginBottom: moderateScale(12),
      padding: moderateScale(12)
    },
    brandsPlaceHolderContainer: {
      backgroundColor: props != null ? props.cartContainer : '#B8B8B8',
      borderRadius: moderateScale(3),
      paddingHorizontal: moderateScale(20)
    },
    height200: {
      height: moderateScale(200)
    },
    height80: {
      height: moderateScale(80)
    },
    placeHolderFadeColor: {
      backgroundColor: props != null ? props.fontSecondColor : '#B8B8B8'
    },
    emptyViewContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    emptyViewBox: {
      backgroundColor: props != null ? props.newBackground : '#f0f0f0',
      borderRadius: moderateScale(10),
      width: '85%',
      height: verticalScale(130),
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(15),
      marginTop: moderateScale(30),
      borderColor: props !== null ? props.gray200 : '#E5E7EB',
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(10)
    },
    searchList: {
      marginBottom: 70
    },
    mL5p: {
      ...alignment.MLsmall
    },
    homeIcon: {
      color: props !== null ? props.darkBgFont : '#000',
      width: '15%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    titleAddress: {
      width: '55%',
      justifyContent: 'center',
      marginTop: -6
    },
    labelStyle: {
      textAlignVertical: 'bottom',
      fontSize: moderateScale(14),
      fontWeight: '700',
      textAlign: 'left'
    },
    addressDetail: {
      alignSelf: 'flex-end',
      fontSize: moderateScale(4),
      fontWeight: '300',
      textAlign: 'justify',
      paddingLeft: moderateScale(38)
    },
    topBrandsMargin: {
      marginBottom: hasActiveOrders ? MODAL_HEIGHT : 0
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      padding: moderateScale(16),
      maxHeight: '80%',
      minHeight: moderateScale(200)
    }
  })
export default styles
