import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import FoodPlaceholderImage from '../../assets/food_placeholder.jpeg'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { colors } from '../../utilities'
import { useMutation } from '@apollo/client'
import { updateStockFood } from '../../apollo'
import { Configuration } from '../../ui/context'

const CardItem = ({ item }) => {
  const navigation = useNavigation()
  const configuration = useContext(Configuration.Context)
  const { width, height } = Dimensions.get('window')

  const [stockStatus, setStockStatus] = useState(item.stock || 'In Stock')
  const [modalVisible, setModalVisible] = useState(item.stock || 'In Stock')

  const [mutateStock] = useMutation(updateStockFood, {
    onCompleted: res => {
      console.log({ res })
    },
    onError: err => {
      console.log({ err })
    }
  })

  const [orientation, setOrientation] = useState(
    Dimensions.get('window').height >= Dimensions.get('window').width
      ? 'portrait'
      : 'landscape'
  )

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.height >= window.width ? 'portrait' : 'landscape')
    })
    return () => subscription?.remove()
  }, [])

  const cheapestVariation = item.variations.reduce(
    (min, v) => (v.price < min.price ? v : min),
    item.variations[0]
  )

  const handleStockChange = ({ id, status }) => {
    setStockStatus(status)
    setModalVisible(false)
    mutateStock({
      variables: {
        input: {
          id,
          stock: status
        }
      }
    })
  }

  const styles = createStyle(orientation, width)

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.main}
        onPress={() => navigation.navigate('FoodDetail', { food: item })}>
        <Image
          source={item?.image ? { uri: item.image } : FoodPlaceholderImage}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.category}>{item.category?.title}</Text>
          <View style={styles.priceRow}>
            {cheapestVariation.discounted ? (
              <>
                <Text style={styles.discounted}>
                  {configuration.currency}{' '}
                  {cheapestVariation.discounted.toFixed(2)}
                </Text>
                <Text style={styles.original}>
                  {configuration.currency} {cheapestVariation.price.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={styles.price}>
                {configuration.currency} {cheapestVariation.price.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.stockButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.stockButtonText}>{stockStatus}</Text>
        <MaterialIcons
          name="arrow-drop-down-circle"
          size={orientation === 'portrait' ? 16 : 24}
          color="black"
        />
      </TouchableOpacity>

      {/* modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Stock Status</Text>

            {['In Stock', 'Low Stock', 'Out of Stock'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionButton,
                  stockStatus === status && styles.optionSelected
                ]}
                onPress={() => handleStockChange({ id: item._id, status })}>
                <Text
                  style={[
                    styles.optionText,
                    stockStatus === status && styles.optionTextSelected
                  ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default CardItem

const createStyle = (orientation, width) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 6,
      elevation: 3,
      overflow: 'hidden'
    },
    main: {
      flexDirection: 'row',
      flex: 1
    },
    image: {
      width: orientation === 'portrait' ? width * 0.3 : width * 0.2,
      height: orientation === 'portrait' ? width * 0.3 : width * 0.2,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12
    },
    info: {
      flex: 1,
      padding: 12,
      justifyContent: 'center'
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    category: {
      fontSize: 13,
      color: '#888',
      marginBottom: 6
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    price: {
      fontSize: orientation === 'portrait' ? 10 : 15,
      fontWeight: 'bold',
      color: '#333'
    },
    discounted: {
      fontSize: orientation === 'portrait' ? 10 : 15,
      fontWeight: 'bold',
      color: '#E53935',
      marginRight: 8
    },
    original: {
      fontSize: orientation === 'portrait' ? 10 : 13,
      color: '#888',
      textDecorationLine: 'line-through'
    },
    stockButton: {
      backgroundColor: '#888',
      marginEnd: 20,
      height: 50,
      width: orientation === 'portrait' ? 70 : 120,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 5
    },
    stockButtonText: {
      color: '#fff',
      fontSize: orientation === 'portrait' ? 8 : 16
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      width: '80%'
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center'
    },
    optionButton: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee'
    },
    optionSelected: {
      backgroundColor: '#f0f0f0'
    },
    optionText: {
      fontSize: 16,
      textAlign: 'center',
      color: '#333'
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: '700'
    },
    cancelButton: {
      marginTop: 16
    },
    cancelText: {
      textAlign: 'center',
      color: '#888',
      fontSize: 16
    }
  })
