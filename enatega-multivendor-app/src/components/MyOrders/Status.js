import { View } from 'react-native'
import { moderateScale } from '../../utils/scaling'

const Status = ({
  first,
  isEta,
  last,
  isActive,
  firstCol = '#90EA93',
  secondCol = '#C4C4C4'
}) => {
  return (
    <View>
      <View
        style={{
          backgroundColor: isEta ? (isActive ? secondCol : 'grey') : firstCol,
          width: moderateScale(20),
          height: moderateScale(20),
          borderRadius: moderateScale(10),
          marginLeft: 2
        }}
      ></View>
      {!last && (
        <View
          style={{
            width: 25,
            backgroundColor: isEta
              ? isActive
                ? secondCol
                : 'grey'
              : secondCol,
            height: '1px'
          }}
        />
      )}
    </View>
  )
}
export default Status
