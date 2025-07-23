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
  selectedCityFrom: null,
  selectedAreaFrom: null,
  selectedCityAndAreaFrom: false,
  selectedCityTo: null,
  selectedAreaTo: null,
  selectedCityAndAreaTo: false,
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
      const regionFrom = { ...action.payload.regionFrom }
      state.addressFrom = action.payload.addressFrom
      state.regionFrom = regionFrom
      state.addressFreeTextFrom = action.payload.addressFreeTextFrom
      state.labelFrom = action.payload.labelFrom
    },
    setAddressTo: (state, action) => {
      console.log({ action })
      const regionTo = { ...action.payload.regionTo }
      state.addressTo = action.payload.addressTo
      state.regionTo = regionTo
      state.addressFreeTextTo = action.payload.addressFreeTextTo
      state.labelTo = action.payload.labelTo
    },
    setChooseFromMapTo: (state, action) => {
      state.chooseFromMapTo = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromAddressBookTo = false
        state.selectedCityAndAreaTo = false
      }
    },

    setChooseFromAddressBookTo: (state, action) => {
      state.chooseFromAddressBookTo = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromMapTo = false
        state.selectedCityAndAreaTo = false
      }
    },

    // Optional: same logic for "From"
    setChooseFromMapFrom: (state, action) => {
      state.chooseFromMapFrom = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromAddressBookFrom = false
        state.selectedCityAndAreaFrom = false
      }
    },

    setResetBooleansFrom: (state, action) => {
      state.chooseFromMapFrom = false
      state.chooseFromAddressBookFrom = false
      state.selectedCityAndAreaFrom = false
    },
    setResetBooleansTo: (state, action) => {
      state.chooseFromMapTo = false
      state.chooseFromAddressBookTo = false
      state.selectedCityAndAreaTo = false
    },

    setChooseFromAddressBookFrom: (state, action) => {
      state.chooseFromAddressBookFrom = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromMapFrom = false
        state.selectedCityAndAreaFrom = false
      }
    },

    setSelectedCityFrom: (state, action) => {
      state.selectedCityFrom = action.payload
    },

    setSelectedAreaFrom: (state, action) => {
      state.selectedAreaFrom = action.payload
      state.selectedCityAndAreaFrom = true
      state.chooseFromMapFrom = false
      state.chooseFromAddressBookFrom = false
    },

    setSelectedCityTo: (state, action) => {
      state.selectedCityTo = action.payload
    },

    setSelectedAreaTo: (state, action) => {
      state.selectedAreaTo = action.payload
      state.selectedCityAndAreaTo = true
      state.chooseFromMapTo = false
      state.chooseFromAddressBookTo = false
    },
    resetRequestDelivery: (state) => initialState
  }
})

export const {
  setAddressFrom,
  setAddressTo,
  setChooseFromMapFrom,
  setResetBooleansFrom,
  setResetBooleansTo,
  setChooseFromMapTo,
  setChooseFromAddressBookFrom,
  setChooseFromAddressBookTo,
  setSelectedCityFrom,
  setSelectedAreaFrom,
  setSelectedCityTo,
  setSelectedAreaTo,
  resetRequestDelivery
} = requestDeliverySlice.actions
const requestDeliveryReducer = requestDeliverySlice.reducer
export default requestDeliveryReducer
