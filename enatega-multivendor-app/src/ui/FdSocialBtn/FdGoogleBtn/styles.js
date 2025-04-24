import { Dimensions, StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { textStyles } from '../../../utils/textStyles'
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
      ...alignment.PLlarge,
      backgroundColor: colors.lightGray
    },

    marginLeft10: {
      ...alignment.MLmedium
    }
  })
export default styles
