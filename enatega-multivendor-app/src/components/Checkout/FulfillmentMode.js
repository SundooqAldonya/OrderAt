import React from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useStyles } from './styles'
import TextDefault from '../Text/TextDefault/TextDefault'

import DeliveryIcon from '../../assets/SVG/delivery-icon'
import PickupIcon from '../../assets/SVG/pickup-icon'
import { alignment } from '../../utils/alignment'
import { useTranslation } from 'react-i18next'

export const FulfillmentMode = ({ theme, isPickup, setIsPickup }) => {
  const styles = useStyles(theme)
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.ovalContainer}>
        <OvalButton
          theme={theme}
          styles={styles.ovalButton}
          title={t('delivery')}
          selected={!isPickup}
          icon={<DeliveryIcon />}
          onSelect={() => {
            setIsPickup(false)
          }}
        />
        <OvalButton
          theme={theme}
          styles={styles.ovalButton}
          title={t('pickup_option')}
          selected={isPickup}
          icon={<PickupIcon />}
          onSelect={() => {
            setIsPickup(true)
          }}
        />
      </View>
    </View>
  )
}

const OvalButton = ({
  theme,
  selected = false,
  title,
  icon,
  onSelect,
  styles
}) => (
  <Pressable
    onPress={onSelect}
    style={[
      styles,
      {
        backgroundColor: selected ? theme.white : null
      }
    ]}
  >
    <View style={alignment.MxSmall}>{icon}</View>
    <TextDefault H4={selected} H5={!selected} bold textColor={theme.color4}>
      {title}
    </TextDefault>
  </Pressable>
)
