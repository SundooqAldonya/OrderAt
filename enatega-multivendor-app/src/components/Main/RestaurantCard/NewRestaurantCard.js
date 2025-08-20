import { useNavigation } from '@react-navigation/native'
import React, { useContext } from 'react'
import { TouchableOpacity, View, Image, Text, Alert } from 'react-native'
import ConfigurationContext from '../../../context/Configuration'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { alignment } from '../../../utils/alignment'
import { moderateScale, scale } from '../../../utils/scaling'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { addFavouriteRestaurant } from '../../../apollo/mutations'
import UserContext from '../../../context/User'
import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { isRestaurantOpenNow, profile } from '../../../apollo/queries'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import Spinner from '../../Spinner/Spinner'
import truncate from '../../../utils/helperFun'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Chip } from 'react-native-paper'
import { colors } from '../../../utils/colors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setRestaurant } from '../../../store/restaurantSlice'
import { useDispatch } from 'react-redux'

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profile}
`

function NewRestaurantCard(props) {
  const dispatch = useDispatch()
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const configuration = useContext(ConfigurationContext)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { profile } = useContext(UserContext)
  const heart = profile ? profile.favourite.includes(props._id) : false
  const businessCategoriesNames =
    (props?.businessCategories || [])
      .map((cat) => cat.name)
      .filter(Boolean)
      .join(', ') || null
  const [mutate, { loading: loadingMutation }] = useMutation(ADD_FAVOURITE, {
    onCompleted,
    refetchQueries: [{ query: PROFILE }]
  })

  console.log({ categories: props.categories })

  const { data, loading, error } = useQuery(isRestaurantOpenNow, {
    variables: {
      id: props._id
    }
  })

  console.log({ data })

  const isOpenNow = data?.isRestaurantOpenNow

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
  }

  const handleAddToFavorites = () => {
    if (!loadingMutation && profile) {
      mutate({ variables: { id: props._id } })
    }
  }

  function getCategoriesWithHighestDiscount() {
    let highest = 0

    if (props?.categories) {
      props?.categories?.forEach((category) => {
        category.foods?.forEach((food) => {
          food.variations?.forEach((variation) => {
            if (variation.discounted && variation.discounted > highest) {
              highest = variation.discounted
            }
          })
        })
        console.log({ highest })
      })
    }
    return highest
  }

  const highestOffer = getCategoriesWithHighestDiscount() || null

  // console.log({ highestOffer: getCategoriesWithHighestDiscount() })

  return (
    <TouchableOpacity
      style={styles(currentTheme).offerContainer}
      activeOpacity={1}
      onPress={async () => {
        dispatch(setRestaurant({ restaurantId: props._id }))
        navigation.navigate('Restaurant', { ...props })
      }}
    >
      <View style={styles().imageContainer}>
        <View
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <Image
            resizeMode='cover'
            source={{ uri: props.image }}
            style={styles().restaurantImage}
          />
          {!isOpenNow ? (
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
              <MaterialIcons name='info-outline' size={24} color='#fff' />
            </View>
          ) : null}
          {/* AddToFavorites */}
          <View style={styles().overlayContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={loadingMutation}
              onPress={handleAddToFavorites}
            >
              <View style={styles(currentTheme).favouriteOverlay}>
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
                    color={heart ? 'red' : currentTheme.iconColor}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View
        style={{
          ...styles().descriptionContainer,
          gap: props.businessCategories?.length ? 10 : 30
        }}
      >
        <View
          style={{
            ...styles().aboutRestaurant,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <TextDefault
            H4
            numberOfLines={1}
            textColor={currentTheme.fontThirdColor}
            bolder
          >
            {/* {props.name} */}
            {truncate(props.name, 15)}
          </TextDefault>

          {props.reviewCount >= 5 ? (
            <View
              style={{
                ...styles().aboutRestaurant,
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }}
            >
              <FontAwesome5
                name='star'
                size={moderateScale(11)}
                color={currentTheme.newFontcolor}
              />

              <TextDefault
                textColor={currentTheme.fontThirdColor}
                style={{ fontSize: moderateScale(12) }}
                bolder
                H4
              >
                {props.reviewAverage}
              </TextDefault>
              <TextDefault
                textColor={currentTheme.fontNewColor}
                style={[
                  styles().restaurantRatingContainer,
                  styles().restaurantTotalRating
                ]}
                H5
              >
                ({props.reviewCount})
              </TextDefault>
            </View>
          ) : (
            <TextDefault
              textColor={currentTheme.fontNewColor}
              style={[
                styles().restaurantRatingContainer,
                styles().restaurantTotalRating
              ]}
              H5
            >
              ({t('new')})
            </TextDefault>
          )}
        </View>
        {/* tags */}
        {businessCategoriesNames?.length ? (
          <View>
            <TextDefault
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {businessCategoriesNames?.substring(0, 60)}...
            </TextDefault>
          </View>
        ) : null}
        {highestOffer ? (
          <View
            style={{
              backgroundColor: colors.primary,
              width: '100%',
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 6,
              justifyContent: 'center',
              alignSelf: isArabic ? 'flex-end' : 'flex-start'
            }}
          >
            <TextDefault
              style={{ color: '#fff', textAlign: isArabic ? 'right' : 'left' }}
            >
              {`${t('discounts_until')} ${highestOffer} ${configuration?.currencySymbol} 💰`}
            </TextDefault>
          </View>
        ) : null}

        {/* <View
          style={{
            ...styles().deliveryInfo,
            flexDirection: isArabic ? 'row-reverse' : 'row',
            justifyContent: 'space-between'
          }}
        >
          <View
            style={[
              styles().deliveryTime,
              {
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }
            ]}
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
              {props.deliveryTime + ' + '}
              {t('min')}
            </TextDefault>
          </View>
        </View> */}
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(NewRestaurantCard)
