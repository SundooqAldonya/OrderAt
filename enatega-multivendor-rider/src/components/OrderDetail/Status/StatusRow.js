import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import TextDefault from '../../Text/TextDefault/TextDefault'
import colors from '../../../utilities/colors'
import { openGoogleMaps } from '../../../utilities/callMaps'
import { EvilIcons } from '@expo/vector-icons'
import styles from './style'

const StatusRow = ({
  status,
  time,
  address = null,
  location = null,
  order,
  fillColor = styles.bgSecondary
}) => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const flexDirection = isArabic ? 'row-reverse' : 'row'
  const textAlign = isArabic ? 'right' : 'left'
  const iconMargin = isArabic ? { marginLeft: 10 } : { marginRight: 10 }

  console.log({ location })

  return (
    <TouchableOpacity
      style={[
        styles.statusRow,
        {
          flexDirection,
          alignItems: 'center',
          padding: 12,
          borderRadius: 12,
          backgroundColor: '#f5f5f5',
          marginVertical: 8
        }
      ]}
      onPress={() => {
        if (address) {
          openGoogleMaps({
            latitude: location?.coordinates[1] || null,
            longitude: location?.coordinates[0] || null
          })
        }
      }}>
      {/* Status Dot */}
      <View
        style={[
          styles.circle,
          { backgroundColor: fillColor ? colors.primary : colors.black },
          iconMargin
        ]}
      />

      {/* Status Content */}
      <View style={{ flex: 1, paddingHorizontal: 8 }}>
        <TextDefault
          bolder
          H3
          textColor={fillColor ? colors.primary : colors.black}>
          {status}
        </TextDefault>

        {address && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openGoogleMaps({
                latitude: location?.coordinates[1] || null,
                longitude: location?.coordinates[0] || null
              })
            }
            style={{ flexDirection, alignItems: 'center', marginTop: 4 }}>
            <TextDefault
              bold
              textColor={colors.fontSecondColor}
              style={{ textAlign, flexShrink: 1 }}>
              {/* {address} */}
              {t('click_here_location')}
            </TextDefault>
            <View
              style={{
                backgroundColor: '#ddd',
                borderRadius: 20,
                padding: 4,
                marginLeft: isArabic ? 0 : 8,
                marginRight: isArabic ? 8 : 0
              }}>
              <EvilIcons name="external-link" size={20} color="#333" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Time */}
      <View style={{ paddingLeft: 8, alignSelf: 'flex-start' }}>
        <TextDefault bolder H5 textColor={colors.fontSecondColor}>
          {time}
        </TextDefault>
      </View>
    </TouchableOpacity>
  )
}

export default StatusRow
