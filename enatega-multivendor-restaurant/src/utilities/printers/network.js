import { NetPrinter } from 'react-native-thermal-receipt-printer-image-qr'
import { createPrinterDevice } from './types'
import { NetworkInfo } from 'react-native-network-info'
import Ping from 'react-native-ping'
import AsyncStorage from '@react-native-async-storage/async-storage'

const checkPrinterAvailability = async ip => {
  try {
    await NetPrinter.connectPrinter(ip, 9100)
    //await new Promise(res => setTimeout(res, 300));
    await NetPrinter.closeConn()
    return true
  } catch {
    return false
  }
}

//const getLocalIp = async () => NetworkInfo.getIPAddress();

const scanLocalNetwork = async localIp => {
  const base = localIp.split('.').slice(0, 3).join('.')
  const ips = Array.from({ length: 254 }, (_, i) => `${base}.${i + 1}`).filter(
    ip => ip !== localIp
  )

  const found = []

  await Promise.all(
    ips.map(async ip => {
      try {
        const reachable = await Ping.start(ip, { timeout: 1000 })
        if (reachable && (await checkPrinterAvailability(ip))) {
          found.push(createPrinterDevice(`Printer @ ${ip}`, ip, 'network'))
        }
      } catch {
        // ignore
      }
    })
  )
  console.log('we got: ', found)
  return found
}

export const Network = {
  async scan() {
    try {
      await NetPrinter.init()
      await new Promise(res => setTimeout(res, 1000))
      const list = await NetPrinter.getDeviceList()

      if (list && Array.isArray(list)) {
        return list.map(d =>
          createPrinterDevice(d.device_name, d.ip_address, 'network')
        )
      }
      // fallback to manual ping sweep
      const localIp = '192.168.1.1' //const localIp = await getLocalIp();
      return scanLocalNetwork(localIp)
    } catch (error) {
      console.error('Error scanning network printers:', error)
      return []
    }
  },

  async connect(address, port = 9100) {
    try {
      await NetPrinter.init() // initialize Network
      // small delay to let Android establish the socket
      await new Promise(res => setTimeout(res, 1000))
      const p = await NetPrinter.connectPrinter(address, port)
      await savePrinterInfo(address, port)
      p.type = 'network'
      return p
    } catch (error) {
      console.error(`Error connecting to network printer ${address}:`, error)
      throw error
    }
  },

  async disconnect() {
    try {
      await NetPrinter.closeConn()
    } catch (error) {
      console.error('Error disconnecting network printer:', error)
    }
  }
}

const LAST_PRINTER_KEY = 'last_connected_printer'

export const savePrinterInfo = async printerDevice => {
  if (!printerDevice || !printerDevice.address || !printerDevice.type) return
  try {
    await AsyncStorage.setItem(LAST_PRINTER_KEY, JSON.stringify(printerDevice))
  } catch (err) {
    console.error('Failed to save printer info:', err)
  }
}

export const loadPrinterInfo = async () => {
  try {
    const stored = await AsyncStorage.getItem(LAST_PRINTER_KEY)
    console.log({ stored })
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.error('Failed to load printer info:', err)
    return null
  }
}

export const clearPrinterInfo = async () => {
  try {
    await AsyncStorage.removeItem(LAST_PRINTER_KEY)
  } catch (err) {
    console.error('Failed to clear printer info:', err)
  }
}
