import React, { useContext, useState } from 'react'
import { View, FlatList, Text, Image, TouchableOpacity } from 'react-native'
import UserContext from '../../../context/User'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import NewRestaurantCard from '../RestaurantCard/NewRestaurantCard'
import MainLoadingUI from '../LoadingUI/MainLoadingUI'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale, scale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'
import { TopBrands } from '../TopBrands'
import { useQuery } from '@apollo/client'
import AntDesign from '@expo/vector-icons/AntDesign'

function MainRestaurantCard(props) {
  const { i18n, t } = useTranslation()
  const navigation = useNavigation()

  const { language } = i18n
  const isArabic = language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  if (props?.loading) return <MainLoadingUI />
  if (props?.error) return <Text>Error: {props?.error?.message}</Text>

  return (
    <View style={{ ...styles().orderAgainSec, marginBottom: 20 }}>
      {props.orders && props.orders.length > 0 ? (
        <>
          <View>
            <TouchableOpacity
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10
              }}
              onPress={() =>
                navigation.navigate('MainRestaurantScreen', {
                  restaurantData: props?.orders,
                  title: props.title
                })
              }
            >
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
              <View style={{ ...styles().image, borderRadius: 50, padding: 5 }}>
                <AntDesign
                  name={isArabic ? 'arrowleft' : 'arrowright'}
                  size={moderateScale(20)}
                  color='black'
                />
              </View>
            </TouchableOpacity>

            <FlatList
              style={styles().offerScroll}
              inverted={isArabic}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              data={props?.orders}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                console.log({ item })
                return <NewRestaurantCard {...item} />
              }}
            />
          </View>
        </>
      ) : (
        <View style={styles().noDataTextWrapper}>
          <Icon name='warning' size={30} color={colors.secondaryOrange} />
          <Text style={styles().noDataText}>{t('no_data')}</Text>
          <Text
            style={[
              styles().noDataText,
              { fontSize: 14, color: colors.secondaryOrange }
            ]}
          >
            {t('try_change_location')}
          </Text>
        </View>
      )}
    </View>
  )
}

export default MainRestaurantCard
