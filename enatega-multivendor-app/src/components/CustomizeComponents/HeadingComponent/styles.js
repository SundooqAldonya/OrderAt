import { StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
const styles = StyleSheet.create({
  topContainer: {
    paddingHorizontal: 10,
    ...alignment.MTsmall
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  priceContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...alignment.MTsmall,
    ...alignment.MBsmall
  },
  descContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
    ...alignment.MBsmall
  }
})
export default styles
