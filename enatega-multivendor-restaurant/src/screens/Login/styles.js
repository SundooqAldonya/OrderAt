import { StyleSheet, Dimensions, Platform } from 'react-native'
import { colors, scale } from '../../utilities'
const { height, fontScale, width } = Dimensions.get('window')
const XSMALL = 5
const SMALL = 10
const MEDIUM = 15
const LARGE = 20
const alignment = {
  MxSmall: {
    margin: scale(XSMALL)
  },
  MBxSmall: {
    marginBottom: scale(XSMALL)
  },
  MTxSmall: {
    marginTop: scale(XSMALL)
  },
  MRxSmall: {
    marginRight: scale(XSMALL)
  },
  MLxSmall: {
    marginLeft: scale(XSMALL)
  },

  Msmall: {
    margin: scale(SMALL)
  },
  MBsmall: {
    marginBottom: scale(SMALL)
  },
  MTsmall: {
    marginTop: scale(SMALL)
  },
  MRsmall: {
    marginRight: scale(SMALL)
  },
  MLsmall: {
    marginLeft: scale(SMALL)
  },

  Mmedium: {
    margin: scale(MEDIUM)
  },
  MBmedium: {
    marginBottom: scale(MEDIUM)
  },
  MTmedium: {
    marginTop: scale(MEDIUM)
  },
  MRmedium: {
    marginRight: scale(MEDIUM)
  },
  MLmedium: {
    marginLeft: scale(MEDIUM)
  },
  Mlarge: {
    margin: scale(LARGE)
  },
  MBlarge: {
    marginBottom: scale(LARGE)
  },
  MTlarge: {
    marginTop: scale(LARGE)
  },
  MRlarge: {
    marginRight: scale(LARGE)
  },
  MLlarge: {
    marginLeft: scale(LARGE)
  },

  // Padding
  PxSmall: {
    padding: scale(XSMALL)
  },
  PBxSmall: {
    paddingBottom: scale(XSMALL)
  },
  PTxSmall: {
    paddingTop: scale(XSMALL)
  },
  PRxSmall: {
    paddingRight: scale(XSMALL)
  },
  PLxSmall: {
    paddingLeft: scale(XSMALL)
  },

  Psmall: {
    padding: scale(SMALL)
  },
  PBsmall: {
    paddingBottom: scale(SMALL)
  },
  PTsmall: {
    paddingTop: scale(SMALL)
  },
  PRsmall: {
    paddingRight: scale(SMALL)
  },
  PLsmall: {
    paddingLeft: scale(SMALL)
  },

  Pmedium: {
    padding: scale(MEDIUM)
  },
  PBmedium: {
    paddingBottom: scale(MEDIUM)
  },
  PTmedium: {
    paddingTop: scale(MEDIUM)
  },
  PRmedium: {
    paddingRight: scale(MEDIUM)
  },
  PLmedium: {
    paddingLeft: scale(MEDIUM)
  },

  Plarge: {
    padding: scale(LARGE)
  },
  PBlarge: {
    paddingBottom: scale(LARGE)
  },
  PTlarge: {
    paddingTop: scale(LARGE)
  },
  PRlarge: {
    paddingRight: scale(LARGE)
  },
  PLlarge: {
    paddingLeft: scale(LARGE)
  }
}
const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  scrollContainer: {
    justifyContent: 'center'
  },
  topContainer: {
    backgroundColor: colors.white,
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bgColor: {
    backgroundColor: colors.white
  },
  lowerContainer: {
    width: width,
    backgroundColor: colors.green,
    flex: 7,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    zIndex: 9999999999999999

    // alignItems:'center'
  },
  headingText: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputStyle: {
    borderBottomWidth: 0,
    borderRadius: 8,
    height: 50,
    width: '100%',
    backgroundColor: colors.white,
    zIndex: 999999999999999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3
  },
  textInput: {
    padding: 15,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#66666610',
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 999,
    shadowColor: colors.fontSecondColor,
    shadowOffset: {
      width: 0,
      height: 2
    },
    color: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
    ...alignment.MTlarge
  },
  passwordField: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row'
  },
  eyeBtn: {
    display: 'flex',
    zIndex: 1,
    elevation: 999,
    marginTop: Platform.OS === 'ios' ? 33 : 37,
    marginLeft: -40,
    color: colors.primary
  },
  eyeBtnAr: {
    display: 'flex',
    zIndex: 1,
    elevation: 999,
    marginTop: Platform.OS === 'ios' ? 33 : 37,
    marginRight: -40,
    color: colors.primary
  },
  btn: {
    width: '70%',
    height: height * 0.06,
    alignItems: 'center',
    backgroundColor: colors.black,
    color: colors.white,
    alignSelf: 'center',
    zIndex: 999999999999999,
    borderRadius: 10,
    marginTop: height * 0.15
  },
  testBtn: {
    backgroundColor: colors.startColor,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10
  }
})
export default styles
