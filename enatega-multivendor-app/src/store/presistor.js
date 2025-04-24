import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import requestDeliveryReducer from './requestDeliverySlice.js'

const rootReducer = combineReducers({
  requestDelivery: requestDeliveryReducer
})

const persistConfig = {
  key: 'root', // Root key for AsyncStorage
  storage: AsyncStorage, // Use AsyncStorage
  whitelist: ['city'] // Reducers to persist
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store)
