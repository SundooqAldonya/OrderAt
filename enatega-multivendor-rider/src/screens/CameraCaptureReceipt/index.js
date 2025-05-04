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
import { useTranslation } from 'react-i18next'
import { Audio } from 'expo-av'
import { gql, useMutation } from '@apollo/client'
import { updateOrderStatusRider } from '../../apollo/mutations'
import { useRoute } from '@react-navigation/native'
import { ReactNativeFile } from 'apollo-upload-client'

const UPDATE_ORDER_STATUS = gql`
  ${updateOrderStatusRider}
`

const CameraCaptureReceipt = () => {
  const { t } = useTranslation()
  const { itemId } = useRoute().params
  const {
    distance,
    duration,
    order,
    route,
    navigation,
    orderID
  } = useOrderDetail()

  const [mutateOrderStatus, { loading }] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: data => {
      console.log({ data })
      navigation.goBack()
    },
    onError: err => {
      console.log({ err })
    }
  })

  const cameraRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [image, setImage] = useState(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [showCamera, setShowCamera] = useState(true)

  useEffect(() => {
    requestPermission()
  }, [])

  const uriToBlob = async uri => {
    const response = await fetch(uri)
    console.log({ response })
    const blob = await response.blob()
    return blob
  }

  const handleSubmit = async () => {
    const file = new ReactNativeFile({
      uri: photo,
      type: 'image/jpeg',
      name: `${itemId}-pickup.jpg`
    })

    console.log({ file })
    mutateOrderStatus({
      variables: { id: itemId, status: 'PICKED', file }
    })
  }

  const uploadImage = async uri => {
    try {
      console.log(1)
      const blob = await uriToBlob(uri)
      console.log(2)
      const file = new File([blob], `${itemId}-pickup.jpg`, {
        type: 'image/jpeg'
      })
      console.log(3)
      // const file = await createFileObject(uri)
      console.log({ file })
      setImage(file)
      console.log(4)
      console.log('Image uploaded successfully:', result.data.uploadImage.url)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false
      })
      const photoData = await cameraRef.current.takePictureAsync({
        shutterSound: false,
        skipProcessing: true
      })
      setPhoto(photoData.uri)
      // await uploadImage(photoData.uri)
      setShowCamera(false)
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
        <CameraView style={cameraStyle.camera} ref={cameraRef} mute={true}>
          <TouchableOpacity
            style={cameraStyle.closeBtn}
            onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={takePicture}
            style={cameraStyle.buttonContainer}></TouchableOpacity>
        </CameraView>
      ) : (
        <View>
          <TouchableOpacity
            style={cameraStyle.closeBtn}
            onPress={() => setShowCamera(true)}>
            <AntDesign name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: photo }} style={cameraStyle.camera} />
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              ...cameraStyle.sendBtn,
              backgroundColor: loading ? 'grey' : 'green'
            }}
            disabled={loading}>
            <TextDefault style={{ color: '#fff' }}>
              {loading ? t('loading') : t('submit')}
            </TextDefault>
          </TouchableOpacity>
        </View>
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
    top: 50,
    right: 30,
    zIndex: 9999
  },
  closeText: {
    fontSize: 20,
    color: '#fff'
  },
  sendBtn: {
    zIndex: 999999,
    backgroundColor: 'green',
    width: 100,
    height: 50,
    position: 'absolute',
    bottom: 70,
    borderRadius: 8,
    alignSelf: 'center', // Centers the button horizontally
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  }
})

export default CameraCaptureReceipt
