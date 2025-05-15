// slices/phoneSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  phone: ''
}

const phoneSlice = createSlice({
  name: 'phone',
  initialState,
  reducers: {
    setPhone: (state, action) => {
      console.log({ action })
      state.phone = action.payload.phone
    }
  }
})

export const { setPhone } = phoneSlice.actions
const phoneReducer = phoneSlice.reducer
export default phoneReducer
