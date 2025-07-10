import {
  USBPrinter
} from 'react-native-thermal-receipt-printer-image-qr';
import { createPrinterDevice } from './types';

export const USB = {
  async scan() {
    try {
      await USBPrinter.init();
      const list = await USBPrinter.getDeviceList();

      if (!Array.isArray(list)) {
        return [];
      }

      return list.map(d => createPrinterDevice(
        d.device_name,
        `${d.vendor_id}:${d.product_id}`,
        'usb'
      ));
    } catch (error) {
      console.error('Error scanning USB printers:', error);
      return [];
    }
  },

  async connect(address) {
    try {
      const [vendorId, productId] = address.split(':');
      if (!vendorId || !productId) {
        throw new Error('Invalid USB address format. Expected "vendorId:productId".');
      }
      await USBPrinter.init(); // initialize USB
      // small delay to let Android establish the socket
      await new Promise(res => setTimeout(res, 3000));
      const printer = await USBPrinter.connectPrinter(vendorId, productId);
      printer.type = 'usb';
      return printer;
    } catch (error) {
      console.error(`Error connecting to USB printer ${address}:`, error);
      throw error;
    }
  },

  async disconnect() {
    try {
      await USBPrinter.closeConn();
    } catch (error) {
      console.error('Error disconnecting USB printer:', error);
    }
  },
};
