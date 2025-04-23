import { verticalScale, scale } from '../../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'
import { colors } from '../../../utils/colors'
const { height } = Dimensions.get('window')
const styles = (props = null) =>
  StyleSheet.create({
    // ML20: {
    //   ...alignment.MLlarge
    // },
    offerScroll: {
      height: height * 0.376,
      width: '100%'
    },
    ItemTitle: {
      ...alignment.MRmedium
    },
    ItemDescription: {
      fontWeight: '400',
      marginTop: scale(5),
      marginBottom: scale(7),
      ...alignment.MRmedium
    },
    orderAgainSec: {
      marginBottom: scale(30),
      flex: 1,
      height: 270,
      ...alignment.MLmedium
    },
    topPicksSec: {
      ...alignment.MLmedium,
      marginBottom: scale(30)
    },
    margin: {
      ...alignment.MLmedium,
      ...alignment.MBmedium
    },
    screenBackground: {
      backgroundColor: props != null ? props.themeBackground : '#FFF'
    },
    placeHolderFadeColor: {
      backgroundColor: props != null ? props.fontSecondColor : '#B8B8B8'
    },
    placeHolderContainer: {
      backgroundColor: props != null ? props.cartContainer : '#B8B8B8',
      borderRadius: scale(3),
      elevation: scale(3),
      marginBottom: scale(12),
      padding: scale(12)
    },
    height200: {
      height: scale(200)
    },
    image: {
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      marginHorizontal: 5,
      paddingHorizontal: 5
    },
    image1: {
      width: 30,
      height: 30
    }
  })

export default styles
