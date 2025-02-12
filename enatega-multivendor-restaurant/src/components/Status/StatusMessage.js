const StatusMessage = ({ message, subText }) => {
  return (
    <View style={styles.message}>
      <TextDefault bolder H3>
        {message}
      </TextDefault>
      <TextDefault bold H6 textColor={colors.fontSecondColor}>
        {subText}
      </TextDefault>
    </View>
  )
}
export default StatusMessage
