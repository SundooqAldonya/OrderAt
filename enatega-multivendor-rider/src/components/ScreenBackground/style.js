import colors from '../../utilities/colors'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utilities/alignment'

export default StyleSheet.create({
  flex: {
    flex: 1
  },
  bgColor: {
    backgroundColor: colors.themeBackground
  },
  container: {
    width: '100%',
    alignSelf: 'center',
    flex: 1
  },
  image: {
    alignSelf: 'center',
    height: 150,
    width: 250,
    ...alignment.MBlarge,
    ...alignment.MTmedium
  },
  walletImage: {
    alignSelf: 'center',
    height: 240,
    width: 250,
    ...alignment.MBlarge,
    ...alignment.MTmedium
  },
  innerContainer: {
    backgroundColor: colors.white,
    flex: 1,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    shadowColor: colors.fontSecondColor,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    position: 'absolute',
    zIndex: 999,
    backgroundColor: colors.black,
    borderRadius: 7,
    ...alignment.MLmedium
  },
  hamburger: {
    width: 60,
    height: 40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: 30,
    zIndex: 9999, // ensure it's on top
    elevation: 9999
    // backgroundColor: 'red'
    // padding: 8
  },
  toggleContainer: {
    width: 30,
    height: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 70,
    right: 40
  },

  line: {
    height: 2,
    backgroundColor: '#000',
    width: '100%'
  }
})
