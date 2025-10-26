import React, { Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList
} from 'react-native'
import UserContext from '../../context/User'

const ItemModal = ({
  visible,
  onClose,
  item,
  currency,
  modalAddToCart,
  restaurantCustomer
}) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { restaurant: restaurantCart } = useContext(UserContext)

  const formatNumber = (num) => {
    return Number(num).toLocaleString()
  }

  if (!item) return null

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={
                item.image?.trim()
                  ? { uri: item.image }
                  : require('../../assets/food_placeholder.jpeg')
              }
              style={styles.imageHorizontal}
            />
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.price}>
            {parseFloat(item.variations[0].price).toFixed(2)} {currency}
          </Text>
          {/* ✅ Show variations (without addons) */}
          {item.variations && item.variations.length > 0 && (
            <View style={styles.variationsSection}>
              <Text style={styles.variationsTitle}>{t('variations')}</Text>

              <FlatList
                data={item.variations}
                keyExtractor={(v, index) => index.toString()}
                renderItem={({ item: variation }) => (
                  <View style={styles.variationItem}>
                    <Text style={styles.variationTitle}>{variation.title}</Text>
                    {/* <Text style={styles.variationPrice}>
                      {variation.discounted > 0
                        ? `${currency} ${variation.discounted + variation.price} (was ${currency} ${variation.price})`
                        : `${currency} ${variation.price}`}
                    </Text> */}
                    <View style={styles.priceContainer}>
                      {/* Discounted old price (line-through) */}
                      {variation.discounted > 0 && (
                        <Fragment>
                          <Text
                            style={[
                              styles.oldPrice,
                              {
                                textAlign: isArabic ? 'right' : 'left'
                              }
                            ]}
                          >
                            {isArabic
                              ? `${formatNumber(
                                  parseFloat(
                                    variation.price + variation.discounted
                                  ).toFixed(0)
                                )} ${currency}`
                              : `${currency} ${formatNumber(
                                  parseFloat(
                                    variation.price + variation.discounted
                                  ).toFixed(0)
                                )}`}
                          </Text>
                        </Fragment>
                      )}

                      {/* Final price */}
                      <Text
                        style={[
                          styles.newPrice,
                          { textAlign: isArabic ? 'right' : 'left' }
                        ]}
                      >
                        {isArabic
                          ? `${formatNumber(
                              parseFloat(variation.price).toFixed(0)
                            )} ${currency}`
                          : `${currency} ${formatNumber(
                              parseFloat(variation.price).toFixed(0)
                            )}`}
                      </Text>
                    </View>
                    <Text style={styles.variationStock}>{variation.stock}</Text>
                  </View>
                )}
              />
            </View>
          )}
          <View
            style={{
              ...styles.btnContainer,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <TouchableOpacity
              onPress={() =>
                modalAddToCart(
                  {
                    ...item,
                    restaurant: restaurantCustomer?._id,
                    restaurantName: restaurantCustomer?.name
                  },
                  item.restaurant !== restaurantCart
                )
              }
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>{t('addToCart')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ItemModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    padding: 20,
    alignItems: 'center'
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2b8a3e',
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: '#2b8a3e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  closeText: {
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center'
  },
  imageContainer: {
    width: 300,
    height: 150,
    marginInlineStart: 12
  },
  imageHorizontal: {
    width: '100%',
    height: 150
  },
  btnContainer: {
    gap: 10
  },
  variationsSection: {
    width: '100%',
    marginBottom: 20
  },
  variationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  variationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6
  },
  variationTitle: {
    fontSize: 14,
    fontWeight: '500'
  },
  variationPrice: {
    fontSize: 14,
    color: '#27ae60'
  },
  variationStock: {
    fontSize: 12,
    color: '#888'
  },
  priceContainer: {
    alignItems: 'flex-end'
  },
  oldPrice: {
    color: '#9CA3AF',
    fontSize: 12,
    textDecorationLine: 'line-through'
  },
  newPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60'
  }
})
