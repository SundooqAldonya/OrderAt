import React, { Fragment, useState, useEffect } from 'react'
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Alert
} from 'react-native'
import { Spinner, TextDefault } from '../../components'
import { useTranslation } from 'react-i18next'
import { useAccount } from '../../ui/hooks'
import { colors, scale } from '../../utilities'
import { useMutation } from '@apollo/client'
import { deactivateRestaurant } from '../../apollo'
import {
  AntDesign,
  EvilIcons,
  Feather,
  MaterialIcons
} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import styles from '../Login/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  setPrinter,
  setPrinters,
  setConnectedDevice,
  setIsScanning,
  clearConnectedDevice
} from '../../../store/printersSlice'
import PrinterManager from '../../utilities/printers/printerManager'

const Profile = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { data, loading } = useAccount()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // Printer related state from Redux
  const printer = useSelector(state => state.printers.printerIP)
  const printers = useSelector(state => state.printers.printers)
  const connectedDevice = useSelector(state => state.printers.connectedDevice)
  const isScanning = useSelector(state => state.printers.isScanning)

  // Local state
  const [printerIP, setPrinterIP] = useState(printer ? printer : '')
  const dispatch = useDispatch()

  const restaurant = data?.restaurant || null

  // Set navigation reference for PrinterManager
  useEffect(() => {
    PrinterManager.setNavigationRef(navigation)
  }, [navigation])

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

  // Scan for printers
  const scanPrinters = async () => {
    try {
      dispatch(setIsScanning(true))
      const foundPrinters = await PrinterManager.scanAll(printerIP)
      dispatch(setPrinters({ printers: foundPrinters }))
    } catch (error) {
      console.error('Error scanning printers:', error)
      Alert.alert(
        'Scan Error',
        'Failed to scan for printers. Please try again.'
      )
    } finally {
      dispatch(setIsScanning(false))
    }
  }

  // Connect to a printer with confirmation
  const connectToPrinter = printer => {
    Alert.alert(
      'Connect to Printer',
      `Do you want to connect to ${printer.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Connect',
          onPress: async () => {
            try {
              await PrinterManager.connect(printer)
              dispatch(setConnectedDevice(printer))
              Alert.alert('Success', `Connected to ${printer.name}`)
              dispatch(setIsScanning(false))
            } catch (error) {
              console.error('Connection error:', error)
              Alert.alert(
                'Connection Error',
                `Failed to connect to ${printer.name}`
              )
            }
          }
        }
      ]
    )
  }

  // Disconnect from current printer
  const disconnectPrinter = () => {
    Alert.alert(
      'Disconnect Printer',
      'Do you want to disconnect from the current printer?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Disconnect',
          onPress: async () => {
            try {
              await PrinterManager.disconnect()
              dispatch(clearConnectedDevice())
              Alert.alert('Success', 'Printer disconnected')
              dispatch(setIsScanning(false))
            } catch (error) {
              console.error('Disconnect error:', error)
              Alert.alert('Disconnect Error', 'Failed to disconnect printer')
            }
          }
        }
      ]
    )
  }

  // Render printer item
  const renderPrinterItem = ({ item }) => {
    const isConnected =
      connectedDevice &&
      connectedDevice.address === item.address &&
      connectedDevice.type === item.type

    return (
      <TouchableOpacity
        style={[
          printerItemStyle.container,
          isConnected && printerItemStyle.connectedContainer
        ]}
        onPress={() => connectToPrinter(item)}>
        <View style={printerItemStyle.info}>
          <TextDefault bolder style={printerItemStyle.name}>
            {item.name}
          </TextDefault>
          <TextDefault style={printerItemStyle.address}>
            {item.type}: {item.address}
          </TextDefault>
        </View>
        {isConnected && (
          <MaterialIcons name="check-circle" size={24} color={colors.green} />
        )}
      </TouchableOpacity>
    )
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

          {/* Printer Management Section */}
          <View style={{ marginTop: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10
              }}>
              <TextDefault bolder>Available Printers</TextDefault>
              <TouchableOpacity
                style={printerButtonStyle.scanButton}
                onPress={scanPrinters}
                disabled={isScanning}>
                {isScanning ? (
                  <Spinner size="small" />
                ) : (
                  <TextDefault style={{ color: '#fff' }}>Scan</TextDefault>
                )}
              </TouchableOpacity>
            </View>

            {/* Connected Device Info */}
            {connectedDevice && (
              <View style={printerItemStyle.connectedInfo}>
                <TextDefault bolder style={{ color: colors.green }}>
                  Connected: {connectedDevice.name}
                </TextDefault>
                <TouchableOpacity
                  style={printerButtonStyle.disconnectButton}
                  onPress={disconnectPrinter}>
                  <TextDefault style={{ color: '#fff', fontSize: 12 }}>
                    Disconnect
                  </TextDefault>
                </TouchableOpacity>
              </View>
            )}

            {/* Printer List */}
            {printers.length > 0 ? (
              <FlatList
                data={printers}
                renderItem={renderPrinterItem}
                keyExtractor={(item, index) =>
                  `${item.type}-${item.address}-${index}`
                }
                style={{ maxHeight: 200 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={printerItemStyle.emptyContainer}>
                <TextDefault style={{ textAlign: 'center', color: '#666' }}>
                  No printers found. Tap "Scan" to search for printers.
                </TextDefault>
              </View>
            )}
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

const printerItemStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  connectedContainer: {
    backgroundColor: '#e8f5e8',
    borderColor: colors.green,
    borderWidth: 2
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: 16,
    marginBottom: 4
  },
  address: {
    fontSize: 12,
    color: '#666'
  },
  connectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginBottom: 10
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc'
  }
})

const printerButtonStyle = StyleSheet.create({
  scanButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center'
  },
  disconnectButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  }
})

export default Profile
