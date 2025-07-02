// slices/requestDeliverySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  addressFrom: null,
  regionFrom: null,
  labelFrom: null,
  addressFreeTextFrom: null,
  addressTo: null,
  regionTo: null,
  labelTo: null,
  addressFreeTextTo: null,
  chooseFromMapFrom: false,
  currentPosSelectedFrom: false,
  chooseFromAddressBookFrom: false,
  chooseFromMapTo: false,
  currentPosSelectedTo: false,
  chooseFromAddressBookTo: false
}

const requestDeliverySlice = createSlice({
  name: 'requestDelivery',
  initialState,
  reducers: {
    setAddressFrom: (state, action) => {
      console.log({ action })
      state.addressFrom = action.payload.addressFrom
      state.regionFrom = action.payload.regionFrom
      state.addressFreeTextFrom = action.payload.addressFreeTextFrom
      state.labelFrom = action.payload.labelFrom
    },
    setAddressTo: (state, action) => {
      console.log({ action })
      state.addressTo = action.payload.addressTo
      state.regionTo = action.payload.regionTo
      state.addressFreeTextTo = action.payload.addressFreeTextTo
      state.labelTo = action.payload.labelTo
    },
    setChooseFromMapTo: (state, action) => {
      state.chooseFromMapTo = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromAddressBookTo = false
      }
    },

    setChooseFromAddressBookTo: (state, action) => {
      state.chooseFromAddressBookTo = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromMapTo = false
      }
    },

    // Optional: same logic for "From"
    setChooseFromMapFrom: (state, action) => {
      state.chooseFromMapFrom = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromAddressBookFrom = false
      }
    },

    setChooseFromAddressBookFrom: (state, action) => {
      state.chooseFromAddressBookFrom = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromMapFrom = false
      }
    }
  }
})

export const {
  setAddressFrom,
  setAddressTo,
  setChooseFromMapFrom,
  setChooseFromMapTo,
  setChooseFromAddressBookFrom,
  setChooseFromAddressBookTo
} = requestDeliverySlice.actions
const requestDeliveryReducer = requestDeliverySlice.reducer
export default requestDeliveryReducer
