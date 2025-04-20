import { NativeModules } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { Skia } from '@shopify/react-native-skia'
import { toByteArray } from 'base64-js'
import { Buffer } from 'buffer'
import { NetPrinter } from 'react-native-thermal-receipt-printer'

const { RNNetPrinter } = NativeModules

/**
 * 1) Convert a base64‑PNG (from view‑shot) into
 *    a raw ESC/POS bit‑image buffer.
 */
function pngToEscPosBits(base64) {
  const data = Skia.Data.fromBase64(base64)
  if (!data) throw new Error('❌ Skia.Data.fromBase64 returned null')

  const img = Skia.Image.MakeImageFromEncoded(data)
  if (!img) throw new Error('❌ Skia.Image.MakeImageFromEncoded failed')

  const w = img.width(),
    h = img.height()
  console.log('🖼️ Image dimensions:', w, h)

  // draw → snapshot → RGBA
  const surf = Skia.Surface.Make(w, h)
  console.log({ surf })
  const cvs = surf.getCanvas()
  console.log({ cvs })
  cvs.clear(0xffffffff)
  cvs.drawImage(img, 0, 0)
  // const pixels = surf.makeImageSnapshot().readPixels() // Uint8Array RGBA
  // console.log({ pixels })
  const snapshot = surf.makeImageSnapshot()
  if (!snapshot) throw new Error('❌ Failed to make image snapshot')

  const pixels = snapshot.readPixels()
  if (!pixels || pixels.length === 0)
    throw new Error('❌ Failed to read pixels')

  console.log('✅ Pixels read successfully', pixels.length)
  // build 24‑dot ESC * 33 bit image
  const out = []
  for (let y = 0; y < h; y += 24) {
    out.push(0x1b, 0x2a, 33, w & 0xff, (w >> 8) & 0xff)
    for (let x = 0; x < w; x++) {
      for (let band = 0; band < 3; band++) {
        let slice = 0
        for (let b = 0; b < 8; b++) {
          const yy = y + band * 8 + b
          if (yy < h) {
            const idx = (yy * w + x) * 4
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3
            if (gray < 128) slice |= 1 << (7 - b)
          }
        }
        out.push(slice)
      }
    }
    out.push(0x0a)
  }
  return Uint8Array.from(out)
}

/**
 * 2) Wrap those bits in the “Define NV bit image” command:
 *    GS ( L pL pH 0x30 m xL xH yL yH [d…]
 *    where m = 1 (logo slot #1)
 */
function buildStoreLogoCmd(bits, width, height, slot = 1) {
  const dataLen = bits.length + 6
  const pL = dataLen & 0xff
  const pH = (dataLen >> 8) & 0xff
  const xL = (width / 8) & 0xff
  const xH = ((width / 8) >> 8) & 0xff
  const yL = height & 0xff
  const yH = (height >> 8) & 0xff

  return Uint8Array.from([
    0x1d,
    0x28,
    0x4c, // GS ( L
    pL,
    pH, // parameter length
    0x30, // sub‑function 0x30 = “store”
    slot, // slot number (1–255)
    xL,
    xH,
    yL,
    yH, // image size
    ...bits // the actual bit‑image data
  ])
}

/**
 * 3) Build the tiny “Print NV bit image” command:
 *    FS p m n   →   0x1C 0x70 slot n
 */
function buildPrintLogoCmd(slot = 1, times = 1) {
  return Uint8Array.from([0x1c, 0x70, slot, times])
}

/**
 * 4) Download logo into printer slot #1
 */
export async function downloadLogo(viewRef, printerIp, port = 9100) {
  // capture view, get base64 PNG
  if (!viewRef) throw new Error('downloadLogo: invalid view ref')

  const base64 = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'base64'
  })

  // convert → bits
  const bits = pngToEscPosBits(base64)
  const img = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(base64))
  const w = img.width()
  const h = img.height()

  // build store command
  const storeCmd = buildStoreLogoCmd(bits, w, h, 1)
  const b64cmd = Buffer.from(storeCmd).toString('base64')

  // send to printer
  RNNetPrinter.connectPrinter(
    printerIp,
    port,
    () => {
      console.log('✅ Connected to printer')
      // now you can send the data

      RNNetPrinter.printRawData(b64cmd, err => {
        if (err) console.warn('Print error', err)
        else console.log('Printed OK!')
        RNNetPrinter.closeConn()
      })
    },
    error => {
      console.warn('❌ Failed to connect to printer:', error)
    }
  )
  // await NetPrinter.init()
  // await NetPrinter.connectPrinter(printerIp, port)
  // await NetPrinter.printRawData(b64cmd)
  // await NetPrinter.closeConn()
}
