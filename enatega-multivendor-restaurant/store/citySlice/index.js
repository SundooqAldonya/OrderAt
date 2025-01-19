import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cityId: null
}

export const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    setCity: (state, action) => {
      console.log({ payload: action.payload })
      state.cityId = action.payload.cityId
    }
  }
})

export const { setCity } = citySlice.actions
const cityReducer = citySlice.reducer
export default cityReducer
