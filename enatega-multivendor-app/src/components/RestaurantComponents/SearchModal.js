import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useState } from 'react'
import PickCards from './PickCards'
import { useTranslation } from 'react-i18next'
import { AntDesign } from '@expo/vector-icons'

const SearchModal = ({
  searchModalVisible,
  setSearchModalVisible,
  allFoods,
  restaurant
}) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')

  const renderItem = ({ item }) => {
    return <PickCards item={item} restaurantCustomer={restaurant} />
  }
  return (
    <Modal
      visible={searchModalVisible}
      animationType='slide'
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginVertical: 10
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {t('searchForFood')}
            </Text>
            <TouchableOpacity
              onPress={() => setSearchModalVisible(false)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8
              }}
            >
              <AntDesign name={'close'} size={24} color='black' />
            </TouchableOpacity>
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`${t('searchForFood')}...`}
            placeholderTextColor={'#888'}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              paddingHorizontal: 12,
              height: 40,
              marginBottom: 12
            }}
          />
          <FlatList
            data={allFoods?.filter((item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            numColumns={2}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default SearchModal

const styles = StyleSheet.create({})
