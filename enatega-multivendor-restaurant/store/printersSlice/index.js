import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  showPrinters: false,
  printerIP: null,
  printers: [],
  connectedDevice: null,
  isScanning: false
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
    }
  }
})

export const {
  setPrinter,
  setPrinters,
  showPrintersFn,
  setConnectedDevice,
  setIsScanning,
  clearConnectedDevice
} = printerSlice.actions
const printerReducer = printerSlice.reducer
export default printerReducer
