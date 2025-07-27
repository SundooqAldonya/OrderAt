import colors from '../../utilities/colors'
import { Dimensions, Platform } from 'react-native'
import { alignment } from '../../utilities/alignment'
const { height } = Dimensions.get('window')
export default {
  flex: {
    flex: 1
  },
  bgColor: {
    backgroundColor: colors.themeBackground
  },
  scrollContainer: {
    justifyContent: 'top',
    ...alignment.PTlarge
  },
  container: {
    width: '100%',
    alignSelf: 'center',
    height: height * 1.2
  },
  image: {
    alignSelf: 'center',
    height: 150,
    width: 250,
    ...alignment.MBlarge,
    ...alignment.MTmedium
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
    ...alignment.MTlarge
  },
  signInText: {
    marginTop: 50,
    marginBottom: 50
  },
  textInput: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundGray || '#F9F9F9',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 12,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    // Android elevation
    elevation: 2,

    fontSize: 16,
    color: colors.textPrimary || '#000',

    // marginTop or external spacing
    ...alignment.MTlarge
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 12,
    alignSelf: 'center'
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: Platform.OS === 'ios' ? 20 : 30, // adjust based on your TextInput padding
    color: colors.primary,
    padding: 5
  },
  btn: {
    width: '70%',
    height: height * 0.06,
    alignItems: 'center',
    backgroundColor: colors.black,
    color: colors.white,
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: height * 0.15
  },
  pt5: {
    paddingTop: 5
  },
  pt15: {
    paddingTop: 12
  },
  error: {
    marginLeft: '10%',
    ...alignment.MTxSmall
  },
  errorInput: {
    borderColor: colors.textErrorColor
  }
}
