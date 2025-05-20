import React, { useLayoutEffect } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Text
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons'
import CountryPicker from 'react-native-country-picker-modal'
import useRegister from './useRegister'
import { useTranslation } from 'react-i18next'
import { colors } from '../../utils/colors'
import { useSelector } from 'react-redux'
import { gql, useMutation } from '@apollo/client'
import { createUser, validatePhoneUnauth } from '../../apollo/mutations'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import AuthContext from '../../context/Auth'

const CREATEUSER = gql`
  ${createUser}
`

function Register(props) {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const phone = useSelector((state) => state.phone.phone)

  const {
    email,
    setEmail,
    emailError,
    firstname,
    setFirstname,
    firstnameError,
    lastname,
    setLastname,
    lastnameError,
    password,
    setPassword,
    passwordError,
    // phone,
    // setPhone,
    phoneError,
    showPassword,
    setShowPassword,
    country,
    countryCode,
    registerAction,
    onCountrySelect,
    currentTheme
  } = useRegister()
  const { setTokenAsync } = useContext(AuthContext)

  const [mutateValidatePhone, { loading: loadingValidate }] = useMutation(
    validatePhoneUnauth,
    {
      onCompleted: (res) => {
        console.log({ res })

        navigation.navigate('PhoneOtp')
      },
      onError: (err) => {
        console.log({ err })
      }
    }
  )

  const [mutateCreateUser, { loading }] = useMutation(CREATEUSER, {
    onCompleted: async (res) => {
      console.log({ res })
      await setTokenAsync(res.createUser.token)
      mutateValidatePhone({
        variables: {
          phone
        }
      })
    },
    onError: (err) => {
      console.log({ err })
    }
  })

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        fontColor: currentTheme.newFontcolor,
        backColor: currentTheme.themeBackground,
        iconColor: currentTheme.newIconColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters just in case
    const digits = phone.replace(/\D/g, '')

    // Check if it's 10 digits and starts with 0
    if (digits.startsWith('0')) {
      // Remove leading zero
      return digits.slice(1)
    }

    // Invalid case - return null or original
    return digits
  }

  const handleSubmit = async () => {
    let notificationToken = null
    if (Device.isDevice) {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === 'granted') {
        notificationToken = (
          await Notifications.getDevicePushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId
          })
        ).data
      }
    }
    mutateCreateUser({
      variables: {
        phone,
        email: '',
        password,
        name: `${firstname} ${lastname}`,
        picture: '',
        notificationToken
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
                {/* <Image
                  source={require('../../../assets/login-icon.png')}
                  style={styles().logoContainer}
                /> */}

                <SimpleLineIcons
                  name='user'
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
                  {t('letsGetStarted')}
                </TextDefault>
                <TextDefault
                  H5
                  bold
                  textColor={currentTheme.fontSecondColor}
                  style={{
                    ...alignment.PBmedium,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {t('createAccount')}
                </TextDefault>
              </View>
              <View style={styles().form}>
                {/* <View>
                  <TextInput
                    placeholder={t('email')}
                    style={[
                      styles(currentTheme).textField,
                      emailError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={email}
                    onChangeText={(e) => setEmail(e)}
                  />
                  {emailError && (
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {emailError}
                    </TextDefault>
                  )}
                </View> */}
                <View style={styles().number}>
                  <View
                    style={[
                      styles(currentTheme).textField,
                      styles().countryCode
                    ]}
                  >
                    {/* <CountryPicker
                      countryCode={countryCode}
                      onSelect={(country) => onCountrySelect(country)}
                      withAlphaFilter
                      withFilter
                    /> */}
                    <TextDefault
                      textColor={currentTheme.newFontcolor}
                      style={{ marginTop: Platform.OS === 'android' ? 7 : 10 }}
                    >
                      {country?.cca2}
                    </TextDefault>
                  </View>
                  <View
                    style={[
                      styles(currentTheme).textField,
                      styles().phoneNumber,
                      { alignItems: 'flex-start' },
                      phoneError && styles(currentTheme).errorInput
                    ]}
                  >
                    <View style={styles().phoneFieldInner}>
                      <TextDefault textColor={currentTheme.newFontcolor}>
                        +{country.callingCode[0]}{' '}
                      </TextDefault>
                      <TextInput
                        keyboardType='phone-pad'
                        placeholder={t('mobileNumber')}
                        placeholderTextColor={currentTheme.fontSecondColor}
                        value={formatPhoneNumber(phone)}
                        onChangeText={(e) => setPhone(e)}
                        style={styles(currentTheme).phoneField}
                      />
                    </View>
                  </View>
                </View>
                {phoneError && (
                  <View style={{ marginLeft: '30%' }}>
                    <TextDefault
                      style={styles(currentTheme).error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {phoneError}
                    </TextDefault>
                  </View>
                )}
                <View>
                  <TextInput
                    placeholder={t('firstNamePH')}
                    style={[
                      styles(currentTheme).textField,
                      firstnameError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={firstname}
                    onChangeText={(e) => setFirstname(e)}
                  />
                  {firstnameError && (
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {firstnameError}
                    </TextDefault>
                  )}
                </View>
                <View>
                  <TextInput
                    placeholder={t('lastNamePH')}
                    style={[
                      styles(currentTheme).textField,
                      lastnameError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={lastname}
                    onChangeText={(e) => setLastname(e)}
                  />
                  {lastnameError && (
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {lastnameError}
                    </TextDefault>
                  )}
                </View>
                <View style={styles().passwordField}>
                  <TextInput
                    secureTextEntry={showPassword}
                    placeholder={t('password')}
                    style={[
                      styles(currentTheme).textField,
                      styles().passwordInput,
                      passwordError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={password}
                    autoCapitalize='none'
                    onChangeText={(text) => setPassword(text)}
                  />
                  {/* <View>
                    <FontAwesome
                      onPress={() => setShowPassword(!showPassword)}
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={24}
                      color={currentTheme.fontFourthColor}
                      style={styles().eyeBtn}
                    />
                  </View> */}
                </View>
                {passwordError && (
                  <View>
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {passwordError}
                    </TextDefault>
                  </View>
                )}
              </View>
            </View>
            <View style={styles().btnContainer}>
              <TouchableOpacity
                disabled={loading || loadingValidate}
                onPress={handleSubmit}
                style={[
                  styles(currentTheme).btn,
                  {
                    backgroundColor:
                      loading || loadingValidate ? 'grey' : colors?.primary
                  }
                ]}
              >
                <TextDefault H4 textColor={currentTheme.black} bold>
                  {t('createAccount')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Register
