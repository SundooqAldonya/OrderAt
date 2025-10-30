import React, { Fragment } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EvilIcons, FontAwesome } from '@expo/vector-icons'
import TextDefault from '../../Text/TextDefault/TextDefault'
import colors from '../../../utilities/colors'
import { callNumber } from '../../../utilities/callNumber'
import { openGoogleMaps } from '../../../utilities/callMaps'

const NewOrderDetails = ({ order }) => {
  console.log({ order })
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  if (!order) return null

  return (
    <View style={styles.container}>
      {/* ===== NOTES ===== */}
      {order?.type === 'delivery_request' && (
        <View style={styles.section}>
          <TextDefault
            bold
            H4
            textColor={colors.primary}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {t('customer_notes')}
          </TextDefault>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {order?.mandoobSpecialInstructions || 'N/A'}
          </TextDefault>
        </View>
      )}
      {/* ===== RESTAURANT SECTION ===== */}
      {order.type !== 'delivery_request' ? (
        <View style={styles.section}>
          <TextDefault
            bold
            H4
            textColor={colors.primary}
            style={{ textAlign: 'center' }}>
            {t('pickup')}
          </TextDefault>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: 'center', marginBottom: 5 }}>
            {order?.restaurant?.name || 'N/A'}
          </TextDefault>

          {/* Navigate */}
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.buttonNavigate}
              onPress={() =>
                openGoogleMaps({
                  latitude: order?.restaurant?.location?.coordinates
                    ? order?.restaurant.location.coordinates[1]
                    : null,
                  longitude: order?.restaurant?.location?.coordinates
                    ? order?.restaurant.location.coordinates[0]
                    : null
                })
              }>
              <EvilIcons name="location" size={22} color={colors.black} />
              <TextDefault bolder H5 textColor={colors.black}>
                {t('navigate')}
              </TextDefault>
            </TouchableOpacity>

            {/* Call */}
            <TouchableOpacity
              style={styles.buttonNumber}
              onPress={() => callNumber(order?.restaurant?.contactNumber)}>
              {/* <EvilIcons name="phone" size={22} color={colors.black} /> */}
              <FontAwesome name="phone" size={18} color="black" />
              <TextDefault bolder H5 textColor={colors.black}>
                {t('call')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <TextDefault
            bold
            H4
            textColor={colors.primary}
            style={{ textAlign: 'center' }}>
            {t('pickup')}
          </TextDefault>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: 'center', marginBottom: 5 }}>
            {order?.user?.name || 'N/A'}
          </TextDefault>

          {/* Navigate */}
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.buttonNavigate}
              onPress={() =>
                openGoogleMaps({
                  latitude: order?.pickupLocation?.coordinates
                    ? order?.pickupLocation.coordinates[1]
                    : null,
                  longitude: order?.pickupLocation?.coordinates
                    ? order?.pickupLocation.coordinates[0]
                    : null
                })
              }>
              <EvilIcons name="location" size={22} color={colors.black} />
              <TextDefault bolder H5 textColor={colors.black}>
                {t('navigate')}
              </TextDefault>
            </TouchableOpacity>

            {/* Call */}
            <TouchableOpacity
              style={styles.buttonNumber}
              onPress={() => callNumber(order?.user?.phone)}>
              {/* <EvilIcons name="phone" size={22} color={colors.black} /> */}
              <FontAwesome name="phone" size={18} color="black" />
              <TextDefault bolder H5 textColor={colors.black}>
                {t('call')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ===== CUSTOMER SECTION ===== */}
      <View style={styles.section}>
        <TextDefault
          bold
          H4
          textColor={colors.primary}
          style={{ textAlign: 'center', marginBottom: 5 }}>
          {t('delivery')}
        </TextDefault>
        {order.type !== 'delivery_request' ? (
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: 'center', marginBottom: 5 }}>
            {order?.user?.name || 'N/A'}
          </TextDefault>
        ) : null}
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={styles.buttonNavigate}
            onPress={() =>
              openGoogleMaps({
                latitude: order?.deliveryAddress?.location?.coordinates
                  ? order.deliveryAddress.location.coordinates[1]
                  : null,
                longitude: order?.deliveryAddress?.location?.coordinates
                  ? order.deliveryAddress.location.coordinates[0]
                  : null
              })
            }>
            <EvilIcons name="location" size={22} color={colors.black} />
            <TextDefault bolder H5 textColor={colors.black}>
              {t('navigate')}
            </TextDefault>
          </TouchableOpacity>

          {/* Phone */}
          {order?.type !== 'delivery_request' ? (
            <TouchableOpacity
              style={styles.buttonNumber}
              onPress={() => callNumber(order?.user?.phone)}>
              {/* <EvilIcons name="phone" size={22} color={colors.black} /> */}
              <FontAwesome name="phone" size={18} color="black" />
              <TextDefault bolder H5 textColor={colors.black}>
                {t('call')}
              </TextDefault>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ===== DELIVERY SECTION ===== */}
      {order.type === 'delivery_request' ? (
        <View style={styles.section}>
          <TextDefault
            bold
            H4
            textColor={colors.primary}
            style={{ textAlign: 'center' }}>
            {t('pickup_section')}
          </TextDefault>

          <TextDefault
            bold
            H5
            textColor={colors.fontSecondColor}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {t('pickup_label')}:
          </TextDefault>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {order?.pickupLabel || 'N/A'}
          </TextDefault>

          <TextDefault
            bold
            H5
            textColor={colors.fontSecondColor}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {t('pickup_details')}:
          </TextDefault>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {order?.pickupAddressFreeText || 'N/A'}
          </TextDefault>
        </View>
      ) : (
        <View style={styles.section}>
          <TextDefault
            bold
            H4
            textColor={colors.primary}
            style={{ textAlign: 'center' }}>
            {t('pickup_section')}
          </TextDefault>

          <TextDefault
            bold
            H5
            textColor={colors.fontSecondColor}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {order?.restaurant?.name}:
          </TextDefault>
          <TextDefault
            bolder
            H5
            textColor={colors.black}
            style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {order?.restaurant?.address || 'N/A'}
          </TextDefault>
        </View>
      )}
      <View style={styles.section}>
        <TextDefault
          bold
          H4
          textColor={colors.primary}
          style={{ textAlign: 'center' }}>
          {t('delivery_section')}
        </TextDefault>

        <TextDefault
          bold
          H5
          textColor={colors.fontSecondColor}
          style={{ textAlign: isArabic ? 'right' : 'left' }}>
          {t('delivery_label')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ textAlign: isArabic ? 'right' : 'left' }}>
          {order?.deliveryAddress?.label || 'N/A'}
        </TextDefault>

        <TextDefault
          bold
          H5
          textColor={colors.fontSecondColor}
          style={{ textAlign: isArabic ? 'right' : 'left' }}>
          {t('delivery_details')}
        </TextDefault>
        <TextDefault
          bolder
          H5
          textColor={colors.black}
          style={{ textAlign: isArabic ? 'right' : 'left' }}>
          {order?.deliveryAddress?.details || 'N/A'}
        </TextDefault>
      </View>
    </View>
  )
}

export default NewOrderDetails

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    gap: 16
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    elevation: 2
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  buttonNumber: {
    marginTop: 5,
    backgroundColor: colors.primary,
    width: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    gap: 5
  },
  buttonNavigate: {
    marginTop: 5,
    backgroundColor: '#FFB100',
    width: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    gap: 5
  }
})
