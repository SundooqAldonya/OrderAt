import React from 'react'
import { Alert } from 'react-native'

import { Bluetooth } from './bluetooth'
import { USB } from './usb'
import { clearPrinterInfo, Network, savePrinterInfo } from './network'
import { createPrintOptions, createPrinterDevice } from './types'
import {
  BLEPrinter,
  USBPrinter,
  NetPrinter,
  COMMANDS,
  ColumnAlignment,
  CENTER
} from 'react-native-thermal-receipt-printer-image-qr'
import AsyncStorage from '@react-native-async-storage/async-storage'

let connectedDevice = null

console.log({ connectedDevice })

// Navigation reference for redirecting to settings
let navigationRef = null
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const LAST_PRINTER_KEY = 'last_connected_printer'

export class PrinterManager {
  /**
   * Set navigation reference for redirecting to settings
   */
  static setNavigationRef(navRef) {
    navigationRef = navRef
  }

  /**
   * Get currently connected device
   */
  static getConnectedDevice() {
    return connectedDevice
  }

  static async setConnectedDevice(dev) {
    // const dev = await AsyncStorage.getItem(LAST_PRINTER_KEY)
    connectedDevice = dev
    return connectedDevice
  }

  /**
   * Create a network printer device from manual IP
   */
  static createNetworkPrinterFromIP(ipAddress) {
    if (!ipAddress || !ipAddress.trim()) {
      return null
    }
    return createPrinterDevice(`Printer @ ${ipAddress}`, ipAddress, 'network')
  }

  /**
   * Scan BLE, USB and Network in sequence.
   * If one fails, we log the error and keep going.
   * Network scan is commented out - use manual IP instead.
   */
  // static async scanAll(manualIP = null) {
  //   const devices = []

  //   // 1) USB
  //   try {
  //     const usbDevices = await USB.scan()
  //     devices.push(...usbDevices)
  //   } catch (err) {
  //     console.error('USB scan failed:', err)
  //   }

  //   // 2) BLE
  //   try {
  //     const bleDevices = await Bluetooth.scan()
  //     devices.push(...bleDevices)
  //   } catch (err) {
  //     console.error('Bluetooth scan failed:', err)
  //   }

  //   // 3) Network - COMMENTED OUT FOR MANUAL IP CONFIGURATION
  //   // Use manual IP if provided
  //   if (manualIP && manualIP.trim()) {
  //     const networkDevice = this.createNetworkPrinterFromIP(manualIP)
  //     if (networkDevice) {
  //       devices.push(networkDevice)
  //     }
  //   } else {
  //     try {
  //       const netDevices = await Network.scan()
  //       console.log(netDevices)
  //       devices.push(...netDevices)
  //     } catch (err) {
  //       console.error('Network scan failed:', err)
  //     }
  //   }

  //   return devices
  // }

  static async scanAll(manualIP = null) {
    const [usb, ble, net] = await Promise.all([
      this.scanUSB(),
      this.scanBluetooth(),
      this.scanNetwork(manualIP)
    ])
    return [...usb, ...ble, ...net]
  }

  static async scanBluetooth() {
    try {
      return await Bluetooth.scan()
    } catch (err) {
      console.error('Bluetooth scan failed:', err)
      return []
    }
  }

  static async scanUSB() {
    try {
      return await USB.scan()
    } catch (err) {
      console.error('USB scan failed:', err)
      return []
    }
  }

  static async scanNetwork(manualIP = null) {
    const devices = []
    if (manualIP && manualIP.trim()) {
      const device = this.createNetworkPrinterFromIP(manualIP)
      if (device) devices.push(device)
    } else {
      try {
        const netDevices = await Network.scan()
        devices.push(...netDevices)
      } catch (err) {
        console.error('Network scan failed:', err)
      }
    }
    return devices
  }

  /** Connect & remember the device */
  static async connect(device) {
    console.log({ device })
    try {
      connectedDevice = device
      await savePrinterInfo(device)
      switch (device.type) {
        case 'bluetooth':
          return Bluetooth.connect(device.address)
        case 'usb':
          return USB.connect(device.address)
        case 'network':
          return Network.connect(device.address)
      }
      await delay(300)

      // ✅ send ESC @ init sequence if supported
      // await this.escPrint()
      // try {
      //   let PrinterAPI = BLEPrinter
      //   if (device.type === 'usb') PrinterAPI = USBPrinter
      //   if (device.type === 'network') PrinterAPI = NetPrinter

      //   const initCmd = '\x1B\x40' // ESC @
      //   await PrinterAPI.printText(initCmd)
      // } catch (e) {
      //   console.warn('Printer init failed:', e)
      // }
    } catch (err) {
      console.error(err)
      connectedDevice = null
    }
  }

  static async escPrint(printerAPI) {
    await delay(300)
    try {
      const initCmd = '\x1B\x40' // ESC @
      await printerAPI.printText(initCmd)
    } catch (e) {
      console.warn('Printer init failed:', e)
    }
  }

  /** Disconnect and clear */
  static async disconnect() {
    if (!connectedDevice) return
    try {
      switch (connectedDevice.type) {
        case 'bluetooth':
          await Bluetooth.disconnect()
          break
        case 'usb':
          await USB.disconnect()
          break
        case 'network':
          await Network.disconnect()
          break
      }
    } finally {
      connectedDevice = null
      await clearPrinterInfo()
    }
  }

  static async print(text, options = {}) {
    // Validate and create proper options object
    const printOptions = createPrintOptions(options)

    // Check if printer is connected, if not redirect to settings
    if (!connectedDevice) {
      if (navigationRef) {
        Alert.alert(
          'No Printer Connected',
          'Please go to settings to select and connect a printer first.',
          [
            {
              text: 'Go to Settings',
              onPress: () => navigationRef.navigate('Profile')
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        )
        return
      } else {
        return Alert.alert(
          'No printer connected',
          'Please connect a printer first.'
        )
      }
    }

    let PrinterAPI = BLEPrinter

    switch (connectedDevice.type) {
      case 'bluetooth':
        PrinterAPI = BLEPrinter
        break
      case 'usb':
        PrinterAPI = USBPrinter
        break
      case 'network':
        PrinterAPI = NetPrinter
        break
    }
    // await this.escPrint(PrinterAPI)
    try {
      if (printOptions.cutPaper) {
        await PrinterAPI.printBill(text)
      } else {
        await PrinterAPI.printText(text)
      }
    } catch (err) {
      console.error('Print failed:', err)
      Alert.alert(
        'Print Error',
        'Failed to print. Please check printer connection.'
      )
    }
  }

  static async printBase64(rawBase64, opts = {}) {
    // Check if printer is connected, if not redirect to settings
    if (!connectedDevice) {
      if (navigationRef) {
        Alert.alert(
          'No Printer Connected',
          'Please go to settings to select and connect a printer first.',
          [
            {
              text: 'Go to Settings',
              onPress: () => navigationRef.navigate('Profile')
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        )
        return
      } else {
        return Alert.alert(
          'No printer connected',
          'Please connect a printer first.'
        )
      }
    }

    let PrinterAPI = BLEPrinter

    switch (connectedDevice.type) {
      case 'bluetooth':
        PrinterAPI = BLEPrinter
        break
      case 'usb':
        PrinterAPI = USBPrinter
        break
      case 'network':
        PrinterAPI = NetPrinter
        break
    }

    // await this.escPrint(PrinterAPI)

    try {
      await PrinterAPI.printImageBase64(rawBase64, opts)
    } catch (err) {
      console.error('Print Base64 failed:', err)
      Alert.alert(
        'Print Error',
        'Failed to print image. Please check printer connection.'
      )
    }
  }
}

export default PrinterManager
