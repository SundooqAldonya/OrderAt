import { useNavigation } from '@react-navigation/native'
import React, { useContext } from 'react'
import { TouchableOpacity, View, Image, Text } from 'react-native'
import ConfigurationContext from '../../../context/Configuration'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
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
import { colors } from '../../../utils/colors'

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profile}
`

function PopulerRestaurantCard(props) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const configuration = useContext(ConfigurationContext)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { profile } = useContext(UserContext)
  const heart = profile ? profile.favourite.includes(props._id) : false

  const [mutate, { loading: loadingMutation }] = useMutation(ADD_FAVOURITE, {
    onCompleted,
    refetchQueries: [{ query: PROFILE }]
  })

  const { data, loading, error } = useQuery(isRestaurantOpenNow, {
    variables: {
      id: props._id
    }
  })

  console.log({ data })

  const isOpenNow = data?.isRestaurantOpenNow

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
    // alert("favv list updated")
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

  return (
    <TouchableOpacity
      style={styles(currentTheme).offerContainer}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Restaurant', { ...props })}
    >
      {/* Image Section */}
      <View style={styles(currentTheme).imageContainer}>
        <Image
          resizeMode='cover'
          source={{ uri: props.image }}
          style={styles().restaurantImage}
        />

        {!isOpenNow && (
          <View style={styles().closedOverlay}>
            <MaterialIcons name='info-outline' size={20} color='#fff' />
            <TextDefault bolder style={styles().closedText}>
              {t('closed')}
            </TextDefault>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles(currentTheme).descriptionContainer}>
        <View
          style={{
            ...styles().titleRow,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <TextDefault
            H4
            numberOfLines={1}
            textColor={currentTheme.fontThirdColor}
            bolder
          >
            {truncate(props.name, 15)}
          </TextDefault>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={loadingMutation}
            onPress={handleAddToFavorites}
          >
            <View style={styles(currentTheme).favouriteOverlay}>
              {loadingMutation ? (
                <Spinner
                  size='small'
                  backColor='transparent'
                  spinnerColor={currentTheme.iconColorDark}
                />
              ) : (
                <AntDesign
                  name={heart ? 'heart' : 'hearto'}
                  size={scale(16)}
                  color={heart ? 'red' : currentTheme.iconColor}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Tags & Rating */}
        <View style={styles().tagsRow}>
          <TextDefault
            textColor={currentTheme.fontNewColor}
            numberOfLines={1}
            bold
            Normal
          >
            {props?.tags?.join(',')}
          </TextDefault>

          <View style={styles().ratingContainer}>
            <FontAwesome5
              name='star'
              size={16}
              color={currentTheme.newFontcolor}
            />
            <TextDefault
              textColor={currentTheme.fontThirdColor}
              style={styles().ratingText}
              bolder
              H4
            >
              {props.reviewAverage}
            </TextDefault>
            <TextDefault
              textColor={currentTheme.fontNewColor}
              style={styles().ratingCount}
              H5
            >
              ({props.reviewCount})
            </TextDefault>
          </View>
        </View>
        <View>
          {highestOffer ? (
            <View
              style={{
                backgroundColor: colors.primary,
                width: 'auto',
                borderRadius: 4,
                paddingInline: 10,
                paddingVertical: 4,
                alignSelf: isArabic ? 'flex-end' : 'flex-start'
              }}
            >
              <TextDefault
                style={{
                  color: '#fff',
                  textAlign: isArabic ? 'right' : 'left'
                }}
              >
                {`${t('discounts_until')} ${highestOffer} ${configuration?.currencySymbol} 💰`}
              </TextDefault>
            </View>
          ) : null}
        </View>
        {/* Delivery Info */}
        <View style={styles().deliveryRow}>
          <AntDesign
            name='clockcircleo'
            size={14}
            color={currentTheme.fontNewColor}
          />
          <TextDefault
            textColor={currentTheme.fontNewColor}
            numberOfLines={1}
            bold
            Normal
          >
            {props.deliveryTime + ' '}
            {t('min')}
          </TextDefault>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(PopulerRestaurantCard)
