import { Dimensions, StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'
const { height } = Dimensions.get('window')

const styles = (props = null) =>
  StyleSheet.create({
    mainContainer: {
      width: '90%',
      alignSelf: 'center',
      height: height * 0.06,
      flexDirection: 'row',
      alignItems: 'center',
      ...alignment.PRlarge,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      borderRadius: scale(16),
      // borderWidth: scale(1),
      borderColor: props !== null ? props.newIconColor : '#9B9A9A',
      backgroundColor:colors.lightGray,
      ...alignment.PLlarge
    },
    marginLeft5: {
      ...alignment.MLsmall
    },
    marginLeft10: {
      ...alignment.MLmedium
    }
  })
export default styles
