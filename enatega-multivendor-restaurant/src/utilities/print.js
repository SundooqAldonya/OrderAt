import * as Print from 'expo-print'
import { formatReceipt } from './formatReceipt'
import { formattedPrintedText } from './formattedPrintedText'

export const printAsync = async (order, printerUrl, currency) => {
  try {
    return await Print.printAsync({
      width: 576, // 80mm=302px,
      orientation: Print.Orientation.portrait,
      html: formatReceipt(order, currency),
      printerUrl
    })
  } catch (error) {
    console.log('error', error)
  }
  return null
}

export const printToFileAsync = async (order, currency) => {
  try {
    return await Print.printToFileAsync({
      width: 576, // 80mm=302px,
      html: formatReceipt(order, currency)
    })
  } catch (error) {
    console.log('error', error)
  }
  return null
}

export const selectPrinterAsync = async () => {
  try {
    const { name, url } = await Print.selectPrinterAsync()
    return { name, url }
  } catch (error) {
    console.log('error', error)
  }
  return null
}

// import * as Print from 'expo-print'
// import { formatReceipt } from './formatReceipt'

// const mmToPoints = mm => (mm / 25.4) * 72

// export const printAsync = async (order, printerUrl, paperWidthMM = 80) => {
//   try {
//     const width = mmToPoints(paperWidthMM)
//     return await Print.printAsync({
//       width, // 80mm=302px,
//       orientation: Print.Orientation.portrait,
//       html: formatReceipt(order),
//       printerUrl
//     })
//   } catch (error) {
//     console.log('error', error)
//   }
//   return null
// }
// export const printToFileAsync = async (order, paperWidthMM = 80) => {
//   try {
//     const width = mmToPoints(paperWidthMM)
//     return await Print.printToFileAsync({
//       width, // 80mm=302px,
//       html: formatReceipt(order)
//     })
//   } catch (error) {
//     console.log('error', error)
//   }
//   return null
// }
// export const selectPrinterAsync = async () => {
//   try {
//     const { name, url } = await Print.selectPrinterAsync()
//     return { name, url }
//   } catch (error) {
//     console.log('error', error)
//   }
//   return null
// }
