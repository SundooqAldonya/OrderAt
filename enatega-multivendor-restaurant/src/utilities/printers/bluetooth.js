import {
  BLEPrinter,
  IBLEPrinter
} from 'react-native-thermal-receipt-printer-image-qr'

export const Bluetooth = {
  async scan() {
    try {
      await BLEPrinter.init() // initialize BLE
      const list = await BLEPrinter.getDeviceList()

      if (!Array.isArray(list)) {
        console.warn('Error scanning Bluetooth printers!!!')
        return []
      }

      return list.map(d => ({
        name: d.device_name,
        address: d.inner_mac_address,
        type: 'bluetooth'
      }))
    } catch (error) {
      console.error('Error scanning Bluetooth printers:', error)
      return []
    }
  },

  async connect(address) {
    try {
      await BLEPrinter.init() // initialize BLE
      // small delay to let Android establish the socket
      await new Promise(res => setTimeout(res, 300))
      const printer = await BLEPrinter.connectPrinter(address)
      printer.type = 'bluetooth'
      return printer
    } catch (error) {
      console.error(`Error connecting to BLE printer ${address}:`, error)
      throw error
    }
  },

  async disconnect() {
    try {
      await BLEPrinter.closeConn()
    } catch (error) {
      console.error('Error disconnecting BLE printer:', error)
    }
  }
}
