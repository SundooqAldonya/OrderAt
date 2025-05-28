// slices/restaurantSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  restaurantId: ''
}

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurant: (state, action) => {
      console.log({ action })
      state.restaurantId = action.payload.restaurantId
    }
  }
})

export const { setRestaurant } = restaurantSlice.actions
const restaurantReducer = restaurantSlice.reducer
export default restaurantReducer
