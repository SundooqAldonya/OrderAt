import { TouchableOpacity, View } from 'react-native'
import { TextDefault } from '../Text'
import styles from './style'
import { useTranslation } from 'react-i18next'
import { colors } from '../../utilities'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { openGoogleMaps } from '../../utilities/callMaps'
// import AntDesign from 'react-native-vector-icons/AntDesign'

const StatusRow = ({
  status,
  time,
  address = null,
  location = null,
  order,
  fillColor = styles.bgSecondary
}) => {
  console.log({ time })
  const { i18n } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  return (
    <View
      style={[
        styles.statusRow,
        { flexDirection: isArabic ? 'row-reverse' : 'row' }
      ]}>
      <View
        style={[
          styles.circle,
          fillColor ? styles.bgPrimary : styles.bgSecondary,
          isArabic ? { marginInlineStart: 10 } : {}
        ]}
      />
      <View style={styles.statusOrder}>
        <TextDefault
          bolder
          H3
          textColor={fillColor ? colors.primary : colors.white}>
          {status}
        </TextDefault>
        {address ? (
          <View>
            <TouchableOpacity
              onPress={() =>
                openGoogleMaps({
                  latitude: location.coordinates[1],
                  longitude: location.coordinates[0]
                })
              }>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                <TextDefault
                  bold
                  textColor={colors.white}
                  style={{ textAlign: isArabic ? 'right' : 'left' }}>
                  {address}
                </TextDefault>
                <EvilIcons
                  size={24}
                  name="external-link"
                  style={{ color: '#fff', backgroundColor: 'gray' }}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <View style={styles.time}>
        <TextDefault bolder H5 textColor={colors.fontSecondColor}>
          {time}
        </TextDefault>
      </View>
    </View>
  )
}

export default StatusRow
