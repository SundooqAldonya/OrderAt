import * as ImageManipulator from 'expo-image-manipulator'
import { Skia } from '@shopify/react-native-skia'
import { Buffer } from 'buffer'
import { toByteArray } from 'base64-js'

export const imageToBase64 = async uri => {
  console.log({ uri })
  const result = await ImageManipulator.manipulateAsync(
    uri, // URI of the image
    [{ resize: { width: 300 } }], // actions: crop, rotate, flip, resize etc.
    { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true } // options
  )
  // console.log({ result })
  return result.base64
}

export const convertToBWBitmap = base64 => {
  console.log('here in convert')
  // console.log({ base64: Buffer.from(base64, 'base64').toString('binary') })
  // const bytes = toByteArray(base64)
  const data = Skia.Data.fromBase64(base64)
  console.log({ data })
  const image = Skia.Image.MakeImageFromEncoded(data)
  console.log({ image })
  const width = image.width()
  const height = image.height()

  let rasterBytes = [] // ESC/POS bit image mode
  for (let y = 0; y < height; y += 24) {
    rasterBytes.push(0x1b, 0x2a, 33, width & 0xff, (width >> 8) & 0xff)

    for (let x = 0; x < width; x++) {
      for (let k = 0; k < 3; k++) {
        let byte = 0
        for (let b = 0; b < 8; b++) {
          const pixelY = y + k * 8 + b
          if (pixelY >= height) break
          const color = image.getColor(x, pixelY)
          const gray = (color.r + color.g + color.b) / 3
          if (gray < 128) byte |= 1 << (7 - b)
        }
        rasterBytes.push(byte)
      }
    }
    rasterBytes.push(0x0a) // line break
  }
  return Buffer.from(rasterBytes)
}

function base64ToUint8Array(base64) {
  const binaryStr = atob(base64)
  const len = binaryStr.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return bytes
}
