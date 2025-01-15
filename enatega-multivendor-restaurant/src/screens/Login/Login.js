import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity
} from 'react-native'
import { TextDefault, Spinner } from '../../components'
import { useLogin } from '../../ui/hooks'
import { colors } from '../../utilities'
import styles from './styles'
import { Image, Button, Input, Icon } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import { FontAwesome } from '@expo/vector-icons'

const { height } = Dimensions.get('window')
export default function Login() {
  const {
    onLogin,
    isValid,
    loading,
    errors,
    setPassword,
    setUserName,
    username,
    password
  } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation()
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 99999999999999999
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          height: Platform.OS === 'ios' ? height * 1.0 : height * 1.05
        }}>
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={styles.topContainer}>
            <View>
              <Image
                source={require('../../assets/Header.png')}
                PlaceholderContent={<ActivityIndicator />}
                style={{ width: 150, height: 140 }}
              />
            </View>
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.headingText}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                {t('signInWithEmail')}
              </Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <TextInput
                style={[styles.textInput]}
                placeholder={t('username')}
                value={username}
                onChangeText={e => setUserName(e)}
              />
              <View style={styles.passwordField}>
                <TextInput
                  secureTextEntry={showPassword}
                  placeholder={t('password')}
                  style={[styles.textInput, styles.passwordInput]}
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
            </View>
            <View
              style={{
                justifyContent: 'flex-start',
                flex: 0.2
              }}>
              <Button
                title={t('signIn')}
                disabled={loading}
                onPress={onLogin}
                buttonStyle={{
                  backgroundColor: '#000',
                  borderColor: 'transparent',
                  borderWidth: 0,
                  borderRadius: 5,
                  height: 50,
                  marginHorizontal: 10
                }}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,

                  elevation: 3
                }}
                titleStyle={{ color: 'white' }}>
                {loading ? (
                  <Spinner spinnerColor={colors.buttonText} />
                ) : (
                  <TextDefault textColor={colors.white} H3 bold>
                    {t('login')}
                  </TextDefault>
                )}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
