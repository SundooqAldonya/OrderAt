import { View } from 'react-native'

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
          width: 20,
          height: 20,
          borderRadius: 10
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
