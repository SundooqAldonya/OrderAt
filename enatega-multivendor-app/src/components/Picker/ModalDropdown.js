import React, { useContext } from 'react'
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native'
import { Feather, Entypo } from '@expo/vector-icons'
import TextDefault from '../Text/TextDefault/TextDefault'
import { scale } from '../../utils/scaling'
import { LocationContext } from '../../context/Location'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

const ModalDropdown = ({
  theme,
  visible,
  onItemPress,
  onClose,
  isLoggedIn
}) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { cities } = useContext(LocationContext)
  const navigation = useNavigation()

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        ...styles.item(theme),
        flexDirection: isArabic ? 'row-reverse' : 'row'
      }}
      onPress={() => {
        // if (!isLoggedIn) {
        onItemPress(item)
        // } else {
        //   navigation.navigate('AddNewAddressUser', {
        //     area: item
        //   })
        // }
      }}
    >
      <TextDefault H5 bold textColor={theme.color7}>
        {item.title}
      </TextDefault>
      {isArabic ? (
        <Entypo name='chevron-left' size={24} color={theme.newIconColor} />
      ) : (
        <Entypo name='chevron-right' size={24} color={theme.newIconColor} />
      )}
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={onClose}
      backdropOpacity={1}
      transparent={true}
      style={{
        height: '100px'
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer(theme)}>
        <View
          style={{
            ...styles.header,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <TextDefault textColor={theme.gray900} H3 bolder>
            {t('exploreCities')}
          </TextDefault>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name='x-circle' size={30} color={theme.newIconColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={cities}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  modalContainer: (theme) => ({
    flex: 1,
    justifyContent: 'flex-end',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    backgroundColor: theme.newheaderBG,
    borderColor: 'gray',
    borderWidth: scale(1),
    marginTop: scale(-20)
  }),
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(20),
    // marginLeft: scale(12),
    // marginRight: scale(8),
    marginBottom: scale(16),
    marginRight: scale(12)
  },
  closeButton: {
    alignSelf: 'flex-end',
    margin: scale(10)
  },
  item: (theme) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.newheaderBG,
    borderBottomWidth: scale(1),
    borderBottomColor: '#ccc'
  })
})

export default ModalDropdown
