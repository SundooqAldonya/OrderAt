import React, { useContext } from 'react'
import { View, FlatList, Text, Image } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import { LocationContext } from '../../../context/Location'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { topRatedVendorsInfo } from '../../../apollo/queries'
import { useQuery } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import TopBrandsLoadingUI from '../LoadingUI/TopBrandsLoadingUI'
import truncate from '../../../utils/helperFun'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { moderateScale, scale } from '../../../utils/scaling'
import { colors } from '../../../utils/colors'
import Icon from 'react-native-vector-icons/MaterialIcons'

function TopBrands(props) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const { location } = useContext(LocationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()

  const { loading, error, data } = useQuery(topRatedVendorsInfo, {
    variables: {
      latitude: location?.latitude,
      longitude: location?.longitude
    }
  })

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles().topbrandsContainer}
      onPress={() => navigation.navigate('Restaurant', { ...item })}
    >
      <View style={styles().brandImgContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles().brandImg}
          resizeMode='contain'
        />
      </View>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: '#E5E7EB',
          borderRadius: 8,
          borderWidth: 1,
          borderTopWidth: 0,
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0
        }}
      >
        <TextDefault
          style={styles().brandName}
          textColor={currentTheme.fontThirdColor}
          H5
          bolder
        >
          {truncate(item?.name, 13)}
        </TextDefault>
        <TextDefault textColor={currentTheme.fontFifthColor} normal>
          {item?.deliveryTime} + {t('mins')}
        </TextDefault>
      </View>
    </TouchableOpacity>
  )

  if (loading) return <TopBrandsLoadingUI />
  if (error) return <Text style={styles().margin}>Error: {error.message}</Text>

  return (
    <View style={styles().topbrandsSec}>
      {data?.topRatedVendorsPreview?.length ? (
        <TouchableOpacity
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onPress={() =>
            navigation.navigate('TopBrandsScreen', {
              topRatedVendorsPreview: data?.topRatedVendorsPreview
            })
          }
        >
          <TextDefault
            numberOfLines={1}
            textColor={currentTheme.fontFourthColor}
            bolder
            H4
            style={{
              textAlign: isArabic ? 'right' : 'left',
              paddingHorizontal: 16,
              marginBottom: 10
            }}
          >
            {t('topBrands')}
          </TextDefault>
          <View style={{ ...styles().image, borderRadius: 50, padding: 5 }}>
            <AntDesign
              name={isArabic ? 'arrowleft' : 'arrowright'}
              size={moderateScale(20)}
              color='black'
            />
          </View>
        </TouchableOpacity>
      ) : null}
      <View style={{ ...alignment.PRsmall }}>
        {data.topRatedVendorsPreview &&
        data.topRatedVendorsPreview.length > 0 ? (
          <>
            <FlatList
              data={data?.topRatedVendorsPreview}
              inverted={isArabic}
              renderItem={renderItem}
              keyExtractor={(item) => item?._id}
              contentContainerStyle={{
                flexGrow: 1
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
            />
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
              {t('city_location_no_deliveryzone')}
            </Text>
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
    </View>
  )
}

export default TopBrands
