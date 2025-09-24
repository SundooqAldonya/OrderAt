import { Dimensions, StyleSheet } from 'react-native'
const { height } = Dimensions.get('window')
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'

export default StyleSheet.create({
  backgroundImage: {
    height: height * 0.2,
    objectFit: 'cover',
    ...alignment.Mmedium,
    marginTop: 30
  }
})
