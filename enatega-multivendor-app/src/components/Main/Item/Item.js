import React, { useContext } from 'react'
import { View, Image, TouchableOpacity, Alert } from 'react-native'
import styles from './styles'
import ConfigurationContext from '../../../context/Configuration'
import { useNavigation } from '@react-navigation/native'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'
import { moderateScale } from '../../../utils/scaling'
import { DAYS } from '../../../utils/enums'
import {
  profile,
  FavouriteRestaurant,
  restaurantCustomerAppDetail
} from '../../../apollo/queries'
import { addFavouriteRestaurant } from '../../../apollo/mutations'
import UserContext from '../../../context/User'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/client'
import Spinner from '../../Spinner/Spinner'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import { useTranslation } from 'react-i18next'
import truncate from '../../../utils/helperFun'
import { setRestaurant } from '../../../store/restaurantSlice'
import { useDispatch } from 'react-redux'
import { Text } from 'react-native'

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profile}
`
const FAVOURITERESTAURANTS = gql`
  ${FavouriteRestaurant}
`

const RESTAURANT_DETAILS = gql`
  ${restaurantCustomerAppDetail}
`

function Item(props) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const navigation = useNavigation()
  const {
    profile,
    restaurant: restaurantCart,
    clearCart,
    cart
  } = useContext(UserContext)
  const heart = profile ? profile.favourite.includes(props.item._id) : false
  const item = props.item
  const dispatch = useDispatch()

  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const [mutate, { loading: loadingMutation }] = useMutation(ADD_FAVOURITE, {
    onCompleted,
    refetchQueries: [PROFILE, FAVOURITERESTAURANTS]
  })

  const { isAvailable, openingTimes } = item

  const isOpen = () => {
    const date = new Date()
    const day = date.getDay()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const todaysTimings = openingTimes
      ? openingTimes.find((o) => o.day === DAYS[day])
      : true
    if (todaysTimings === undefined) return false
    const times = todaysTimings?.times?.filter(
      (t) =>
        hours >= Number(t.startTime[0]) &&
        minutes >= Number(t.startTime[1]) &&
        hours <= Number(t.endTime[0]) &&
        minutes <= Number(t.endTime[1])
    )
    return openingTimes ? times?.length > 0 : true
  }

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
  }

  const handleShowRestaurant = () => {
    if (cart?.length && restaurantCart !== item._id) {
      Alert.alert(
        '',
        t('cartClearWarning'),
        [
          {
            text: t('Cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: t('okText'),
            onPress: async () => {
              clearCart()
              navigation.navigate('Restaurant', { ...item })
            }
          }
        ],
        { cancelable: false }
      )
    } else {
      navigation.navigate('Restaurant', { ...item })
    }
    dispatch(setRestaurant({ restaurantId: item._id }))
  }

  const businessCategoriesNames =
    (item?.businessCategories || [])
      .map((cat) => cat.name)
      .filter(Boolean)
      .join(', ') || null

  return (
    <TouchableOpacity
      style={{ padding: moderateScale(10) }}
      activeOpacity={1}
      onPress={handleShowRestaurant}
    >
      <View key={item._id} style={styles().mainContainer}>
        <View
          style={[
            styles(currentTheme).restaurantContainer,
            {
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }
          ]}
        >
          <View style={styles().imageContainer}>
            <Image
              resizeMode='cover'
              source={{ uri: item.image }}
              style={styles().img}
            />
            {!isAvailable || !isOpen() ? (
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  gap: 5
                }}
              >
                <TextDefault bolder style={{ fontSize: 18 }}>
                  {t('closed')}
                </TextDefault>
                <MaterialIcons
                  name='info-outline'
                  size={moderateScale(24)}
                  color='#fff'
                />
              </View>
            ) : null}
          </View>
          <View style={{ ...styles().descriptionContainer }}>
            <View
              style={{
                justifyContent: isArabic ? 'flex-end' : 'flex-start',
                alignItems: isArabic ? 'flex-end' : 'flex-start'
              }}
            >
              <TextDefault
                H4
                numberOfLines={1}
                textColor={currentTheme.fontThirdColor}
                bolder
              >
                {truncate(item.name, 20)}
              </TextDefault>

              <View
                style={[
                  styles().aboutRestaurant,
                  {
                    flexDirection: isArabic ? 'row-reverse' : 'row'
                  }
                ]}
              >
                <Feather
                  name='star'
                  size={moderateScale(18)}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  textColor={currentTheme.fontThirdColor}
                  H4
                  bolder
                  style={{
                    marginLeft: moderateScale(2),
                    marginRight: moderateScale(5)
                  }}
                >
                  {item.reviewAverage}
                </TextDefault>
                <TextDefault
                  textColor={currentTheme.fontNewColor}
                  style={{ marginLeft: moderateScale(2) }}
                  H5
                >
                  ({item.reviewCount})
                </TextDefault>
              </View>
            </View>
            {/* <TextDefault
              style={styles().offerCategoty}
              numberOfLines={1}
              bold
              Normal
              textColor={currentTheme.fontNewColor}
            >
              {item?.tags?.join(',')}
            </TextDefault> */}
            <View>
              <TextDefault
                style={{
                  ...styles().offerCategoty,
                  textAlign: isArabic ? 'right' : 'left'
                }}
                numberOfLines={1}
                bold
                Normal
                textColor={currentTheme.fontNewColor}
              >
                {businessCategoriesNames?.length
                  ? truncate(businessCategoriesNames, 40)
                  : null}
              </TextDefault>
            </View>
            <View
              style={{
                ...styles().priceRestaurant,
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }}
            >
              <View
                style={{
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 5,
                  justifyContent: 'center',
                  marginStart: 18
                }}
              >
                <AntDesign
                  name='clockcircleo'
                  size={moderateScale(16)}
                  color={currentTheme.fontNewColor}
                />
                <TextDefault
                  textColor={currentTheme.fontNewColor}
                  numberOfLines={1}
                  bold
                  Normal
                >
                  {item.deliveryTime + ' '}
                  {t('min')}
                </TextDefault>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 10 }}
              >
                <MaterialIcons
                  name='directions-bike'
                  size={moderateScale(16)}
                  color={'#000'}
                />
                <Text style={{ color: '#000', fontSize: 12 }}>
                  {item.deliveryFee?.amount} {configuration.currency}
                </Text>
              </View>
              {/* <View
                style={{
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'center',
                  marginInlineStart: 10
                }}
              >
                <MaterialIcons
                  name='directions-bike'
                  size={moderateScale(16)}
                  color={currentTheme.fontNewColor}
                />
                <TextDefault
                  style={styles().offerCategoty}
                  textColor={currentTheme.fontNewColor}
                  numberOfLines={1}
                  bold
                  Normal
                >
                  {item.minimumOrder + ' ' + configuration.currencySymbol}
                </TextDefault>
              </View> */}
            </View>
          </View>

          <View style={styles().overlayRestaurantContainer}>
            <TouchableOpacity
              activeOpacity={0}
              disabled={loadingMutation}
              style={
                isArabic
                  ? styles(currentTheme).favOverlayAr
                  : styles(currentTheme).favOverlay
              }
              onPress={() =>
                profile ? mutate({ variables: { id: item._id } }) : null
              }
            >
              {loadingMutation ? (
                <Spinner
                  size={'small'}
                  backColor={'transparent'}
                  spinnerColor={currentTheme.iconColorDark}
                />
              ) : (
                <AntDesign
                  name={heart ? 'heart' : 'hearto'}
                  size={moderateScale(15)}
                  color={heart ? 'red' : 'black'}
                />
              )}
            </TouchableOpacity>
            {(!isAvailable || !isOpen()) && (
              <View style={{ ...styles().featureOverlay, top: 40 }}>
                <TextDefault
                  style={[
                    styles(currentTheme).featureText,
                    {
                      ...alignment.MTxSmall,
                      ...alignment.PLsmall,
                      ...alignment.PRsmall,
                      ...alignment.PTxSmall,
                      ...alignment.PBxSmall
                    }
                  ]}
                  textColor={currentTheme.fontWhite}
                  numberOfLines={1}
                  small
                  bold
                  uppercase
                >
                  {t('Closed')}
                </TextDefault>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Item
