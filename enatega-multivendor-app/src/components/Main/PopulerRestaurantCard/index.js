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

  return (
    <TouchableOpacity
      style={styles(currentTheme).offerContainer}
      activeOpacity={1}
      onPress={() => navigation.navigate('Restaurant', { ...props })}
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
        </View>
      </View>

      <View
        style={{
          ...styles().descriptionContainer
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
            {truncate(props.name, 15)}
          </TextDefault>

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
                    size={scale(15)}
                    color={heart ? 'red' : currentTheme.iconColor}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <TextDefault
            textColor={currentTheme.fontNewColor}
            numberOfLines={1}
            bold
            Normal
            // style={styles().offerCategoty}
          >
            {props?.tags?.join(',')}
          </TextDefault>

          <View
            style={{
              ...styles().aboutRestaurant,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <FontAwesome5
              name='star'
              size={18}
              color={currentTheme.newFontcolor}
            />

            <TextDefault
              textColor={currentTheme.fontThirdColor}
              style={styles().restaurantRatingContainer}
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
        </View>
        <View
          style={{
            ...styles().deliveryInfo,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <View style={styles().deliveryTime}>
            <AntDesign
              name='clockcircleo'
              size={16}
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
          {/* <View style={styles().deliveryTime}>
            <MaterialCommunityIcons
              name='bike'
              size={16}
              color={currentTheme.fontNewColor}
            />

            <TextDefault
              textColor={currentTheme.fontNewColor}
              numberOfLines={1}
              bold
              Normal
            >
              {configuration.currency} {props.tax}
            </TextDefault>
          </View> */}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(PopulerRestaurantCard)
