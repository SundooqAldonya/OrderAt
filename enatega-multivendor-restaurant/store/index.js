import { configureStore } from '@reduxjs/toolkit'
import cityReducer from './citySlice'
import printerReducer from './printersSlice'

export const store = configureStore({
  reducer: {
    city: cityReducer,
    printers: printerReducer
  }
})
