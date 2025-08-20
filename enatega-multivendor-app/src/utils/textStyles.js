import { moderateScale } from './scaling'
import { fontStyles } from './fontStyles'

export const textStyles = {
  H1: {
    fontSize: moderateScale(35)
  },
  H2: {
    fontSize: moderateScale(24)
  },
  H3: {
    fontSize: moderateScale(20)
  },
  H4: {
    fontSize: moderateScale(16)
  },
  H5: {
    fontSize: moderateScale(14)
  },
  Normal: {
    fontSize: moderateScale(12)
  },
  Small: {
    fontSize: moderateScale(10)
  },
  Smaller: {
    fontSize: moderateScale(8)
  },
  Regular: {
    fontFamily: 'Montserrat_400Regular'
  },
  Bold: {
    fontFamily: 'Montserrat_500Medium'
  },
  Bolder: {
    fontFamily: 'Montserrat_700Bold'
  },
  Center: {
    textAlign: 'center'
  },
  Right: {
    textAlign: 'right'
  },
  Left: {
    textAlign: 'left'
  },
  UpperCase: {
    textTransform: 'uppercase'
  },
  LineOver: {
    textDecorationLine: 'line-through'
  },
  B700: {
    fontWeight: '700'
  },

  TextItalic: {
    fontStyle: 'italic',
  }


}
