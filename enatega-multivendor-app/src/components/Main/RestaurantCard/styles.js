import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (theme) =>
  StyleSheet.create({
    offerContainer: {
      backgroundColor: theme?.cardBackground || '#fff',
      borderRadius: scale(14),
      overflow: 'hidden',
      marginVertical: scale(8),
      marginHorizontal: scale(8),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      width: 200
    },
    imageContainer: {
      width: '100%',
      height: scale(160),
      backgroundColor: '#f5f5f5'
    },
    restaurantImage: {
      width: '100%',
      height: '100%'
    },
    overlayContainer: {
      position: 'absolute',
      top: scale(10),
      right: scale(10)
    },
    favouriteOverlay: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 50,
      padding: scale(6),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3
    },
    descriptionContainer: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(10)
    },
    aboutRestaurant: {
      alignItems: 'center',
      gap: scale(4)
    },
    restaurantRatingContainer: {
      marginLeft: scale(4)
    },
    restaurantTotalRating: {
      fontSize: 12
    },
    deliveryInfo: {
      marginTop: scale(8),
      alignItems: 'center'
    },
    deliveryTime: {
      alignItems: 'center',
      gap: scale(4)
    },
    offerBadge: {
      backgroundColor: theme?.primary || '#FFCC00',
      borderRadius: scale(6),
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
      alignSelf: 'flex-start',
      marginTop: scale(6)
    },
    offerBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#000'
    }
  })

export default styles
