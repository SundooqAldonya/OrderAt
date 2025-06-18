import {
  NetPrinter,
  INetPrinter
} from 'react-native-thermal-receipt-printer-image-qr'
import { NetworkInfo } from 'react-native-network-info'
import Ping from 'react-native-ping'

const checkPrinterAvailability = async ip => {
  try {
    await NetPrinter.connectPrinter(ip, 9100)
    await NetPrinter.closeConn()
    return true
  } catch {
    return false
  }
}

const getLocalIp = async () => NetworkInfo.getIPAddress()

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
          found.push({ name: `Printer @ ${ip}`, address: ip, type: 'network' })
        }
      } catch {
        // ignore
      }
    })
  )

  return found
}

export const Network = {
  async scan() {
    try {
      await NetPrinter.init()
      const list = await NetPrinter.getDeviceList()

      if (Array.isArray(list)) {
        return list.map(d => ({
          name: d.device_name,
          address: d.ip_address,
          type: 'network'
        }))
      }
      // fallback to manual ping sweep
      const localIp = await getLocalIp()
      return scanLocalNetwork(localIp)
    } catch (error) {
      console.error('Error scanning network printers:', error)
      return []
    }
  },

  async connect(address, port = 9100) {
    try {
      await NetPrinter.init() // initialize BLE
      // small delay to let Android establish the socket
      await new Promise(res => setTimeout(res, 300))
      const p = await NetPrinter.connectPrinter(address, port)
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
