import { View, Image } from 'react-native'
import React, { useState } from 'react'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'
import { useTranslation } from 'react-i18next'
import { alignment } from '../../../utils/alignment'
import { moderateScale, scale } from '../../../utils/scaling'
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
import { useMutation, useQuery } from '@apollo/client'
import {
  getRiderOrderReview,
  userHasOrderReview
} from '../../../apollo/queries'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { createRiderReview, reviewOrder } from '../../../apollo/mutations'
import Toast from 'react-native-toast-message'

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
  pickupLabel,
  pickupLocation,
  restaurant,
  originalDeliveryCharges,
  originalPrice,
  originalSubtotal
}) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const [reviewVisible, setReviewVisible] = useState(false)
  const [reviewRiderVisible, setReviewRiderVisible] = useState(false)

  console.log({ riderId: rider })

  const { data, loading, error, refetch } = useQuery(userHasOrderReview, {
    variables: {
      orderId: _id,
      restaurantId: restaurant?._id
    }
    // pollInterval: 10000
  })
  const {
    data: dataRiderReview,
    loading: loadingRiderReview,
    error: errorRiderReview,
    refetch: refetchRiderReview
  } = useQuery(getRiderOrderReview, {
    variables: {
      orderId: _id,
      riderId: rider?._id
    }
    // pollInterval: 10000
  })

  const [mutate] = useMutation(reviewOrder, {
    onCompleted: (data) => {
      console.log({ data })
      Toast.show({
        type: 'success',
        text1: t('added_review'),
        text2: t('added_review_successfully'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      refetch()
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  const [mutateRider] = useMutation(createRiderReview, {
    onCompleted: (data) => {
      console.log({ data })
      Toast.show({
        type: 'success',
        text1: t('added_review'),
        text2: t('added_review_successfully'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      refetchRiderReview()
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  const riderHasReview = dataRiderReview?.getRiderOrderReview || false

  const userHasReview = data?.userHasOrderReview || null

  const handleModalClose = () => {
    setReviewVisible(false)
    setReviewRiderVisible(false)
  }

  const handleShowReviewModal = () => {
    setReviewVisible(true)
  }
  const handleShowReviewRiderModal = () => {
    setReviewRiderVisible(true)
  }

  const callRestaurantReviewMutation = ({ review, rating }) => {
    mutate({
      variables: {
        order: _id,
        rating,
        description: review
      }
    })
  }

  const callRiderReviewMutation = ({ review, rating }) => {
    mutateRider({
      variables: {
        input: {
          rider: rider._id,
          order: _id,
          rating,
          description: review
        }
      }
    })
  }

  return (
    <View style={styles.container(theme)}>
      {type && type !== 'delivery_request' && (
        <ReviewModal
          visible={reviewVisible}
          order={_id}
          onClose={handleModalClose}
          restaurantMutation={callRestaurantReviewMutation}
          restaurant={true}
          title={t('add_review')}
        />
      )}
      {/* for both otlob mandoob and customer restaurant ordering */}
      <ReviewModal
        visible={reviewRiderVisible}
        order={_id}
        onClose={handleModalClose}
        riderReviewMutation={callRiderReviewMutation}
        restaurant={false}
        title={t('add_review_rider')}
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
          <View
            style={
              {
                // flexDirection: isArabic ? 'row-reverse' : 'row',
                // justifyContent: 'space-between',
                // alignItems: 'center'
              }
            }
          >
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
            {type &&
              type !== 'delivery_request' &&
              orderStatus === 'DELIVERED' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: !userHasReview
                      ? colors.primary
                      : '#d3d3d3', // orange if active, grey if disabled
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 25,
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: userHasReview ? 0.7 : 1,
                    marginBottom: 20
                  }}
                  onPress={handleShowReviewModal}
                  disabled={userHasReview}
                >
                  <FontAwesome
                    name={userHasReview ? 'star' : 'star-o'}
                    size={18}
                    color='orange'
                  />
                  <TextDefault
                    style={{ color: userHasReview ? '#000' : '#fff' }}
                  >
                    {userHasReview ? t('review_added') : t('add_review')}
                  </TextDefault>
                  <FontAwesome5
                    name='store'
                    size={24}
                    color={userHasReview ? '#000' : '#fff'}
                  />
                </TouchableOpacity>
              )}
            {orderStatus === 'DELIVERED' && (
              <TouchableOpacity
                style={{
                  backgroundColor: riderHasReview ? '#d3d3d3' : colors.primary, // orange if active, grey if disabled
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 25,
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: riderHasReview ? 0.7 : 1
                }}
                onPress={handleShowReviewRiderModal}
                disabled={riderHasReview}
              >
                <FontAwesome
                  name={riderHasReview ? 'star' : 'star-o'}
                  size={18}
                  color='orange'
                />
                <TextDefault
                  style={{ color: riderHasReview ? '#000' : '#fff' }}
                >
                  {riderHasReview
                    ? t('rider_review_added')
                    : t('add_review_rider')}
                </TextDefault>
                <Ionicons
                  name='bicycle'
                  size={24}
                  color={riderHasReview ? '#000' : '#fff'}
                />
              </TouchableOpacity>
            )}
          </View>
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
            ...sharedStyles.container,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
          onPress={() =>
            openGoogleMaps({
              latitude: pickupLocation.coordinates[1],
              longitude: pickupLocation.coordinates[0]
            })
          }
        >
          <View style={sharedStyles.textContainer}>
            <TextDefault
              bolder
              style={{
                ...sharedStyles.textStyle,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {t('pickup')}
            </TextDefault>
            <TextDefault
              bolder
              style={{
                ...sharedStyles.textStyle,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {restaurant?._id ? restaurant.address : pickupLabel}
            </TextDefault>
          </View>
          <Feather name='external-link' size={22} color='black' />
        </TouchableOpacity>

        {/* dropoff */}
        <TouchableOpacity
          style={{
            ...sharedStyles.container,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
          onPress={() =>
            openGoogleMaps({
              latitude: deliveryAddress.location.coordinates[1],
              longitude: deliveryAddress.location.coordinates[0]
            })
          }
        >
          <View style={sharedStyles.textContainer}>
            <TextDefault
              bolder
              style={{
                ...sharedStyles.textStyle,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {t('dropoff')}
            </TextDefault>
            <TextDefault
              bolder
              style={{
                ...sharedStyles.textStyle,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {deliveryAddress.label}
            </TextDefault>
          </View>
          <Feather name='external-link' size={22} color='black' />
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
            width: moderateScale(48),
            height: moderateScale(64),
            borderRadius: moderateScale(8)
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
      </View>
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
      <TextDefault
        right
        style={{ width: '15%' }}
        bolder
        textColor={theme.gray900}
        H5
      >
        {parseInt(price).toFixed(2)} {currency}
      </TextDefault>
    </View>
  )
}

const sharedStyles = {
  container: {
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    // flexDirection: isArabic ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  textContainer: {
    flex: 1
  },
  textStyle: {
    color: '#000'
    // textAlign: isArabic ? 'right' : 'left'
  }
}
