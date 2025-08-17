import React, { useState, useContext } from 'react'
import { View, TouchableOpacity, Alert, TextInput } from 'react-native'
import styles from './styles'
import Modal from 'react-native-modal'
import { changePassword } from '../../apollo/mutations'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'
import { theme } from '../../utils/themeColors'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { alignment } from '../../utils/alignment'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { Feather, FontAwesome } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { moderateScale, scale } from '../../utils/scaling'

const CHANGE_PASSWORD = gql`
  ${changePassword}
`

function ChangePassword(props) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [oldPasswordError, setOldPasswordError] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const [mutate, { loading }] = useMutation(CHANGE_PASSWORD, {
    onError,
    onCompleted
  })

  function onError(error) {
    console.log(error?.graphQLErrors?.[0]?.message.split(': ')[1])
    const errorMessage = error?.graphQLErrors?.[0]?.message.split(': ')[1]
    setError(true)
    setErrorMessage(t(errorMessage))
    // Toast.show({
    //   type: 'error',
    //   text1: t('error'),
    //   text2: t(errorMessage),
    //   text1Style: {
    //     textAlign: isArabic ? 'right' : 'left'
    //   },
    //   text2Style: {
    //     textAlign: isArabic ? 'right' : 'left'
    //   },

    // })
  }

  function clearFields() {
    setOldPassword('')
    setNewPassword('')
    setOldPasswordError('')
    setNewPasswordError('')
  }

  function onCompleted(data) {
    if (data.changePassword) {
      clearFields()
      FlashMessage({
        message: t('updatePassword')
      })
      props.hideModal()
    } else {
      Alert.alert('Error', t('invalidPassword'))
    }
  }

  return (
    <Modal
      onBackButtonPress={props.hideModal}
      onBackdropPress={props.hideModal}
      isVisible={props.modalVisible}
      animationType='slide'
      onModalHide={clearFields}
    >
      <View style={styles(currentTheme).modalContainer}>
        <View
          style={{
            ...styles().modalHeader,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <View activeOpacity={0.7} style={styles().modalheading}>
            <TextDefault H4 bolder textColor={currentTheme.newFontcolor} center>
              {t('changePassword')}
            </TextDefault>
          </View>
          <Feather
            name='x-circle'
            size={moderateScale(24)}
            color={currentTheme.newIconColor}
            onPress={() => props.hideModal()}
          />
        </View>

        <View style={{ ...alignment.MTsmall, gap: 8 }}>
          <TextDefault
            uppercase
            bold
            textColor={currentTheme.gray500}
            style={{ textAlign: isArabic ? 'right' : 'left' }}
          >
            {t('currentPassword')}
          </TextDefault>
          {error ? (
            <TextDefault
              uppercase
              bold
              textColor={'red'}
              style={{ textAlign: isArabic ? 'right' : 'left' }}
            >
              {errorMessage}
            </TextDefault>
          ) : null}
          <View>
            <TextInput
              autoCapitalize='none'
              style={[
                styles(currentTheme).modalInput,
                {
                  borderBottomColor: oldPasswordError
                    ? currentTheme.textErrorColor
                    : currentTheme.tagColor,
                  borderBottomWidth: 1,
                  fontSize: moderateScale(14)
                }
              ]}
              maxLength={20}
              secureTextEntry={showOldPassword}
              value={oldPassword}
              onChangeText={(text) => {
                setOldPassword(text)
                setOldPasswordError(text ? '' : t('passErr1'))
                setError(false)
              }}
              onBlur={() => {
                setOldPasswordError(!oldPassword ? t('passErr1') : '')
              }}
            />
            <FontAwesome
              onPress={() => setShowOldPassword(!showOldPassword)}
              name={showOldPassword ? 'eye-slash' : 'eye'}
              size={moderateScale(20)}
              color={currentTheme.newFontcolor}
              style={{ position: 'absolute', right: 7, top: moderateScale(8) }}
            />
          </View>
          {oldPasswordError ? (
            <TextDefault small textColor={currentTheme.textErrorColor}>
              {oldPasswordError}
            </TextDefault>
          ) : null}
        </View>

        <View style={{ ...alignment.MTmedium, gap: 8 }}>
          <TextDefault
            uppercase
            bold
            textColor={currentTheme.gray500}
            style={{ textAlign: isArabic ? 'right' : 'left' }}
          >
            {t('newPassword')}
          </TextDefault>
          <View>
            <TextInput
              style={[
                styles(currentTheme).modalInput,
                {
                  borderBottomColor: newPasswordError
                    ? currentTheme.textErrorColor
                    : currentTheme.tagColor,
                  borderBottomWidth: 1,
                  fontSize: moderateScale(14)
                }
              ]}
              maxLength={20}
              secureTextEntry={showNewPassword}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                setNewPasswordError(text ? '' : t('passErr1'))
              }}
              onBlur={() => {
                setNewPasswordError(!newPassword ? t('passErr1') : '')
              }}
            />
            <FontAwesome
              onPress={() => setShowNewPassword(!showNewPassword)}
              name={showNewPassword ? 'eye-slash' : 'eye'}
              size={moderateScale(20)}
              color={currentTheme.newFontcolor}
              style={{ position: 'absolute', right: 7, top: moderateScale(8) }}
            />
          </View>
          {newPasswordError ? (
            <TextDefault small textColor={currentTheme.textErrorColor}>
              {newPasswordError}
            </TextDefault>
          ) : null}
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={() => {
            if (newPassword === '' || oldPassword === '') {
              props.hideModal()
            }
            const newPasswordError = newPassword === '' ? t('passErr1') : ''
            const oldPasswordError = oldPassword === '' ? t('passErr1') : ''
            setNewPasswordError(newPasswordError)
            setOldPasswordError(oldPasswordError)

            if (
              oldPasswordError.length === 0 &&
              newPasswordError.length === 0
            ) {
              mutate({ variables: { oldPassword, newPassword } })
            }
          }}
          style={[styles(currentTheme).btnContainer]}
        >
          <TextDefault
            textColor={currentTheme.newFontcolor}
            style={styles().checkoutBtn}
            bold
            H4
          >
            {newPassword !== '' && oldPassword !== ''
              ? t('apply')
              : t('Cancel')}
          </TextDefault>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default ChangePassword
