import { verticalScale, moderateScale } from '../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
const windowWidth = Dimensions.get('window').width
import { alignment } from '../../utils/alignment'
import { theme } from '../../utils/themeColors'
import { colors } from '../../utils/colors'

const SCREEN_HEIGHT = Dimensions.get('screen').height
const MODAL_HEIGHT = Math.floor(SCREEN_HEIGHT / 4)

const styles = (props = null, hasActiveOrders = false) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    mainItemsContainer: {
      // flexDirection: 'row',
      // justifyContent: 'center',
      gap: moderateScale(20),
      marginTop: moderateScale(16),
      marginBottom: moderateScale(15)
    },
    mainItem: {
      padding: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      width: windowWidth / 2 - 30,
      borderRadius: 16,
      justifyContent: 'space-between'
    },
    popularMenuImg: {
       width: moderateScale(130),
      // aspectRatio: 15 / 8
      height: moderateScale(130),
      marginTop: 15,
      marginInline: 'auto'
    },

    screenBackground: {
      backgroundColor: props != null ? props.themeBackground : '#FFF'
      // backgroundColor:colors.blue
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
      borderColor: props != null ? props.color10 : '#FFF'
    },
    addNewAddressbtn: {
      padding: moderateScale(5),
      ...alignment.PLmedium,
      ...alignment.PRmedium
    },
    addressContainer: {
      width: '100%',
      ...alignment.PTsmall,
      ...alignment.PBsmall
    },
    addButton: {
      backgroundColor: colors.primary,
      // backgroundColor: colors.dark,
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
      alignItems: 'center',
      justifyContent: 'center' // لوسط الزر عموديًا
    },
    content: {
      ...alignment.PTlarge
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

    noDataTextWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    noDataText: {
      fontSize: 18,
      color: colors.dark,
      marginTop: 10
    }
  })
export default styles
