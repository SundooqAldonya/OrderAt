import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import requestDeliveryReducer from './requestDeliverySlice'
import phoneReducer from './phoneSlice'
import restaurantReducer from './restaurantSlice'
import deliveryAmountReducer from './deliveryAmountSlice'
import addNewAddressReducer from './addNewAddressSlice'
import languageReducer from './languageSlice'
import cityReducer from './citySelectSlice'

const rootReducer = combineReducers({
  requestDelivery: requestDeliveryReducer,
  addNewAddress: addNewAddressReducer,
  phone: phoneReducer,
  restaurant: restaurantReducer,
  deliveryAmount: deliveryAmountReducer,
  language: languageReducer,
  city: cityReducer
})

const persistConfig = {
  key: 'root', // Root key for AsyncStorage
  storage: AsyncStorage, // Use AsyncStorage
  whitelist: ['requestDelivery', 'phone', 'language', 'city'] // Reducers to persist
  // blacklist: ['phone', 'deliveryAmount']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store)
