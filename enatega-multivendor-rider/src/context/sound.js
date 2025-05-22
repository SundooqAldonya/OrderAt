import React, { useContext, useEffect, useState } from 'react'
import { useTabsContext } from './tabs'
import { Audio } from 'expo-av'
import { useUserContext } from './user'
import useSidebar from '../components/Sidebar/useSidebar'
import beep1 from '../assets/beep1.wav'

const SoundContext = React.createContext()

export const SoundContextProvider = ({ children }) => {
  const [sound, setSound] = useState(null)
  const { active } = useTabsContext()
  const { assignedOrders } = useUserContext()
  const { isEnabled, isMuted } = useSidebar()
  const [seenOrders, setSeenOrders] = useState([])

  useEffect(() => {
    if (assignedOrders) {
      const newOrderIds = assignedOrders
        .filter(order => order?.isRiderRinged)
        .map(order => order._id)
      const unseenOrderIds = newOrderIds.filter(id => !seenOrders.includes(id))
      // console.log({ unseenOrderIds })
      // const shouldPlaySound = assignedOrders.some(order => order?.isRiderRinged)
      // console.log({ shouldPlaySound })
      // if (unseenOrderIds.length) {
      //   playSound()
      // } else {
      //   stopSound()
      // }
    }
  }, [assignedOrders])

  const playSound = async () => {
    // console.log({ isMuted })
    if (isEnabled && !isMuted) {
      if (sound) await stopSound()
      if (active === 'NewOrders') {
        const { sound } = await Audio.Sound.createAsync(beep1)
        await sound.setIsLoopingAsync(true)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: (Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS = 2),
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: (Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS = 2),
          playThroughEarpieceAndroid: false
        })
        await sound.playAsync()
        setSound(sound)
      }
    }
  }

  const stopSound = async () => {
    try {
      await sound?.unloadAsync()
    } catch (err) {
      console.error('Error stopping sound:', err)
    }
  }

  return (
    <SoundContext.Provider
      value={{ playSound, stopSound, seenOrders, setSeenOrders }}>
      {children}
    </SoundContext.Provider>
  )
}
export const SoundContextConsumer = SoundContext.Consumer
export const useSoundContext = () => useContext(SoundContext)
export default SoundContext
