// slices/deliveryAmountSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  deliveryAmount: 0
}

const deliveryAmountSlice = createSlice({
  name: 'deliveryAmount',
  initialState,
  reducers: {
    setDeliveryAmount: (state, action) => {
      console.log({ action })
      state.deliveryAmount = action.payload.deliveryAmount
    }
  }
})

export const { setDeliveryAmount } = deliveryAmountSlice.actions
const deliveryAmountReducer = deliveryAmountSlice.reducer
export default deliveryAmountReducer
