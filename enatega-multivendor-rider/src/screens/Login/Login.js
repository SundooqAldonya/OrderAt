import React from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import colors from '../../utilities/colors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
const RiderLogin = require('../../assets/svg/RiderLogin.png')
import { FontAwesome } from '@expo/vector-icons'
import Spinner from '../../components/Spinner/Spinner'
import useLogin from './useLogin'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    usernameError,
    passwordError,
    onSubmit,
    showPassword,
    setShowPassword,
    loading,
    height
  } = useLogin()

  const { t } = useTranslation()

  // if (username == null || password == null) {
  //    setPassword('')
  //    setUsername('')
  // }

  return (
    <SafeAreaView style={[styles.flex, styles.bgColor]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{ height: height * 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            style={styles.container}>
            <Image
              source={RiderLogin}
              style={[styles.image]}
              height={150}
              width={250}
            />
            <View style={styles.innerContainer}>
              <TextDefault bolder H2 center style={styles.signInText}>
                {t('signInText')}
              </TextDefault>
              <TextInput
                style={[styles.textInput, usernameError && styles.errorInput]}
                placeholder={t('username')}
                value={username}
                onChangeText={e => setUsername(e)}
              />
              {usernameError ? (
                <TextDefault
                  style={styles.error}
                  bold
                  textColor={colors.textErrorColor}>
                  {usernameError}
                </TextDefault>
              ) : null}
              <View style={styles.passwordField}>
                <TextInput
                  secureTextEntry={showPassword}
                  placeholder={t('password')}
                  style={[
                    styles.textInput,
                    styles.passwordInput,
                    passwordError && styles.errorInput
                  ]}
                  value={password}
                  onChangeText={e => setPassword(e)}
                />
                <FontAwesome
                  onPress={() => setShowPassword(!showPassword)}
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={24}
                  style={styles.eyeBtn}
                />
                {console.log(username)}
              </View>
              {passwordError ? (
                <View>
                  <TextDefault
                    style={styles.error}
                    bold
                    textColor={colors.textErrorColor}>
                    {passwordError}
                  </TextDefault>
                </View>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.btn, loading ? styles.pt5 : styles.pt15]}
                onPress={() => onSubmit()}>
                <TextDefault H4 bold textColor={colors.white}>
                  {loading ? <Spinner size="small" /> : t('signInBtn')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
