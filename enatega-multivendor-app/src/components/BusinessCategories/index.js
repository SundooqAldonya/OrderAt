import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { getBusinessCategoriesCustomer } from '../../apollo/queries'
import { useQuery } from '@apollo/client'
import { PlaceholderLine } from 'rn-placeholder'
import TextDefault from '../Text/TextDefault/TextDefault'
import { useNavigation } from '@react-navigation/native'
import { moderateScale } from '../../utils/scaling'
import { useTranslation } from 'react-i18next'

const BusinessCategories = () => {
  const navigation = useNavigation()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const loadingArr = [1, 2, 3, 4, 5, 6, 7]
  const {
    data: dataBusinessCategories,
    loading: loadingBusinessCategories,
    error: errorBusinessCategories
  } = useQuery(getBusinessCategoriesCustomer, {
    fetchPolicy: 'no-cache'
  })

  const businessCategories =
    dataBusinessCategories?.getBusinessCategoriesCustomer || null

  console.log({ businessCategories })

  if (loadingBusinessCategories) {
    return (
      <View style={styles.loadingContainer}>
        {loadingArr.map((item) => (
          <PlaceholderLine style={styles.item} />
        ))}
      </View>
    )
  }

  const handlePress = (item) => {
    navigation.navigate('Menu', {
      filteredItem: item,
      title: 'businessCategory'
    })
  }

  return (
    <View>
      <FlatList
        data={businessCategories}
        inverted={isArabic}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => handlePress(item)}>
              <View style={styles.item}>
                {item.image ? (
                  <Image
                    source={{
                      uri: item.image.url
                    }}
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ) : (
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/vector-1740295184708-f063f71d7ad7?q=80&w=2150&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }}
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                  />
                )}
              </View>
              <View>
                <TextDefault style={styles.text}>{item.name}</TextDefault>
              </View>
            </TouchableOpacity>
          )
        }}
        keyExtractor={(item, index) => index}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      />
    </View>
  )
}

export default BusinessCategories

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 15
  },
  item: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: 50,
    overflow: 'hidden',
    marginHorizontal: 7
  },
  text: {
    color: '#000',
    textAlign: 'center'
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 10
  }
})
