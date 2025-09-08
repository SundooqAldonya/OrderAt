import { moderateScale } from '../../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'
import { colors } from '../../../utils/colors'
const { height } = Dimensions.get('window')
export const CARD_WIDTH = moderateScale(260)
const styles = (theme) =>
  StyleSheet.create({
    offerContainer: {
      backgroundColor: theme?.cardBackground || '#fff',
      borderRadius: moderateScale(8),
      marginVertical: moderateScale(8),
      marginHorizontal: moderateScale(8),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderColor: '#000',
      width: CARD_WIDTH,
      // height: '100%',
      overflow: 'hidden'
    },
    imageContainer: {
      width: '100%',
      borderTopLeftRadius: moderateScale(14),
      borderTopRightRadius: moderateScale(14),
      height: moderateScale(120),
      backgroundColor: '#f5f5f5'
    },
    restaurantImage: {
      width: '100%',
      height: '100%'
    },
    overlayContainer: {
      position: 'absolute',
      top: moderateScale(10),
      right: moderateScale(10)
    },
    favouriteOverlay: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 50,
      padding: moderateScale(6),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3
    },
    descriptionContainer: {
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(10)
    },
    aboutRestaurant: {
      alignItems: 'center',
      gap: moderateScale(4)
    },
    restaurantRatingContainer: {
      marginLeft: moderateScale(4)
    },
    restaurantTotalRating: {
      fontSize: 12
    },
    deliveryInfo: {
      marginTop: moderateScale(8),
      alignItems: 'center'
    },
    deliveryTime: {
      alignItems: 'center',
      gap: moderateScale(4)
    },
    offerBadge: {
      backgroundColor: theme?.primary || '#FFCC00',
      borderRadius: moderateScale(6),
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      alignSelf: 'flex-start',
      marginTop: moderateScale(6)
    },
    offerBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#000'
    }
  })

export default styles
