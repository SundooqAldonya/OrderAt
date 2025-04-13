import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import cityReducer from './citySlice' // Replace with your reducer's path
import printerReducer from './printersSlice'

// Configuration for redux-persist
const persistConfig = {
  key: 'cityId', // Root key for AsyncStorage
  storage: AsyncStorage // Use AsyncStorage
  // whitelist: ['city'] // Reducers to persist
}

// Wrap the city reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, cityReducer)

// Configure the Redux store
export const store = configureStore({
  reducer: {
    city: persistedReducer,
    printers: printerReducer
  }
})

// Create a persistor to manage the persistence lifecycle
export const persistor = persistStore(store)
