import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { AppState } from 'react-native'
import { recreateWsClient } from './client'

export const useWsReconnect = () => {
  useEffect(() => {
    const unsubscribeNet = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('📶 Network reconnected — refreshing WS connection...')
        recreateWsClient()
      }
    })

    const handleAppStateChange = state => {
      if (state === 'active') {
        console.log('📱 App became active — refreshing WS connection...')
        recreateWsClient()
      }
    }

    const appSub = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      unsubscribeNet()
      appSub.remove()
    }
  }, [])
}
