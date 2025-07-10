import {
  BLEPrinter
} from 'react-native-thermal-receipt-printer-image-qr';
import { createPrinterDevice } from './types';

export const Bluetooth = {
  async scan() {
    try {
      await BLEPrinter.init(); // initialize BLE
      const list = await BLEPrinter.getDeviceList();

      if (!Array.isArray(list)) {
        console.error('Error scanning Bluetooth printers!!!');
        return [];
      }

      return list.map(d => createPrinterDevice(
        d.device_name,
        d.inner_mac_address,
        'bluetooth'
      ));
    } catch (error) {
      console.error('Error scanning Bluetooth printers:', error);
      return [];
    }
  },

  async connect(address) {
    try {
      await BLEPrinter.init(); // initialize BLE
      // small delay to let Android establish the socket
      await new Promise(res => setTimeout(res, 3000));
      const printer = await BLEPrinter.connectPrinter(address);
      printer.type = 'bluetooth';
      return printer;
    } catch (error) {
      console.error(`Error connecting to BLE printer ${address}:`, error);
      throw error;
    }
  },

  async disconnect() {
    try {
      await BLEPrinter.closeConn();
    } catch (error) {
      console.error('Error disconnecting BLE printer:', error);
    }
  },
};
