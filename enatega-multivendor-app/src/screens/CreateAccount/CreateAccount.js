import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, Image, TouchableOpacity, Dimensions } from 'react-native'
import styles from './styles'
import FdGoogleBtn from '../../ui/FdSocialBtn/FdGoogleBtn/FdGoogleBtn'
import FdEmailBtn from '../../ui/FdSocialBtn/FdEmailBtn/FdEmailBtn'
import Spinner from '../../components/Spinner/Spinner'
import * as AppleAuthentication from 'expo-apple-authentication'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useCreateAccount } from './useCreateAccount'
import { useTranslation } from 'react-i18next'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import { colors } from '../../utils/colors'
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin'
import useEnvVars from '../../../environment'
const { height } = Dimensions.get('window')

const CreateAccount = (props) => {
  const { t } = useTranslation()
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
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={
          themeContext.ThemeValue === 'Dark'
            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
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

  // function renderGoogleAction() {
  //   return (
  //     <FdGoogleBtn
  //       loadingIcon={loading && loginButton === 'Google'}
  //       onPressIn={() => {
  //         loginButtonSetter('Google')
  //       }}
  //       disabled={loading && loginButton === 'Google'}
  //       onPress={async () => {
  //         try {
  //           await signIn()
  //         } catch (error) {
  //           console.error('Google sign-in error:', error)
  //         }
  //       }}
  //     />
  //   )
  // }

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

  const googleLogin = async () => {
    try {
      await GoogleSignin.signOut()
      // await GoogleSignin.revokeAccess()
      await GoogleSignin.hasPlayServices()
        .then(() => console.log('Google Play Services Available'))
        .catch((error) => console.log('Google Play Services Error:', error))
      const response = await GoogleSignin.signIn()
      const currentUser = GoogleSignin.getCurrentUser()
      console.log({ currentUser })
      // const token = currentUser?.idToken || currentUser?.accessToken
      // Now, fetch the phone number
      // const phoneNumbers = await fetchPhoneNumber(token)
      // console.log({ phoneNumbers })
      if (isSuccessResponse(response)) {
        setGoogleUser({ userInfo: response.data })
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      console.log({ error })
    }
  }

  const fetchPhoneNumber = async (token) => {
    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await response.json()
      console.log('User phone numbers:', data.phoneNumbers)
      return data.phoneNumbers
    } catch (error) {
      console.error('Error fetching phone number:', error)
    }
  }

  return (
    <View style={styles().container}>
      <View style={styles().image}>
        <Image
          source={require('../../assets/images/loginHeader.png')}
          resizeMode='cover'
          style={styles().image1}
        />
      </View>
      <View style={[styles(currentTheme).subContainer]}>
        <View style={[styles().signupContainer]}>
          <View
            style={{
              width: '90%',
              alignSelf: 'center',
              marginBottom: scale(10)
            }}
          >
            <TextDefault
              H4
              bolder
              textColor={currentTheme.newFontcolor}
              style={{
                marginBottom: scale(7),
                color: currentTheme?.secondaryText,
                fontSize: 20
              }}
            >
              {t('signUporSignIn')}
            </TextDefault>
            <TextDefault textColor={currentTheme?.secondaryText}>
              {t('signUpDiscount')}
            </TextDefault>
          </View>

          {/* <View style={{ marginBottom: scale(5) }}>{renderGoogleAction()}</View> */}
          <View style={{ marginBottom: scale(5), marginHorizontal: 'auto' }}>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={() => {
                // initiate sign in
                googleLogin()
              }}
              // disabled={isInProgress}
            />
          </View>
          {enableApple && (
            <View style={{ marginBottom: scale(5) }}>
              {renderAppleAction()}
            </View>
          )}
          <View style={{ marginBottom: scale(5) }}>{renderEmailAction()}</View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles(currentTheme).line} />
            <View style={{ marginBottom: scale(5) }}>
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
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles(currentTheme).guestButton,
              { backgroundColor: colors?.primary, borderColor: colors?.primary }
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
