import React, { useContext } from 'react'
import { View, FlatList, Text } from 'react-native'
import UserContext from '../../../context/User'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import NewRestaurantCard from '../RestaurantCard/NewRestaurantCard'
import MainLoadingUI from '../LoadingUI/MainLoadingUI'

function MainRestaurantCard(props) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  if (props?.loading) return <MainLoadingUI />
  if (props?.error) return <Text>Error: {props?.error?.message}</Text>

  return (
    <View style={styles().orderAgainSec}>
      <View>
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontFourthColor}
          bolder
          H4
          style={{
            ...styles().ItemTitle,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t(props?.title)}
        </TextDefault>
        <TextDefault
          Normal
          textColor={currentTheme.fontSecondColor}
          style={{
            ...styles().ItemDescription,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          {t('mostOrderedNow')}
        </TextDefault>
        <FlatList
          style={styles().offerScroll}
          inverted={isArabic}
          contentContainerStyle={{
            // flexGrow: 1,
            // ...alignment.PRlarge,
            // alignSelf: 'center',
            // alignItems: 'center',
            // justifyContent: 'center',
            // backgroundColor: 'red'
          }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          data={props?.orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            return <NewRestaurantCard {...item} />
          }}
        />
      </View>
    </View>
  )
}

export default MainRestaurantCard
