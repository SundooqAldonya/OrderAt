import { Dimensions, Platform } from 'react-native'
import { colors } from '../../utilities'
const { width, height } = Dimensions.get('window')

const createStyles = isLandscape => ({
  topContainer: {
    backgroundColor: colors.white,
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  lowerContainer: {
    backgroundColor: colors.white,
    shadowColor: colors.fontSecondColor,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    flex: 0.7,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  scrollView: {
    backgroundColor: 'transparent'
    // marginBottom: Platform === 'ios' ? height * 0.1 : height * 0.1
  },
  hamburger: {
    // backgroundColor: 'red',
    width: 30,
    height: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'absolute',
    top: isLandscape ? 50 : 80,
    left: 30
  },
  line: {
    height: 2,
    backgroundColor: '#000',
    width: '100%'
  }
})

export default createStyles
