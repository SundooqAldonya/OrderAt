import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  showPrinters: false,
  printerIP: null,
  printers: [],
  connectedDevice: null,
  isScanning: false,
  pendingConnection: false,
  pendingPrinterInfo: null
}

export const printerSlice = createSlice({
  name: 'printer',
  initialState,
  reducers: {
    showPrintersFn: state => {
      state.showPrinters = !state.showPrinters
    },
    setPrinters: (state, action) => {
      const printers = [...action.payload.printers]
      state.printers = printers
    },
    setPrinter: (state, action) => {
      state.printerIP = action.payload.printerIP
    },
    setConnectedDevice: (state, action) => {
      state.connectedDevice = action.payload
    },
    setIsScanning: (state, action) => {
      state.isScanning = action.payload
    },
    clearConnectedDevice: state => {
      state.connectedDevice = null
    },
    restartRequired: state => {
      state.restartRequired = true
    },
    clearRestartRequired: state => {
      state.restartRequired = false
    },
    setPendingConnection: (state, action) => {
      state.pendingConnection = true
      state.pendingPrinterInfo = action.payload // should be { address, port, name, type }
    },
    clearPendingConnection: state => {
      state.pendingConnection = false
      state.pendingPrinterInfo = null
    }
  }
})

export const {
  setPrinter,
  setPrinters,
  showPrintersFn,
  setConnectedDevice,
  setIsScanning,
  clearConnectedDevice,
  setPendingConnection,
  clearPendingConnection
} = printerSlice.actions
const printerReducer = printerSlice.reducer
export default printerReducer
