import React, { useLayoutEffect } from 'react'
import { colors } from '../../../utils/colors'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { scale } from '../../../utils/scaling'
import { HeaderBackButton } from '@react-navigation/elements'
import { MaterialIcons } from '@expo/vector-icons'
import navigationService from '../../../routes/navigationService'
import { View, FlatList, Text, Image } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'

import { TouchableOpacity } from 'react-native-gesture-handler'
import truncate from '../../../utils/helperFun'

function TopBrandsScreen(props) {
  const route = useRoute()
  const navigation = useNavigation()

  const { topRatedVendorsPreview } = route.params || {}

  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('topBrands'),
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
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles().topbrandsContainer}
      onPress={() => navigation.navigate('Restaurant', { ...item })}
    >
      <View style={styles().brandImgContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles().brandImg}
          resizeMode='cover'
        />
      </View>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TextDefault
          style={styles().brandName}
          textColor={colors.dark}
          H5
          bolder
        >
          {truncate(item?.name)}
        </TextDefault>
        <TextDefault textColor={colors.dark} normal>
          {item?.deliveryTime} + {t('mins')}
        </TextDefault>
      </View>
    </TouchableOpacity>
  )

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <FlatList
        data={topRatedVendorsPreview}
        inverted={isArabic}
        renderItem={renderItem}
        keyExtractor={(item) => item?._id}
        contentContainerStyle={{
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        horizontal={false}
      />
    </View>
  )
}

export default TopBrandsScreen
