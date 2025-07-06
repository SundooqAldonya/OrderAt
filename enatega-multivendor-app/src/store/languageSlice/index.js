// slices/languageSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  language: null
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      console.log({ action })
      state.language = action.payload.language
    }
  }
})

export const { setLanguage } = languageSlice.actions
const languageReducer = languageSlice.reducer
export default languageReducer
