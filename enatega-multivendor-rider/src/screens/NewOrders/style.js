import colors from '../../utilities/colors'
import { Dimensions, Platform } from 'react-native'
import { alignment } from '../../utilities/alignment'
const { height } = Dimensions.get('window')

const styles = {
  flex: {
    flex: 1
  },
  container: {
    height: '100%',
    width: '100%'
  },
  innerContainer: {
    height: height * 1,
    backgroundColor: colors.themeBackground,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: colors.headerText,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 13.0,
    elevation: 24,
    alignItems: 'center',
    ...alignment.MTlarge
  },
  ordersContainer: {
    height: height,
    marginBottom: Platform.OS === 'ios' ? height * 0.4 : height * 0.35,
    ...alignment.MTlarge
  },
  margin500: {
    marginTop: -500
  },
  hamburger: {
    width: 30,
    height: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 70,
    left: 40
  },
  line: {
    height: 2,
    backgroundColor: '#000',
    width: '100%'
  },
  btn: {
    backgroundColor: '#000',
    width: 300,
    height: 50,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 'auto'
  },
  btnText: {
    color: '#fff',
  }
}

export default styles
