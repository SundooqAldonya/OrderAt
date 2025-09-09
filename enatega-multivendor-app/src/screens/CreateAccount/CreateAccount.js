import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { View, Image, TouchableOpacity, Dimensions } from 'react-native'
import styles from './styles'
import FdGoogleBtn from '../../ui/FdSocialBtn/FdGoogleBtn/FdGoogleBtn'
import FdEmailBtn from '../../ui/FdSocialBtn/FdEmailBtn/FdEmailBtn'
import Spinner from '../../components/Spinner/Spinner'
import * as AppleAuthentication from 'expo-apple-authentication'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useCreateAccount } from './useCreateAccount'
import { useTranslation } from 'react-i18next'
import { moderateScale, scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import { colors } from '../../utils/colors'
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin'
import useEnvVars from '../../../environment'
import { useMutation } from '@apollo/client'
import { googleAuthCustomerApp } from '../../apollo/mutations'
import AuthContext from '../../context/Auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FdGoogleBtn2 from '../../ui/FdSocialBtn/FdGoogleBtn/FdGoogleBtn2'
import FdPhonBtn from '../../ui/FdSocialBtn/FdEmailBtn/FdPhonBtn'

const { height } = Dimensions.get('window')

const CreateAccount = (props) => {
  const { t } = useTranslation()
  const { setTokenAsync } = useContext(AuthContext)

  const [googleUser, setGoogleUser] = useState(null)
  const {
    enableApple,
    loginButton,
    loginButtonSetter,
    loading,
    themeContext,
    currentTheme,
    mutateLogin,
    navigateToLogin,
    navigation,
    signIn
    // user
  } = useCreateAccount()

  const { ANDROID_CLIENT_ID_GOOGLE } = useEnvVars()

  const navigateToPhone = () => {
    navigation.navigate('PhoneNumber', { backScreen: 'Main' })
  }

  const navigateToMain = () => {
    navigation.navigate({
      name: 'Main',
      merge: true
    })
  }

  const [mutateGoogleLogin] = useMutation(googleAuthCustomerApp, {
    onCompleted: (data) => {
      console.log({ token: data.googleAuthCustomerApp.token })
      // addToken({ token: data.googleAuthCustomerApp.token })
      setTokenAsync(data.googleAuthCustomerApp.token)
      navigateToMain()
    },
    onError: (err) => {
      console.log({ apiError: err })
    }
  })

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ANDROID_CLIENT_ID_GOOGLE, // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
      scopes: ['https://www.googleapis.com/auth/user.phonenumbers.read'], // what API you want to access on behalf of the user, default is email and profile
      offlineAccess: true // Required for getting the refresh token
      // hostedDomain: '', // specifies a hosted domain restriction
      // forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
      // accountName: '', // [Android] specifies an account name on the device that should be used
      // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
      // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
      // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
      // profileImageSize: 120 // [iOS] The desired height (and width) of the profile image. Defaults to 120px
    })
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: null,
      headerLeft: null,
      title: t(''),
      headerTransparent: true,
      headerTitleAlign: 'center'
    })
  }, [navigation])

  // console.log('create user')

  function renderAppleAction() {
    if (loading && loginButton === 'Apple') {
      return (
        <View style={styles(currentTheme).buttonBackground}>
          <Spinner backColor='transparent' spinnerColor={currentTheme.main} />
        </View>
      )
    }

    return (
      <AppleAuthentication.AppleAuthenticationButton
        // buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        // buttonStyle={
        //   themeContext.ThemeValue === 'Dark'
        //     ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
        //     : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        // }
        cornerRadius={scale(20)}
        style={styles().appleBtn}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL
              ]
            })
            const name = credential.fullName?.givenName
              ? credential.fullName?.givenName +
                ' ' +
                credential.fullName?.familyName
              : ''
            const user = {
              appleId: credential.user,
              phone: '',
              email: credential.email,
              password: '',
              name: name,
              picture: '',
              type: 'apple'
            }
            mutateLogin(user)
            loginButtonSetter('Apple')
            // signed in
          } catch (e) {
            if (e.code === 'ERR_CANCELLED') {
              // handle that the user canceled the sign-in flow
              loginButtonSetter(null)
            } else {
              // handle other errors
              loginButtonSetter(null)
            }
          }
        }}
      />
    )
  }

  function renderEmailAction() {
    return (
      <FdEmailBtn
        loadingIcon={loading && loginButton === 'Email'}
        onPress={() => {
          loginButtonSetter('Email')
          // eslint-disable-next-line no-unused-expressions
          navigateToLogin()
        }}
      />
    )
  }

  function rendergoogleLogin() {
    return (
      <FdGoogleBtn2
        loadingIcon={loading}
        onPress={() => {
          googleLogin()
        }}
      />
    )
  }

  function renderPhoneNumber() {
    return (
      <FdPhonBtn
        loadingIcon={loading}
        onPress={() => {}}
        title={t('ContinuePhoneNumber')}
        disabled={true}
      />
    )
  }

  const googleLogin = async () => {
    try {
      await GoogleSignin.signOut()
      await GoogleSignin.hasPlayServices()
        .then(() => console.log('Google Play Services Available'))
        .catch((error) => console.log('Google Play Services Error:', error))
      const response = await GoogleSignin.signIn()
      const currentUser = GoogleSignin.getCurrentUser()

      mutateGoogleLogin({
        variables: {
          name: currentUser.user.name,
          email: currentUser.user.email,
          sub: currentUser.user.id
        }
      })
      if (isSuccessResponse(response)) {
        setGoogleUser({ userInfo: response.data })
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      console.log({ error })
    }
  }

  return (
    <View style={styles().container}>
      <View style={styles().image}>
        <Image
          // source={require('../../assets/images/loginHeader.png')}
          source={require('../../assets/logo.jpg')}
          resizeMode='contain'
          style={styles().image1}
        />
      </View>
      <View style={[styles(currentTheme).subContainer]}>
        <View style={[styles().signupContainer]}>
          <View style={{ marginBottom: moderateScale(2) }}>
            {renderEmailAction()}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles(currentTheme).line} />
            <View style={{ marginBottom: moderateScale(2) }}>
              <TextDefault
                H4
                bolder
                textColor={colors?.border2}
                style={{ width: 50, textAlign: 'center' }}
              >
                {t('or')}
              </TextDefault>
            </View>
            <View style={styles(currentTheme).line} />
          </View>
          {/* guestButton */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles(currentTheme).guestButton
              // { backgroundColor: colors?.primary, borderColor: colors?.primary }
            ]}
            onPress={() => {
              navigation.navigate('Main')
            }}
          >
            {props.loadingIcon ? (
              <Spinner
                backColor='rgba(0,0,0,0.1)'
                spinnerColor={currentTheme.main}
              />
            ) : (
              <>
                <TextDefault
                  H4
                  textColor={colors?.dark}
                  style={alignment.MLsmall}
                  bold
                >
                  {t('continueAsGuest')}
                </TextDefault>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
export default CreateAccount
