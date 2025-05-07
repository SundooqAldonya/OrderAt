import { View, Image } from 'react-native'
import React, { useState } from 'react'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'
import { useTranslation } from 'react-i18next'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import { ChatButton } from './ChatButton'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'
import { formatNumber } from '../../../utils/formatNumber'
import Feather from '@expo/vector-icons/Feather'
import { TouchableOpacity } from 'react-native'
import { callNumber } from '../../../utils/callNumber'
import { colors } from '../../../utils/colors'
import { openGoogleMaps } from '../../../utils/callMaps'
import ReviewModal from './ReviewModal'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function Detail({
  _id,
  theme,
  from,
  to,
  orderNo,
  deliveryAddress,
  items,
  currencySymbol,
  subTotal,
  tip,
  tax,
  deliveryCharges,
  total,
  navigation,
  id,
  rider,
  orderStatus,
  type,
  mandoobSpecialInstructions,
  pickupAddress,
  pickupLocation,
  restaurant
}) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const [reviewVisible, setReviewVisible] = useState(false)

  const handleModalClose = () => {
    setReviewVisible(false)
  }

  const handleShowReviewModal = () => {
    setReviewVisible(true)
  }

  return (
    <View style={styles.container(theme)}>
      <ReviewModal
        visible={reviewVisible}
        order={_id}
        onClose={handleModalClose}
      />
      {/* {rider && orderStatus !== ORDER_STATUS_ENUM.DELIVERED && (
        <ChatButton
          onPress={() =>
            navigation.navigate('ChatWithRider', { id, orderNo, total })
          }
          title={t('chatWithRider')}
          description={t('askContactlessDelivery')}
          theme={theme}
        />
      )} */}
      <View
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 4
          }}
        >
          <TextDefault
            textColor={theme.gray500}
            bolder
            H5
            style={{ ...alignment.MBmedium }}
          >
            {t('yourOrder')}
          </TextDefault>
          <TextDefault
            textColor={theme.lightBlue}
            bolder
            H4
            style={{ ...alignment.MBmedium }}
          >
            #{orderNo.toLowerCase()}
          </TextDefault>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#f9f9f9',
            paddingVertical: 5,
            paddingHorizontal: 10,
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 5
          }}
          onPress={handleShowReviewModal}
        >
          <FontAwesome name='star' size={18} color='orange' />
          <TextDefault style={{ color: '#000' }}>{t('add_review')}</TextDefault>
        </TouchableOpacity>
      </View>
      {rider && (
        <View>
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              gap: 10
            }}
          >
            <TextDefault
              bolder
              style={{
                color: '#000',
                textAlign: isArabic ? 'right' : 'left',
                marginBottom: 20,
                fontSize: 16
              }}
            >
              {t('rider_name')}: {rider.name}
            </TextDefault>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              gap: 10
            }}
            onPress={() => callNumber(rider.phone)}
          >
            <TextDefault
              bolder
              style={{
                color: '#000',
                textAlign: isArabic ? 'right' : 'left',
                marginBottom: 20,
                fontSize: 16
              }}
            >
              {t('rider_phone')}: {rider.phone}
            </TextDefault>
            <Feather name='external-link' size={18} color='black' />
          </TouchableOpacity>
        </View>
      )}
      {type && type === 'delivery_request' ? (
        <View style={{ marginBottom: 20 }}>
          <TextDefault
            bolder
            style={{
              color: '#000',
              textAlign: isArabic ? 'right' : 'left',
              fontSize: 16
            }}
          >
            {t('mandoob_instructions')}:
          </TextDefault>
          <TextDefault
            bolder
            style={{
              color: '#000',
              textAlign: isArabic ? 'right' : 'left',
              fontSize: 16
            }}
          >
            {mandoobSpecialInstructions}
          </TextDefault>
        </View>
      ) : null}
      <View style={{ marginVertical: 20 }}>
        <TouchableOpacity
          style={{
            marginBottom: 10,
            backgroundColor: '#f5f5f5',
            gap: 10,
            padding: 10,
            borderRadius: 8
          }}
          onPress={() =>
            openGoogleMaps({
              latitude: pickupLocation.coordinates[1],
              longitude: pickupLocation.coordinates[0]
            })
          }
        >
          <View>
            <TextDefault
              bolder
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {t('pickup')}
            </TextDefault>
            <TextDefault
              bolder
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {restaurant?._id ? restaurant.address : pickupAddress}
            </TextDefault>
          </View>
          <Feather
            name='external-link'
            size={24}
            color='black'
            style={{
              position: 'absolute',
              top: 20,
              left: isArabic ? 8 : 0,
              right: isArabic ? 0 : 8
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginBottom: 10,
            backgroundColor: '#f5f5f5',
            gap: 10,
            padding: 10,
            borderRadius: 8
          }}
          onPress={() =>
            openGoogleMaps({
              latitude: deliveryAddress.location.coordinates[1],
              longitude: deliveryAddress.location.coordinates[0]
            })
          }
        >
          <View>
            <TextDefault
              bolder
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {t('dropoff')}
            </TextDefault>
            <TextDefault
              bolder
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {deliveryAddress.deliveryAddress}
            </TextDefault>
          </View>
          <Feather
            name='external-link'
            size={24}
            color='black'
            style={{
              position: 'absolute',
              top: 20,
              left: isArabic ? 8 : 0,
              right: isArabic ? 0 : 5
            }}
          />
        </TouchableOpacity>
      </View>
      {/* <View>
        <TextDefault
          textColor={theme.gray500}
          bolder
          H4
          style={{
            ...alignment.MBsmall,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('from')}: {from}
        </TextDefault>
      </View>
      <View>
        <TextDefault
          textColor={theme.gray500}
          bolder
          H4
          style={{
            ...alignment.MBsmall,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('to')}: {to}
        </TextDefault>
      </View> */}

      <View
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...alignment.MBsmall
        }}
      >
        <TextDefault textColor={theme.gray500} bolder H5 bold>
          {t('itemsAndQuantity')} ({items.length})
        </TextDefault>
        <TextDefault textColor={theme.gray500} bolder H5 bold>
          {t('price')}
        </TextDefault>
      </View>
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <ItemRow
            key={item._id}
            isArabic={isArabic}
            theme={theme}
            quantity={item.quantity}
            title={`${item.title} ${item.variation.title}`}
            currency={currencySymbol}
            price={item.variation.price}
            options={item.addons.map((addon) =>
              addon.options.map(({ title }) => title)
            )}
            image={item.image}
          />
        ))}
      </View>
    </View>
  )
}
const ItemRow = ({
  theme,
  quantity,
  title,
  options = ['raita', '7up'],
  price,
  currency,
  image,
  isArabic
}) => {
  return (
    <View style={styles.itemRow(theme, isArabic)}>
      <View>
        <Image
          style={{
            width: scale(48),
            height: scale(64),
            borderRadius: scale(8)
          }}
          source={
            image
              ? { uri: image }
              : require('../../../assets/images/food_placeholder.png')
          }
        />
      </View>
      <View style={{ width: '60%', justifyContent: 'center' }}>
        <TextDefault
          left
          numberOfLines={1}
          textColor={theme.gray900}
          H5
          bolder
          style={{
            ...alignment.MBxSmall,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {title}
        </TextDefault>

        {options.length > 0 && (
          <TextDefault
            bold
            textColor={theme.gray600}
            left
            style={{
              ...alignment.MBxSmall,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {options.join(',')}
          </TextDefault>
        )}

        <TextDefault
          Regular
          left
          bolder
          textColor={theme.gray900}
          style={{
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          x{quantity}
        </TextDefault>
      </View>
      <TextDefault
        right
        style={{ width: '15%' }}
        bolder
        textColor={theme.gray900}
        H5
      >
        {formatNumber(price)} {currency}
      </TextDefault>
    </View>
  )
}
