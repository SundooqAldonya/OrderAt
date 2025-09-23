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
  Alert,
  Platform
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
import { loadPrinterInfo, savePrinterInfo } from '../../utilities/printers'
// import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'
import RNFS from 'react-native-fs'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { ScrollView } from 'react-native'

const PrinterSettings = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { data, loading } = useAccount()
  // const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [printersLoaded, setPrintersLoaded] = useState(false)
  // Printer related state from Redux
  const printer = useSelector(state => state.printers.printerIP)
  const printers = useSelector(state => state.printers.printers)
  const connectedDevice = useSelector(state => state.printers.connectedDevice)
  const isScanning = useSelector(state => state.printers.isScanning)
  const [printerType, setPrinterType] = useState('network') // 'bluetooth' | 'network'
  const [bluetoothPrinters, setBluetoothPrinters] = useState([])
  const [firstTimeRender, setFirstTimeRender] = useState(true)
  const [networkPrinters, setNetworkPrinters] = useState([])
  // Local state
  const [printerIP, setPrinterIP] = useState(printer ? printer : '')
  const dispatch = useDispatch()

  // const restaurant = data?.restaurant || null

  // Set navigation reference for PrinterManager
  useEffect(() => {
    PrinterManager.setNavigationRef(navigation)
  }, [navigation])

  useEffect(() => {
    if (firstTimeRender) {
      setFirstTimeRender(false)
    }
  }, [firstTimeRender])

  console.log({ firstTimeRender })

  useEffect(() => {
    if (!printers || printers.length === 0) {
      scaneType()
    } else {
      const bluetooth = printers.filter(item => item.type === 'bluetooth')
      const network = printers.filter(item => item.type === 'network')
      if (printerType === 'bluetooth') setBluetoothPrinters(bluetooth)
      if (printerType === 'network') setNetworkPrinters(network)
    }
  }, [printerType, printersLoaded])

  const scaneType = async () => {
    let foundPrinters = []
    if (printerType === 'bluetooth') {
      foundPrinters = await PrinterManager.scanBluetooth()
    } else if (printerType === 'network') {
      foundPrinters = await PrinterManager.scanNetwork(printerIP)
    }
    setPrintersLoaded(true)
    dispatch(setPrinters({ printers: foundPrinters }))
  }

  // const [deactivate, { loading: deactivateLoading }] = useMutation(
  //   deactivateRestaurant,
  //   {
  //     onCompleted: data => {
  //       console.log({ data })
  //     },
  //     onError: error => {
  //       console.log({ error })
  //     }
  //   }
  // )

  // async function deactivateRestaurantById() {
  //   try {
  //     await deactivate({
  //       variables: { id: restaurant?._id }
  //     })
  //   } catch (error) {
  //     console.error('Error during deactivation mutation:', error)
  //   }
  // }

  // const handleSave = () => {
  //   dispatch(setPrinter({ printerIP }))
  //   navigation.navigate('Orders')
  // }

  // Scan for printers
  // const scanPrinters = async () => {
  //   try {
  //     dispatch(setIsScanning(true))
  //     const foundPrinters = await PrinterManager.scanAll(printerIP)
  //     dispatch(setPrinters({ printers: foundPrinters }))
  //   } catch (error) {
  //     console.error('Error scanning printers:', error)
  //     Alert.alert(
  //       'Scan Error',
  //       'Failed to scan for printers. Please try again.'
  //     )
  //   } finally {
  //     dispatch(setIsScanning(false))
  //   }
  // }

  const scanPrinters = async () => {
    dispatch(setIsScanning(true))
    try {
      await scaneType()
    } catch (err) {
      console.error(err)
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
              await savePrinterInfo(printer)
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

  const getImageBase64 = async () => {
    try {
      const image = require('../../assets/logo_2.png')
      const asset = Asset.fromModule(image)
      await asset.downloadAsync()
      const fileUri = asset.localUri || asset.uri

      const manipulated = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: 300, height: 200 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
      )

      return manipulated.base64
    } catch (err) {
      console.error('Error reading image:', err)
      return null
    }
  }

  const handleTestPrinter = async item => {
    try {
      const b64 = await getImageBase64()
      await PrinterManager.connect(item)
      await new Promise(res => setTimeout(res, 1000))
      await PrinterManager.printBase64(b64, {
        align: 'center',
        width: 300, // make sure to fit printer width (≤ 384 for 58mm, ≤ 576 for 80mm)
        height: 200
      })
      await PrinterManager.print('\n', {
        align: 'center',
        cutPaper: true
      })
      // alert(t('test_print_working'))
    } catch (err) {
      console.error('Test print failed:', err)
      alert('❌ Could not print')
    }
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
        <View style={{ flexDirection: 'row' }}>
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
        </View>
        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => handleTestPrinter(item)}>
          <TextDefault style={styles.testBtnText}>Test Print</TextDefault>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  const printersToShow =
    printerType === 'bluetooth' ? bluetoothPrinters : networkPrinters

  return (
    <SafeAreaView
      style={{
        paddingHorizontal: 20,
        height: '100%',
        flex: 1
      }}>
      <ScrollView style={{ paddingBottom: 50 }}>
        {!loading ? (
          <Fragment>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 50 }}>
              <AntDesign name="arrowleft" size={30} />
            </TouchableOpacity>

            <View style={style.toggleContainer}>
              <TouchableOpacity
                onPress={() => setPrinterType('bluetooth')}
                style={[
                  style.toggleBtn,
                  printerType === 'bluetooth' && style.activeToggle
                ]}>
                <TextDefault
                  style={[
                    style.toggleText,
                    printerType === 'bluetooth' && style.activeText
                  ]}>
                  Bluetooth
                </TextDefault>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrinterType('network')}
                style={[
                  style.toggleBtn,
                  printerType === 'network' && style.activeToggle
                ]}>
                <TextDefault
                  style={[
                    style.toggleText,
                    printerType === 'network' && style.activeText
                  ]}>
                  Network
                </TextDefault>
              </TouchableOpacity>
            </View>

            {printerType === 'network' ? (
              <View style={style.inputGroup}>
                <TextDefault bolder style={{ marginBottom: -10 }}>
                  Printer IP
                </TextDefault>
                <TextInput
                  style={[styles.textInput]}
                  placeholder={'192.168.1.1'}
                  value={printerIP}
                  onChangeText={e => setPrinterIP(e)}
                  autoCapitalize={'none'}
                  placeholderTextColor="#999"
                />
              </View>
            ) : null}

            {/* Printer Management Section */}
            <View style={style.card}>
              <View style={style.cardHeader}>
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
                  data={printersToShow}
                  renderItem={renderPrinterItem}
                  keyExtractor={(item, index) =>
                    `${item.type}-${item.address}-${index}`
                  }
                  // style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              ) : (
                <View style={printerItemStyle.emptyContainer}>
                  <TextDefault style={{ textAlign: 'center', color: '#666' }}>
                    No printers found. Tap "Scan" to search for printers.
                  </TextDefault>
                </View>
              )}
            </View>
          </Fragment>
        ) : (
          <View style={{ flex: 1, marginVertical: 50 }}>
            <TextDefault bolder style={{ fontSize: 25 }}>
              Loading...
            </TextDefault>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const style = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginTop: 0
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  restaurantName: {
    fontSize: 22,
    textAlign: 'center'
  },
  inputGroup: {
    marginTop: 20
  },
  label: {
    fontSize: 14,
    marginBottom: 6
  },
  input: {
    height: 45,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
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

const printerItemStyle = StyleSheet.create({
  container: {
    // flexDirection: 'row',
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
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

export default PrinterSettings
