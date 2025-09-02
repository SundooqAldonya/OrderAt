import React, { useContext, useMemo, useState } from 'react'
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native'
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
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView
} from 'recyclerlistview'

function MainRestaurantCard(props) {
  const { i18n, t } = useTranslation()
  const navigation = useNavigation()
  const cardWidth = moderateScale(360)
  const cardHeight = moderateScale(300)
  const { language } = i18n
  const isArabic = language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  // DataProvider tells RecyclerListView how to track row changes
  const dataProvider = useMemo(() => {
    return new DataProvider((r1, r2) => r1._id !== r2._id).cloneWithRows(
      props.orders || []
    )
  }, [props.orders])

  // LayoutProvider tells RecyclerListView how to lay out each item
  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
      () => 'ORDER_ITEM', // All rows same type
      (type, dim) => {
        switch (type) {
          case 'ORDER_ITEM':
            dim.width = cardWidth * 0.8 // Adjust card width
            dim.height = cardHeight // Adjust card height
            break
          default:
            dim.width = 0
            dim.height = 0
        }
      }
    )
  }, [])

  if (props?.loading) return <MainLoadingUI />
  if (props?.error) return <Text>Error: {props?.error?.message}</Text>

  const rowRenderer = (type, item) => {
    return (
      <View style={isArabic && { transform: [{ scaleX: -1 }] }}>
        <NewRestaurantCard {...item} />
      </View>
    )
  }

  return (
    <View style={{ ...styles().orderAgainSec, marginBottom: 20 }}>
      {props.orders && props.orders.length > 0 ? (
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

          <RecyclerListView
            style={[
              styles().offerScroll,
              isArabic && { transform: [{ scaleX: -1 }] }
            ]}
            isHorizontal={true} // horizontal scroll
            rowRenderer={rowRenderer}
            dataProvider={dataProvider}
            layoutProvider={layoutProvider}
            forceNonDeterministicRendering={true}
            renderAheadOffset={300} // tune this for smoothness
            canChangeSize={true}
          />
          {/* <ScrollView
            style={isArabic && { transform: [{ scaleX: -1 }] }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {props?.orders.map((item) => rowRenderer(null, item))}
          </ScrollView> */}

          {/* <FlatList
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
            initialNumToRender={8} // tune this
            windowSize={5}
            removeClippedSubviews={false}
          /> */}
        </View>
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
