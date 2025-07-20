import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Modal,
  Button,
  Platform,
  Linking,
  StyleSheet
} from 'react-native'
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync
} from 'expo-tracking-transparency'

export default function TrackingPermissionModal() {
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    checkTrackingStatus()
  }, [])

  const checkTrackingStatus = async () => {
    const { status } = await getTrackingPermissionsAsync()
    setStatus(status)

    if (Platform.OS === 'ios' && status === 'undetermined') {
      setShowModal(true)
    }
  }

  const handleRequestPermission = async () => {
    setShowModal(false)
    const { status } = await requestTrackingPermissionsAsync()
    setStatus(status)

    if (status === 'granted') {
      // ✅ Now you can safely use IDFA or tracking SDKs (like Facebook Ads)
      console.log('Tracking granted ✅')
    } else if (status === 'denied') {
      // User said no - maybe show subtle reminder later
      console.log('Tracking denied ❌')
    }
  }

  const openSettings = () => {
    Linking.openURL('app-settings:')
  }

  // if (status === 'denied') {
  //   // Optionally show a small reminder/toast/banner in your app
  //   return (
  //     <View style={styles.reminderContainer}>
  //       <Text style={styles.reminderText}>
  //         Enable tracking for better experience in Settings
  //       </Text>
  //       <Button title='Open Settings' onPress={openSettings} />
  //     </View>
  //   )
  // }

  return (
    <Modal visible={showModal} transparent animationType='slide'>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Help us improve your experience</Text>
          <Text style={styles.description}>
            We use tracking to offer better content and personalized ads. Your
            data is safe.
          </Text>
          <Button title='Continue' onPress={handleRequestPermission} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  description: {
    fontSize: 15,
    marginBottom: 20
  },
  reminderContainer: {
    padding: 15,
    backgroundColor: '#fffbe6',
    borderColor: '#ffd700',
    borderWidth: 1,
    margin: 10,
    borderRadius: 8
  },
  reminderText: {
    marginBottom: 8,
    fontSize: 14
  }
})
