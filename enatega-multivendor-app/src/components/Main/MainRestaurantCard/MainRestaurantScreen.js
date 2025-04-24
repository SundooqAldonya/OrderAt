import React, { useContext } from 'react'
import { View, FlatList, Text, Image, TouchableOpacity } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import NewRestaurantCard from '../RestaurantCard/NewRestaurantCard'
import { colors } from '../../../utils/colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
const MainRestaurantScreen = () => {
  const route = useRoute()
  const { restaurantData } = route.params || {}
  console.log('---------restaurantData------', restaurantData?.length)

  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  return (
    <View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',

          alignItems: 'center',
          backgroundColor: 'red'
        }}
      >
        <Text>jjjjjjjjjjjjjjjjjjjjjjjj</Text>
      </View>

      {/* <View style={styles().orderAgainSec}>
        {restaurantData && restaurantData.length > 0 ? (
          <>
            <View>
              <TextDefault
                Normal
                textColor={colors.dark}
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
                contentContainerStyle={
                  {
                    flexGrow: 1,
                    ...alignment.PRlarge,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  backgroundColor: 'red'
                  }
                }
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                data={restaurantData}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
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
      </View> */}
    </View>
  )
}

export default MainRestaurantScreen
