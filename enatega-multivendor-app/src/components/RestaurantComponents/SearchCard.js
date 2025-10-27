import React, { Fragment, useContext } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { FontAwesome5 } from '@expo/vector-icons'
import ConfigurationContext from '../../context/Configuration'
import { moderateScale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
import { formatNumber } from '../../utils/formatNumber'

const SearchCard = ({ item, onPress }) => {
  const navigation = useNavigation()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const configuration = useContext(ConfigurationContext)

  const handlePress = () => {
    if (onPress) onPress(item)
    else navigation.navigate('ItemDetail', { food: item })
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.card, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}
    >
      <View style={isArabic ? styles.cartIconArabic : styles.cartIcon}>
        <FontAwesome5
          name='cart-plus'
          size={moderateScale(16)}
          color={colors.primary}
        />
      </View>

      <Image
        source={
          item.image?.trim()
            ? { uri: item.image }
            : require('../../assets/food_placeholder.jpeg')
        }
        style={styles.image}
      />

      <View
        style={[
          styles.content,
          { alignItems: isArabic ? 'flex-end' : 'flex-start' }
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.title, { textAlign: isArabic ? 'right' : 'left' }]}
        >
          {item.title}
        </Text>

        {item.description ? (
          <Text
            numberOfLines={2}
            style={[
              styles.description,
              { textAlign: isArabic ? 'right' : 'left' }
            ]}
          >
            {item.description}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 6
          }}
        >
          {item?.variations?.[0]?.discounted > 0 && (
            <Text style={styles.discounted}>
              {isArabic
                ? `${formatNumber(
                    parseFloat(
                      item?.variations[0]?.price +
                        item?.variations[0]?.discounted
                    ).toFixed(0)
                  )} ${configuration?.currencySymbol}`
                : `${configuration?.currencySymbol}${formatNumber(
                    parseFloat(
                      item?.variations[0]?.price +
                        item?.variations[0]?.discounted
                    ).toFixed(0)
                  )}`}
            </Text>
          )}

          <Text style={styles.price}>
            {isArabic
              ? `${configuration?.currencySymbol} ${parseFloat(
                  item?.variations[0]?.price
                ).toFixed(2)}`
              : `${configuration?.currencySymbol}${parseFloat(
                  item?.variations[0]?.price
                ).toFixed(2)}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default SearchCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
    alignItems: 'center',
    width: '95%',
    alignSelf: 'center',
    elevation: 2,
    padding: 10
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginHorizontal: 8
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2
  },
  description: {
    fontSize: moderateScale(12),
    color: '#555',
    marginBottom: 6
  },
  price: {
    fontSize: moderateScale(13),
    color: colors.primary,
    fontWeight: 'bold'
  },
  discounted: {
    fontSize: moderateScale(12),
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  cartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10
  },
  cartIconArabic: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10
  }
})
