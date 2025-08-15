import React, { useLayoutEffect } from 'react'
import { View, FlatList, Text } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import NewRestaurantCard from '../RestaurantCard/NewRestaurantCard'
import { colors } from '../../../utils/colors'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { scale } from '../../../utils/scaling'
import { HeaderBackButton } from '@react-navigation/elements'
import { MaterialIcons } from '@expo/vector-icons'
import navigationService from '../../../routes/navigationService'
import PopulerRestaurantCard from '../PopulerRestaurantCard'

const MainRestaurantScreen = () => {
  const { t } = useTranslation()
  const route = useRoute()
  const navigation = useNavigation()

  const { restaurantData, title } = route.params || {}

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t(title),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: colors.dark,
        fontWeight: 'bold'
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        color: colors.white,
        elevation: 0
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View>
              <MaterialIcons name='arrow-back' size={30} color={colors.dark} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [])
  return (
    <View
      style={{
        flex: 1
      }}
    >
      <FlatList
        // style={{ width: '100%' }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        horizontal={false}
        data={restaurantData}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          // paddingBottom: 20,
          // paddingTop: 10,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        renderItem={({ item }) => {
          return <PopulerRestaurantCard {...item} />
        }}
      />
    </View>
  )
}

export default MainRestaurantScreen
