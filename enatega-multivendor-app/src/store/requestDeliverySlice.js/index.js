// slices/requestDeliverySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  addressFrom: null,
  regionFrom: null,
  addressTo: null,
  regionTo: null
}

const requestDeliverySlice = createSlice({
  name: 'requestDelivery',
  initialState,
  reducers: {
    setAddressFrom: (state, action) => {
      console.log({ action })
      state.addressFrom = action.payload.addressFrom
      state.regionFrom = action.payload.regionFrom
    },
    setAddressTo: (state, action) => {
      console.log({ action })
      state.addressTo = action.payload.addressTo
      state.regionTo = action.payload.regionTo
    }
  }
})

export const { setAddressFrom, setAddressTo } = requestDeliverySlice.actions
const requestDeliveryReducer = requestDeliverySlice.reducer
export default requestDeliveryReducer
