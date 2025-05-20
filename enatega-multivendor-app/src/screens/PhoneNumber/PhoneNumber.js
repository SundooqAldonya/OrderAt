import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  TextInput,
  Text
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Spinner from '../../components/Spinner/Spinner'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import CountryPicker from 'react-native-country-picker-modal'
import usePhoneNumber from './usePhoneNumber'
import PhoneInput from 'react-native-phone-number-input'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { scale } from '../../utils/scaling'
import { useMutation } from '@apollo/client'
import { updatePhone, validatePhone } from '../../apollo/mutations'
import { useDispatch, useSelector } from 'react-redux'
import { setPhone } from '../../store/phoneSlice'
import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import UserContext from '../../context/User'
import { useEffect } from 'react'
import { colors } from '../../utils/colors'

function PhoneNumber(props) {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const {
    // phone,
    // setPhone,
    phoneError,
    country,
    countryCode,
    registerAction,
    onCountrySelect,
    currentTheme,
    loading
  } = usePhoneNumber()

  const { profile } = useContext(UserContext)

  const phone = useSelector((state) => state.phone.phone)
  console.log({ phone })

  useEffect(() => {
    if (profile?.phone) {
      dispatch(setPhone({ phone: profile.phone }))
    }
  }, [])

  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [mutate, { loading: loadingValidate }] = useMutation(validatePhone, {
    onCompleted: (res) => {
      console.log({ res })
      navigation.navigate('PhoneOtp')
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        iconColor: currentTheme.newIconColor,
        backColor: currentTheme.themeBackground,
        fontColor: currentTheme.newFontcolor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  const handleChange = (text) => {
    dispatch(setPhone({ phone: text }))
  }

  console.log({ country })

  const handleSubmit = () => {
    mutate({
      variables: {
        phone: `+${country.callingCode[0]}${phone.replace('+20', '')}`
      }
    })
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles().flex, { backgroundColor: currentTheme.themeBackground }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles().flex}
      >
        <ScrollView
          style={styles().flex}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
        >
          <View style={styles(currentTheme).mainContainer}>
            <View style={styles().subContainer}>
              <View
                style={{
                  ...styles().logoContainer,
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                }}
              >
                <Ionicons
                  name='phone-portrait-outline'
                  size={30}
                  color={currentTheme.newIconColor}
                />
              </View>
              <View>
                <TextDefault
                  H3
                  bolder
                  textColor={currentTheme.newFontcolor}
                  style={{
                    ...alignment.MTlarge,
                    ...alignment.MBmedium,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {t('yourPhoneNumber')}
                </TextDefault>
                <TextDefault
                  H5
                  bold
                  textColor={currentTheme.fontSecondColor}
                  style={{
                    paddingBottom: scale(5),
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {t('secureAccountWithPhone')}
                </TextDefault>
              </View>
              <View style={styles().form}>
                <View
                  style={{
                    ...styles().number
                    // flexDirection: isArabic ? 'row-reverse' : 'row'
                  }}
                >
                  <View
                    style={[
                      styles(currentTheme).textField,
                      styles().countryCode
                    ]}
                  >
                    <CountryPicker
                      countryCode={countryCode}
                      onSelect={(country) => onCountrySelect(country)}
                      withAlphaFilter
                      withFilter
                    />
                    <TextDefault
                      textColor={currentTheme.newFontcolor}
                      style={{ marginTop: Platform.OS === 'android' ? 8 : 10 }}
                    >
                      {country?.cca2}
                    </TextDefault>
                  </View>
                  <View
                    style={[
                      styles(currentTheme).textField,
                      styles().phoneNumber,
                      phoneError && styles(currentTheme).errorInput
                    ]}
                  >
                    <View style={styles(currentTheme).phoneField}>
                      <TextDefault textColor={currentTheme.newFontcolor}>
                        +{country.callingCode[0]}{' '}
                      </TextDefault>
                      <TextInput
                        style={styles(currentTheme).phoneNo}
                        placeholder={t('mobileNumber')}
                        placeholderTextColor={currentTheme.color6}
                        value={phone.replace('+20', '')}
                        onChangeText={handleChange}
                        keyboardType='phone-pad'
                        inputMode='numeric'
                      />
                    </View>
                  </View>
                </View>
                {phoneError && (
                  <View style={{ marginLeft: '30%' }}>
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {phoneError}
                    </TextDefault>
                  </View>
                )}
              </View>
            </View>
            <View style={{ width: '100%', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  ...styles(currentTheme).btn,
                  backgroundColor: loadingValidate ? 'grey' : colors.primary
                }}
                disabled={loadingValidate}
              >
                <TextDefault H4 textColor={currentTheme.color4} bold>
                  {loadingValidate ? (
                    <Spinner
                      size='small'
                      backColor='transparent'
                      spinnerColor={currentTheme.white}
                    />
                  ) : (
                    t('continueBtn')
                  )}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default PhoneNumber
