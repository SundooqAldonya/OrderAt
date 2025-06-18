import React from 'react'
import { Alert } from 'react-native'

import { Bluetooth } from './bluetooth'
import { USB } from './usb'
import { Network } from './network'
import {
  BLEPrinter,
  USBPrinter,
  NetPrinter,
  COMMANDS,
  ColumnAlignment,
  CENTER
} from 'react-native-thermal-receipt-printer-image-qr'

let connectedDevice = null

export class PrinterManager {
  /**
   * Scan BLE, USB and Network in sequence.
   * If one fails, we log the error and keep going.
   */
  static async scanAll1() {
    const devices = []

    // 1) USB
    try {
      const usbDevices = await USB.scan()
      devices.push(...usbDevices)
    } catch (err) {
      console.error('USB scan failed:', err)
    }

    // 2) BLE
    try {
      const bleDevices = await Bluetooth.scan()
      devices.push(...bleDevices)
    } catch (err) {
      console.error('Bluetooth scan failed:', err)
    }

    // 3) Network
    try {
      const netDevices = await Network.scan()
      devices.push(...netDevices)
    } catch (err) {
      console.error('Network scan failed:', err)
    }

    return devices
  }

  /**
   * Kick off all three scans in parallel, then
   * pick out the successful results.
   */
  static async scanAll() {
    // start all three at once
    const scanners = [USB.scan(), Bluetooth.scan(), Network.scan()]
    const names = ['USB', 'Bluetooth', 'Network']

    // wait until they all settle
    const results = await Promise.allSettled(scanners)

    // collect successes; log failures
    return results.reduce((acc, res, i) => {
      if (res.status === 'fulfilled') {
        acc.push(...res.value)
      } else {
        console.error(`${names[i]} printer scan failed:`, res.reason)
      }
      return acc
    }, [])
  }

  /** Connect & remember the device */
  static async connect(device) {
    try {
      connectedDevice = device
      switch (device.type) {
        case 'bluetooth':
          return Bluetooth.connect(device.address)
        case 'usb':
          return USB.connect(device.address)
        case 'network':
          return Network.connect(device.address)
      }
    } catch (err) {
      console.error(err)
      connectedDevice = null
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
    }
  }

  static async print(text, options) {
    if (!connectedDevice) {
      const printers = await this.scanAll()
      const printer = printers[0] //printers.find((device) => device.name === 'XP-P323B-4FEE');

      if (printers.length > 0) {
        try {
          await this.connect(printer)
        } catch (err) {
          console.error(err)
          return Alert.alert('No connected printer', 'Please connect first.')
        }
      } else {
        return Alert.alert('No printer', 'Please connect first.')
      }
    }
    //else {await this.connect(connectedDevice);}

    if (!connectedDevice) {
      return Alert.alert('No printer', 'Please connect first1.')
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

    try {
      if (options.cutPaper) {
        await PrinterAPI.printBill(text)
      } else {
        await PrinterAPI.printText(text)
      }
    } catch (err) {
      console.error('Print failed:', err)
    }
  }

  static async printBase64(rawBase64, opts) {
    if (!connectedDevice) {
      const printers = await this.scanAll()
      const printer = printers[0] //printers.find((device) => device.name === 'XP-P323B-4FEE');

      if (printers.length > 0) {
        try {
          await this.connect(printer)
        } catch (err) {
          console.error(err)
          return Alert.alert('No connected printer', 'Please connect first.')
        }
      } else {
        return Alert.alert('No printer', 'Please connect first.')
      }
    }
    //else {await this.connect(connectedDevice);}

    if (!connectedDevice) {
      return Alert.alert('No printer', 'Please connect first1.')
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

    try {
      await PrinterAPI.printImageBase64(rawBase64, opts)
    } catch (err) {
      console.error(err)
    }
  }
}

export default PrinterManager
