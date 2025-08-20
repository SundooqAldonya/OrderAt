import React, { useRef, useState } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { moderateScale } from '../../utils/scaling'

const CustomOtpInput = ({ otp, setOtp, pinCount = 6, onCodeFilled }) => {
  const inputsRef = useRef([])

  const handleChange = (text, index) => {
    if (isNaN(text)) return // Allow only numbers

    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)

    // Move focus to next input
    if (text && index < pinCount - 1) {
      inputsRef.current[index + 1]?.focus()
    }
    console.log({ every: newOtp.every((digit) => digit !== '') })
    console.log({ otp: newOtp.join('').length })

    // Call callback when OTP is filled
    if (newOtp.join('').length === 4 && newOtp.every((digit) => digit !== '')) {
      onCodeFilled(newOtp.join(''))
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <View style={styles.container}>
      {otp.map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputsRef.current[index] = ref)}
          style={styles.input}
          keyboardType='number-pad'
          maxLength={1}
          value={otp[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          autoFocus={index === 0}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
    height: moderateScale(50),
  },
  input: {
    width: moderateScale(40),
    height: moderateScale(50),
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'grey',
    textAlign: 'center',
    fontSize: moderateScale(20),
    borderRadius: 5,
    color: '#000'
  }
})

export default CustomOtpInput
