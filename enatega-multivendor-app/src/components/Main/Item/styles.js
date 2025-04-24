import { verticalScale, scale } from '../../../utils/scaling'
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
      borderWidth: scale(1),
      borderRadius: scale(8),
      backgroundColor: colors.white,
      marginHorizontal: 5,
      borderColor: colors.lightGray,
      width: '100%'
    },
    imageContainer: {
      // position: 'relative',
      // zIndex: 1,
      alignItems: 'center',
      width: '30%'
      // height: '60%'
    },
    img: {
      width: '100%',
      height: '100%',

      borderTopLeftRadius: scale(8),
      borderTopRightRadius: scale(8)
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
      left: 10,
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      backgroundColor: colors.lightGray,
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },

    deliveryRestaurantOverlay: {
      position: 'absolute',
      bottom: 15,
      left: 10,
      width: scale(45),
      height: scale(20),
      borderRadius: scale(10),
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
      // padding: scale(12)
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
