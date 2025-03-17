import { View, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { useRef } from 'react'
import { useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera'
import useOrderDetail from '../OrderDetail/useOrderDetail'
import { useEffect } from 'react'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { TouchableOpacity } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

const CameraCaptureReceipt = () => {
  const {
    distance,
    duration,
    order,
    route,
    navigation,
    orderID
  } = useOrderDetail()
  const cameraRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [showCamera, setShowCamera] = useState(true)

  useEffect(() => {
    requestPermission()
  }, [])

  const captureReceipt = async () => {
    setShowCamera(true)
    // if (permission?.granted && cameraRef.current) {
    //   const photo = await cameraRef.current.takePictureAsync()
    //   setPhoto(photo.uri)
    // }
    // mutateOrderStatus({
    //   variables: { id: itemId, status: 'PICKED' }
    // })
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync()
      setPhoto(photoData.uri)
      setShowCamera(false) // Hide the camera after taking a picture
    }
  }

  if (!permission?.granted) {
    return (
      <View>
        <TextDefault>Requesting camera permission...</TextDefault>
      </View>
    )
  }
  return (
    <SafeAreaView>
      {showCamera ? (
        <CameraView style={cameraStyle.camera}>
          <TouchableOpacity
            style={cameraStyle.closeBtn}
            onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={cameraStyle.buttonContainer}></TouchableOpacity>
        </CameraView>
      ) : (
        <Image source={{ uri: photo }} style={cameraStyle.camera} />
      )}
    </SafeAreaView>
  )
}

const cameraStyle = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: { width: '100%', height: '100%' },
  buttonContainer: {
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 50,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center', // Centers the button horizontally
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  closeBtn: {
    position: 'absolute',
    top: 30,
    right: 30
  },
  closeText: {
    fontSize: 20,
    color: '#fff'
  }
})

export default CameraCaptureReceipt
