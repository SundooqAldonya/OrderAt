// slices/languageSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  city: null
}

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    setCity: (state, action) => {
      console.log({ action })
      state.city = action.payload.city
    }
  }
})

export const { setCity } = citySlice.actions
const cityReducer = citySlice.reducer
export default cityReducer
