import React, { Fragment, useState } from 'react'
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { Spinner, TextDefault } from '../../components'
import { useTranslation } from 'react-i18next'
import { useAccount } from '../../ui/hooks'
import { colors, scale } from '../../utilities'
import { useMutation } from '@apollo/client'
import { deactivateRestaurant } from '../../apollo'
import { AntDesign, EvilIcons, Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import styles from '../Login/styles'
import { useDispatch, useSelector } from 'react-redux'
import { setPrinter } from '../../../store/printersSlice'

const Profile = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { data, loading } = useAccount()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const printer = useSelector(state => state.printers.printerIP)
  const [printerIP, setPrinterIP] = useState(printer ? printer : '')
  const dispatch = useDispatch()

  const restaurant = data?.restaurant || null

  const [deactivate, { loading: deactivateLoading }] = useMutation(
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
      await deactivate({
        variables: { id: restaurant?._id }
      })
    } catch (error) {
      console.error('Error during deactivation mutation:', error)
    }
  }

  const handleSave = () => {
    dispatch(setPrinter({ printerIP }))
    navigation.navigate('Orders')
  }

  return (
    <SafeAreaView
      style={{
        marginBlock: 50,
        paddingHorizontal: 20,
        backgroundColor: colors.primary,
        height: '100%',
        flex: 1
      }}>
      {!loading ? (
        <Fragment>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 50 }}>
            <AntDesign name="arrowleft" size={30} />
          </TouchableOpacity>
          {data ? (
            <View style={{ marginTop: 50 }}>
              <Image
                source={{ uri: restaurant.image }}
                style={{ width: 100, height: 100, marginHorizontal: 'auto' }}
              />
              <View style={{ marginTop: 20 }}>
                <TextDefault
                  bolder
                  style={{ fontSize: 20, textAlign: 'center' }}>
                  {restaurant.name}
                </TextDefault>
              </View>
            </View>
          ) : null}
          <View>
            <TextDefault bolder style={{ marginBottom: -10 }}>
              Printer IP
            </TextDefault>
            <TextInput
              style={[styles.textInput]}
              placeholder={'192.168.1.1'}
              value={printerIP}
              onChangeText={e => setPrinterIP(e)}
              autoCapitalize={'none'}
            />
          </View>
          <TouchableOpacity
            style={{
              marginHorizontal: 'auto',
              marginTop: 20,
              backgroundColor: 'purple',
              width: 70,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4
            }}
            onPress={handleSave}>
            <TextDefault style={{ color: '#fff' }}>{t('save')}</TextDefault>
          </TouchableOpacity>
          <TouchableOpacity
            style={style.deleteAccountBtn}
            onPress={() => setDeleteModalVisible(true)}>
            <TextDefault bolder H4 style={style.deleteAccountText}>
              {t('DeleteAccount')}
            </TextDefault>
          </TouchableOpacity>
        </Fragment>
      ) : (
        <View style={{ flex: 1, marginVertical: 50 }}>
          <TextDefault bolder style={{ fontSize: 25 }}>
            Loading...
          </TextDefault>
        </View>
      )}
      <Modal
        onBackdropPress={() => setDeleteModalVisible(false)}
        onBackButtonPress={() => setDeleteModalVisible(false)}
        visible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(false)
        }}>
        <View style={style.centeredView}>
          <View style={style.modalView}>
            <View
              style={{
                flexDirection: 'row',
                gap: 24,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: scale(10)
              }}>
              <TextDefault bolder H3 textColor={style.newFontcolor}>
                {t('DeleteConfirmation')}
              </TextDefault>
              <Feather
                name="x-circle"
                size={24}
                color={style.newFontcolor}
                onPress={() => setDeleteModalVisible(!deleteModalVisible)}
              />
            </View>
            <TextDefault H5 textColor={style.newFontcolor}>
              {t('permanentDeleteMessage')}
            </TextDefault>
            <TouchableOpacity
              style={[
                style.btn,
                style.btnDelete,
                { opacity: deactivateLoading ? 0.5 : 1 }
              ]}
              onPress={deactivateRestaurantById}>
              {deactivateLoading ? (
                <Spinner backColor="transparent" size="small" />
              ) : (
                <TextDefault bolder H4 textColor={style.white}>
                  {t('yesSure')}
                </TextDefault>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[style.btn, style.btnCancel]}
              onPress={() => setDeleteModalVisible(false)}
              disabled={deactivateLoading}>
              <TextDefault bolder H4 textColor={style.black}>
                {t('cancel')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const style = StyleSheet.create({
  deleteAccountBtn: {
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 5,
    padding: 20,
    marginTop: 150
  },
  deleteAccountText: {
    color: 'red'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    filter: 'blur(10)'
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
  }
})

export default Profile
