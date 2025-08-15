import { verticalScale, scale } from '../../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'
import { colors } from '../../../utils/colors'
const { height, width } = Dimensions.get('window')
const styles = (props = null) =>
  StyleSheet.create({
    offerContainer: {
      borderRadius: 16,
      marginHorizontal: 12,
      marginVertical: 8,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
      overflow: 'hidden',
      width: scale(350)
    },

    imageContainer: {
      height: scale(170),
      borderTopLeftRadius: scale(16),
      borderTopRightRadius: scale(16),
      overflow: 'hidden'
    },

    restaurantImage: {
      width: '100%',
      height: '100%'
    },

    closedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    },

    closedText: {
      fontSize: 16,
      color: '#fff'
    },

    descriptionContainer: {
      paddingVertical: scale(10),
      paddingHorizontal: scale(12),
      borderTopWidth: 1,
      borderColor: props?.iconBackground || '#E5E7EB',
      backgroundColor: '#fff'
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4
    },

    favouriteOverlay: {
      padding: 6,
      borderRadius: 20,
      backgroundColor: props?.menuBar || '#F9FAFB'
    },

    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6
    },

    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },

    ratingText: {
      paddingLeft: scale(3)
    },

    ratingCount: {
      paddingLeft: scale(2)
    },

    deliveryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    }
  })

export default styles
