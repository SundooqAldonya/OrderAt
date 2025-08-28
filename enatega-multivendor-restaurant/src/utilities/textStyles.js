import { scale } from './scaling'
import { fontStyles } from './fontStyles'
import { ScaledSheet, moderateScale } from 'react-native-size-matters'

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
  xSmall: {
    fontSize: moderateScale(8)
  },
  Regular: {
    fontFamily: 'Montserrat_400Regular'
  },
  Bold: {
    fontFamily: 'Montserrat_600SemiBold'
  },
  Bolder: {
    fontFamily: 'Montserrat_800ExtraBold'
  },
  Center: {
    textAlign: 'center'
  },
  Right: {
    textAlign: 'right'
  },
  UpperCase: {
    textTransform: 'uppercase'
  },
  LineOver: {
    textDecorationLine: 'line-through'
  }
}
