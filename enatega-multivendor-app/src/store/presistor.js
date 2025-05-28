import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import requestDeliveryReducer from './requestDeliverySlice'
import phoneReducer from './phoneSlice'
import restaurantReducer from './restaurantSlice'

const rootReducer = combineReducers({
  requestDelivery: requestDeliveryReducer,
  phone: phoneReducer,
  restaurant: restaurantReducer
})

const persistConfig = {
  key: 'root', // Root key for AsyncStorage
  storage: AsyncStorage, // Use AsyncStorage
  whitelist: ['requestDelivery'], // Reducers to persist
  blacklist: ['phone']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store)
