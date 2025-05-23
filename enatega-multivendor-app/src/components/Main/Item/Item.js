import React, { useContext } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import styles from './styles'
import ConfigurationContext from '../../../context/Configuration'
import { useNavigation } from '@react-navigation/native'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'
import { scale } from '../../../utils/scaling'
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
  const { profile } = useContext(UserContext)
  const heart = profile ? profile.favourite.includes(props.item._id) : false
  const item = props.item

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
    const todaysTimings = openingTimes.find((o) => o.day === DAYS[day])
    if (todaysTimings === undefined) return false
    const times = todaysTimings.times.filter(
      (t) =>
        hours >= Number(t.startTime[0]) &&
        minutes >= Number(t.startTime[1]) &&
        hours <= Number(t.endTime[0]) &&
        minutes <= Number(t.endTime[1])
    )
    return times.length > 0
  }

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
  }
  return (
    <TouchableOpacity
      style={{ padding: scale(10) }}
      activeOpacity={1}
      onPress={() => navigation.navigate('Restaurant', { ...item })}
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
                <MaterialIcons name='info-outline' size={24} color='#fff' />
              </View>
            ) : null}
          </View>
          <View style={{ ...styles().descriptionContainer }}>
            <View
              style={{
                //    flexDirection: isArabic ? 'row-reverse' : 'row',
                justifyContent: isArabic ? 'flex-end' : 'flex-start',
                alignItems: isArabic ? 'flex-end' : 'flex-start'
                // width: '100%'
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
                  size={18}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  textColor={currentTheme.fontThirdColor}
                  H4
                  bolder
                  style={{ marginLeft: scale(2), marginRight: scale(5) }}
                >
                  {item.reviewAverage}
                </TextDefault>
                <TextDefault
                  textColor={currentTheme.fontNewColor}
                  style={{ marginLeft: scale(2) }}
                  H5
                >
                  ({item.reviewCount})
                </TextDefault>
              </View>
            </View>
            <TextDefault
              style={styles().offerCategoty}
              numberOfLines={1}
              bold
              Normal
              textColor={currentTheme.fontNewColor}
            >
              {item?.tags?.join(',')}
            </TextDefault>
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
                  size={16}
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
                  size={16}
                  color={currentTheme.fontNewColor}
                />
                <TextDefault
                  style={styles().offerCategoty}
                  textColor={currentTheme.fontNewColor}
                  numberOfLines={1}
                  bold
                  Normal
                >
                  {/* {configuration.currencySymbol + '' + item.minimumOrder} */}
                  {item.minimumOrder + ' ' + configuration.currencySymbol}
                </TextDefault>
              </View>
            </View>
          </View>

          <View style={styles().overlayRestaurantContainer}>
            <TouchableOpacity
              activeOpacity={0}
              disabled={loadingMutation}
              style={styles(currentTheme).favOverlay}
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
                  size={scale(15)}
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
