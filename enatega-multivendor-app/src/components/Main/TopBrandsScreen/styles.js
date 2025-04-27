import { verticalScale, scale } from '../../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'
import { colors } from '../../../utils/colors'
const { height, width } = Dimensions.get('window')

const styles = (props = null) =>
  StyleSheet.create({
    topbrandsSec: {
      ...alignment.PLmedium
    },
    topbrandsHeading: {
      ...alignment.PRmedium
    },
    brandImg: {
      width: '100%',
      height: scale(200),
      height: '100%',
      borderRadius: 8,
     },
    topbrandsContainer: {
      flex: 1,
      width: width - 30,
      marginTop: scale(7),
      marginBottom: scale(15)
    },
    brandImgContainer: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      height: scale(200),

      // padding:scale(8),
    },
    brandName: {
      marginTop: scale(5),
      marginBottom: scale(2)
    },
    margin: {
      ...alignment.MLmedium,
      ...alignment.MBmedium
    },
    screenBackground: {
      backgroundColor: props != null ? props.themeBackground : '#FFF',
      ...alignment.PBlarge
    },
    placeHolderFadeColor: {
      backgroundColor: props != null ? props.fontSecondColor : '#B8B8B8'
    },
    brandsPlaceHolderContainer: {
      backgroundColor: props != null ? props.cartContainer : '#B8B8B8',
      borderRadius: scale(3),
      paddingHorizontal: scale(20)
    },
    height80: {
      height: scale(80)
    },
    image: {
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      marginHorizontal: 5,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center'
    },
    image1: {
      // width: 30,
      // height: 30
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
