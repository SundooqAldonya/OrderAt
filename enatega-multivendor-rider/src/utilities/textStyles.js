import { scale } from './scaling'
import { fontStyles } from './fontStyles'

export const textStyles = {
  XL: {
    fontSize: scale(55)
  },
  H1: {
    fontSize: scale(35)
  },
  H2: {
    fontSize: scale(24)
  },
  H3: {
    fontSize: scale(20)
  },
  H4: {
    fontSize: scale(16)
  },
  H5: {
    fontSize: scale(14)
  },
  Normal: {
    fontSize: scale(12)
  },
  Small: {
    fontSize: scale(10)
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
  UpperCase: {
    textTransform: 'uppercase'
  },
  LineOver: {
    textDecorationLine: 'line-through'
  }
}
