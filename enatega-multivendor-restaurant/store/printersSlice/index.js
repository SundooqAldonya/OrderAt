import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  showPrinters: false,
  printerIP: null,
  printers: []
}

export const printerSlice = createSlice({
  name: 'printer',
  initialState,
  reducers: {
    showPrintersFn: state => {
      state.showPrinters = !state.showPrinters
    },
    setPrinters: (state, action) => {
      console.log({ actionPrinters: action.payload })
      const printers = [...action.payload.printers]
      state.printers = printers
    },
    setPrinter: (state, action) => {
      console.log({ payload: action.payload })
      state.printerIP = action.payload.printerIP
    }
  }
})

export const { setPrinter, setPrinters, showPrintersFn } = printerSlice.actions
const printerReducer = printerSlice.reducer
export default printerReducer
