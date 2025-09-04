import { moderateScale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'

import { alignment } from '../../../utils/alignment'
import { StyleSheet } from 'react-native'

const styles = (props = null) =>
  StyleSheet.create({
    mainContainer: {
      width: '100%',
      alignItems: 'center'
    },
    restaurantContainer: {
      flex: 1,
      alignItems: 'flex-end',
      padding: 10,
      // borderWidth: moderateScale(1),
      borderRadius: moderateScale(8),
      backgroundColor: colors.white,
      marginHorizontal: 5,
      borderColor: colors.lightGray,
      width: '100%',
      // iOS shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,

      // Android shadow
      elevation: 3,
      overflow: 'hidden'
    },
    imageContainer: {
      // position: 'relative',
      // zIndex: 1,
      alignItems: 'center',
      width: '30%',
      // height: '60%',
      overflow: 'hidden',
      borderRadius: moderateScale(8)
    },
    img: {
      width: '100%',
      height: '100%'
    },
    // overlayRestaurantContainer: {
    //   position: 'absolute',
    //   // justifyContent: 'space-between',
    //   top: 0,
    //   left: 0,
    //   height: '100%'
    //   // width: '100%'
    // },
    overlayRestaurantContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%', // خليها لو عايز يغطي العرض
      height: '100%', // أو غيرها حسب اللي انت محتاجه
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },

    favOverlay: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(15),
      backgroundColor: colors.lightGray,
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    favOverlayAr: {
      position: 'absolute',
      top: 10,
      left: 10,
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(15),
      backgroundColor: colors.lightGray,
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },

    deliveryRestaurantOverlay: {
      position: 'absolute',
      bottom: 15,
      left: 10,
      width: moderateScale(45),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      backgroundColor: props != null ? props.menuBar : 'white',
      zIndex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    aboutRestaurant: {
      alignItems: 'center'
      // justifyContent: 'flex-start'
    },
    descriptionContainer: {
      // width: '100%',
      width: '60%',
      marginHorizontal: 5
      // padding: moderateScale(12)
    },
    offerCategoty: {
      ...alignment.MTxSmall,
      ...alignment.MBxSmall
    },
    priceRestaurant: {
      alignItems: 'center',
      flexDirection: 'row'
    },
    verticalLine: {
      height: '60%',
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: props != null ? props.horizontalLine : 'black',
      opacity: 0.6,
      ...alignment.MLxSmall,
      ...alignment.MRxSmall
    },
    featureOverlay: {
      height: '90%',
      position: 'absolute',
      left: 0,
      top: 10,
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    featureText: {
      alignSelf: 'flex-start',
      maxWidth: '100%',
      backgroundColor: props != null ? props.tagColor : 'black'
    }
  })
export default styles
