import React, { useContext, useLayoutEffect, useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { styles } from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import { scale } from '../../utils/scaling'
import { HeaderBackButton } from '@react-navigation/elements'
import { MaterialIcons } from '@expo/vector-icons'
import { alignment } from '../../utils/alignment'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import StarRating from '../../assets/SVG/small-star-icon'
import Button from '../../components/Button/Button'
import ReviewCard from '../../components/Review/ReviewCard'
import {
  calculateDaysAgo,
  groupAndCount,
  sortReviews
} from '../../utils/customFunctions'
import { useQuery } from '@apollo/client'
import { getReviews } from '../../apollo/queries'

const Reviews = ({ navigation, route }) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const restaurant = route.params.restaurantObject
  console.log({ restaurant })

  const { data, loading, error } = useQuery(getReviews, {
    variables: {
      restaurant: restaurant?._id
    },
    skip: !restaurant,
    pollInterval: 10000
  })

  console.log({ data })
  console.log('here in the reviews screen')

  // const reviews = restaurant && restaurant.reviews ? restaurant.reviews : null
  const reviews = data?.reviews || null

  let reviewGroups

  if (reviews) {
    reviewGroups = groupAndCount(reviews, 'rating')
  }
  const [sortBy, setSortBy] = useState('newest')
  const sortingParams = {
    newest: t('Newest'),
    highest: t('HighestRating'),
    lowest: t('LowestRating')
  }
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <TextDefault H4 bold textColor={currentTheme.newFontcolor}>
            {t('ratingAndreviews')}
          </TextDefault>
          <TextDefault
            H5
            style={{ ...alignment.MTxSmall }}
            textColor={currentTheme.newFontcolor}
          >
            {restaurant.restaurantName}
          </TextDefault>
        </View>
      ),
      headerRight: null,
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={styles.backImageContainer}>
              <MaterialIcons
                name='arrow-back'
                size={30}
                color={currentTheme.newIconColor}
              />
            </View>
          )}
          onPress={() => {
            navigation.goBack()
          }}
        />
      )
    })
  }, [navigation])

  let sorted

  if (reviews) {
    sorted = sortReviews([...reviews], sortBy)
  }

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.themeBackground }}>
      <ScrollView style={[styles.container]}>
        <View>
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              ...alignment.MTsmall,
              ...alignment.MBsmall
            }}
          >
            <TextDefault bold H3 textColor={currentTheme.newFontcolor}>
              {t('allRatings')} ({restaurant.total})
            </TextDefault>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <StarRating />
              <TextDefault bold H3 textColor={currentTheme.newFontcolor}>
                {restaurant.average}
              </TextDefault>
            </View>
          </View>
          <View>
            {reviews
              ? Object.keys(reviewGroups)
                  .sort((a, b) => b - a)
                  .map((i, index) => {
                    const filled = (reviewGroups[i] / restaurant.total) * 100
                    const unfilled = filled ? 100 - filled : 100
                    return (
                      <View
                        key={`${index}-rate`}
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row',
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                          marginVertical: scale(5)
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-end'
                          }}
                        >
                          <TextDefault> {i} </TextDefault>
                          <StarRating isFilled={true} />
                        </View>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            marginHorizontal: scale(10)
                          }}
                        >
                          <View
                            style={{
                              height: scale(5),
                              width: filled ? `${filled}%` : '0%',
                              backgroundColor: currentTheme.orange
                            }}
                          />
                          <View
                            style={{
                              height: scale(5),
                              width: `${unfilled}%`,
                              backgroundColor: currentTheme.borderLight
                            }}
                          />
                        </View>
                        <View style={{ width: '10%', alignItems: 'flex-end' }}>
                          <TextDefault bolder textColor={currentTheme.gray700}>
                            {filled ? parseInt(filled) : 0}%
                          </TextDefault>
                        </View>
                      </View>
                    )
                  })
              : null}
          </View>
        </View>
        <View style={{ ...alignment.MTsmall }}>
          <TextDefault
            textColor={currentTheme.gray900}
            H3
            bold
            style={{ textAlign: isArabic ? 'right' : 'left' }}
          >
            {t('titleReviews')}
          </TextDefault>
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              ...alignment.MTsmall,
              gap: 20
            }}
          >
            {Object.keys(sortingParams).map((key) => (
              <TouchableOpacity onPress={() => setSortBy(key)}>
                <Button
                  key={key}
                  textProps={{ textColor: currentTheme.color4 }}
                  buttonProps={{ onPress: () => setSortBy(key) }}
                  text={sortingParams[key]}
                  textStyles={{ color: currentTheme.newFontcolor }}
                  buttonStyles={{
                    backgroundColor:
                      sortBy === key
                        ? currentTheme.primary
                        : currentTheme.gray200,
                    margin: scale(10),
                    borderRadius: scale(10)
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ ...alignment.MBlarge }}>
            {sorted?.map((review) => (
              <ReviewCard
                key={review._id}
                name={review.order?.user?.name}
                description={review.description}
                rating={review.rating}
                date={calculateDaysAgo(review.createdAt)}
                theme={currentTheme}
              />
            ))}
          </View>
          <View style={{ ...alignment.MTlarge }}>
            {sorted?.length === 0 ? (
              <TextDefault center H4 bold>
                {t('unReadReviews')}
              </TextDefault>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Reviews
