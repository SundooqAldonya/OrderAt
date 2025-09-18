import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { Fragment, useState } from 'react'
import { TextDefault } from '../../components'
import { useTranslation } from 'react-i18next'
import { scale } from 'react-native-size-matters'
import { useMutation } from '@apollo/client'
import { deactivateRestaurant } from '../../apollo'
import {
  AntDesign,
  EvilIcons,
  Feather,
  MaterialIcons
} from '@expo/vector-icons'
import { colors } from '../../utilities'
import { useAccount } from '../../ui/hooks'
import { useNavigation } from '@react-navigation/native'

const DeactivateAccount = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const { data, loading } = useAccount()
  const restaurant = data?.restaurant || null

  const [mutateDeactivate, { loading: deactivateLoading }] = useMutation(
    deactivateRestaurant,
    {
      onCompleted: data => {
        console.log({ data })
      },
      onError: error => {
        console.log({ error })
      }
    }
  )

  async function deactivateRestaurantById() {
    try {
      await mutateDeactivate({
        variables: { id: restaurant?._id }
      })
    } catch (error) {
      console.error('Error during deactivation mutation:', error)
    }
  }

  return (
    <View>
      <TouchableOpacity
        style={{ marginTop: 50, marginHorizontal: 20 }}
        onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" size={30} color="black" />
      </TouchableOpacity>
      {data ? (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: restaurant.image }}
            style={{
              width: 100,
              height: 100,
              marginHorizontal: 'auto',
              borderRadius: 5
            }}
          />

          <View style={{ marginTop: 20 }}>
            <TextDefault bolder style={{ fontSize: 20, textAlign: 'center' }}>
              {restaurant.name}
            </TextDefault>
          </View>
        </View>
      ) : (
        <Fragment>
          {loading ? (
            <Text style={{ textAlign: 'center' }}>loading...</Text>
          ) : null}
        </Fragment>
      )}
      <TouchableOpacity
        style={styles.deleteAccountBtn}
        onPress={() => setDeleteModalVisible(true)}>
        <TextDefault bolder H4 style={styles.deleteAccountText}>
          {t('DeleteAccount')}
        </TextDefault>
      </TouchableOpacity>
      <Modal
        onBackdropPress={() => setDeleteModalVisible(false)}
        onBackButtonPress={() => setDeleteModalVisible(false)}
        visible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(false)
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                flexDirection: 'row',
                gap: 24,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: scale(10)
              }}>
              <TextDefault bolder H3 textColor={styles.newFontcolor}>
                {t('DeleteConfirmation')}
              </TextDefault>
              <Feather
                name="x-circle"
                size={24}
                color={styles.newFontcolor}
                onPress={() => setDeleteModalVisible(!deleteModalVisible)}
              />
            </View>
            <TextDefault H5 textColor={styles.newFontcolor}>
              {t('permanentDeleteMessage')}
            </TextDefault>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnDelete,
                { opacity: deactivateLoading ? 0.5 : 1 }
              ]}
              onPress={deactivateRestaurantById}>
              {deactivateLoading ? (
                <Spinner backColor="transparent" size="small" />
              ) : (
                <TextDefault bolder H4 textColor={styles.white}>
                  {t('yesSure')}
                </TextDefault>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={() => setDeleteModalVisible(false)}
              disabled={deactivateLoading}>
              <TextDefault bolder H4 textColor={styles.black}>
                {t('cancel')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default DeactivateAccount

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginTop: 50
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  deleteAccountBtn: {
    marginTop: 40,
    alignSelf: 'center'
  },
  deleteAccountText: {
    color: 'red',
    fontSize: 16
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    // filter: 'blur(10)',
    zIndex: 1000
  },
  modalView: {
    width: '90%',
    alignItems: 'flex-start',
    gap: 24,
    margin: 20,
    backgroundColor: 'white',
    borderWidth: scale(1),
    borderColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    marginTop: 30
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  scanText: {
    color: '#fff'
  },
  saveBtn: {
    backgroundColor: colors.primary,
    marginTop: 30,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignSelf: 'center'
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    borderRadius: 30,
    backgroundColor: '#f1f1f1',
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeToggle: {
    backgroundColor: colors.primary // iOS blue, looks neat
  },
  toggleText: {
    fontSize: 16,
    color: '#555'
  },
  activeText: {
    color: '#fff',
    fontWeight: '600'
  }
})
