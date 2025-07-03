import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  address: null,
  region: null,
  label: null,
  addressFreeText: null,
  selectedCity: null,
  selectedArea: null,
  selectedCityAndArea: false,
  chooseFromMap: false,
  currentPosSelected: false,
  chooseFromAddressBook: false
}

const addNewAddressSlice = createSlice({
  name: 'addNewAddress',
  initialState,
  reducers: {
    setAddress(state, action) {
      state.address = action.payload.address
      state.region = action.payload.region
      state.label = action.payload.label
      state.addressFreeText = action.payload.addressFreeText
    },
    setChooseFromMap(state, action) {
      state.chooseFromMap = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromAddressBook = false
        state.selectedCityAndArea = false
      }
    },
    setChooseFromAddressBook(state, action) {
      state.chooseFromAddressBook = action.payload.status
      if (action.payload.status === true) {
        state.chooseFromMap = false
        state.selectedCityAndArea = false
      }
    },
    setSelectedCity(state, action) {
      state.selectedCity = action.payload
    },
    setSelectedArea(state, action) {
      state.selectedArea = action.payload
      state.selectedCityAndArea = true
      state.chooseFromMap = false
      state.chooseFromAddressBook = false
    },
    setCurrentPosSelected(state, action) {
      state.currentPosSelected = action.payload
    },
    resetAddNewAddress: (state) => initialState
  }
})

export const {
  setAddress,
  setChooseFromMap,
  setChooseFromAddressBook,
  setSelectedCity,
  setSelectedArea,
  setCurrentPosSelected,
  resetAddNewAddress
} = addNewAddressSlice.actions

const addNewAddressReducer = addNewAddressSlice.reducer
export default addNewAddressReducer
