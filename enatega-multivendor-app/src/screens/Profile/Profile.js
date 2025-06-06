import React, {
  useState,
  useRef,
  useContext,
  useLayoutEffect,
  useEffect
} from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  Modal,
  Pressable
} from 'react-native'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
//import { TextField, OutlinedTextField } from 'react-native-material-textfield'
import { scale } from '../../utils/scaling'
import { updateUser, login, Deactivate } from '../../apollo/mutations'
import ChangePassword from './ChangePassword'
import { theme } from '../../utils/themeColors'
import UserContext from '../../context/User'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import styles from './styles'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import analytics from '../../utils/analytics'
import { Feather } from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { useTranslation } from 'react-i18next'
import Spinner from '../../components/Spinner/Spinner'
import { colors } from '../../utils/colors'

const UPDATEUSER = gql`
  ${updateUser}
`
const DEACTIVATE = gql`
  ${Deactivate}
`

function Profile(props) {
  const Analytics = analytics()
  const navigation = useNavigation()
  const route = useRoute()
  const { params } = route
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const refName = useRef()
  const [nameError, setNameError] = useState('')
  const [toggleEmailView, setToggleEmailView] = useState(true)
  const [toggleNameView, setToggleNameView] = useState(params?.editName)
  const [toggleView, setToggleView] = useState(true)
  const [modelVisible, setModalVisible] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const { profile, logout } = useContext(UserContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const backScreen = props.route.params ? props.route.params.backScreen : null
  const [mutate, { loading: loadingMutation }] = useMutation(UPDATEUSER, {
    onCompleted,
    onError
  })

  const onCompletedDeactivate = () => {
    setDeleteModalVisible(false)
    logout()
    navigation.reset({
      routes: [{ name: 'Main' }]
    })
    FlashMessage({ message: t('accountDeactivated'), duration: 5000 })
  }

  const onErrorDeactivate = (error) => {
    if (error.graphQLErrors) {
      FlashMessage({
        message: error.graphQLErrors[0].message
      })
    } else if (error.networkError) {
      FlashMessage({
        message: error.networkError.result.errors[0].message
      })
    } else {
      FlashMessage({
        message: "Couldn't delete account. Please try again later"
      })
    }
  }

  const [deactivated, { loading: deactivateLoading }] = useMutation(
    DEACTIVATE,
    {
      onCompleted: onCompletedDeactivate,
      onError: onErrorDeactivate
    }
  )

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_PROFILE)
    }
    Track()
  }, [])
  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: t('titleProfile'),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: colors.white,
        fontWeight: 'bold'
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: colors.primary,
        elevation: 0
      },
      passChecker: showPass,
      closeIcon: toggleView,
      closeModal: setToggleView,
      modalSetter: setModalVisible,
      passwordButton: setShowPass,
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View>
              <MaterialIcons
                name='arrow-back'
                size={25}
                color={currentTheme.newIconColor}
              />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props.navigation, showPass, toggleView])

  useEffect(() => {
    if (backScreen) {
      viewHideAndShowName()
      viewHideAndShowEmail()
    }
  }, [backScreen])

  function viewHideAndShowName() {
    setToggleNameView((prev) => !prev)
  }
  function viewHideAndShowEmail() {
    setToggleEmailView((prev) => !prev)
  }

  function onCompleted({ updateUser }) {
    if (updateUser) {
      FlashMessage({
        message: t('userInfoUpdated')
      })
      if (backScreen) {
        props.navigation.goBack()
      }
    }
  }

  const validateName = async () => {
    setNameError('')

    const name = refName.current.value()

    if (name !== profile?.name) {
      if (!name.trim()) {
        refName.current.focus()
        setNameError(t('nameError'))
        return false
      }

      try {
        await mutate({
          variables: {
            name: name
          }
        })
      } catch (error) {
        return false
      }
    }

    return true
  }

  const updateName = async () => {
    const isValid = await validateName()
    if (isValid) {
      await mutate({
        variables: {
          name: refName.current.value(),
          phone: profile?.phone
        }
      })
    }
  }

  const handleNamePress = () => {
    viewHideAndShowName()
  }
  const handleNamePressUpdate = async () => {
    await updateName()
    viewHideAndShowName()
  }

  function onError(error) {
    try {
      if (error.graphQLErrors) {
        FlashMessage({
          message: error.graphQLErrors[0].message
        })
      } else if (error.networkError) {
        FlashMessage({
          message: error.networkError.result.errors[0].message
        })
      }
    } catch (err) {}
  }

  async function deactivatewithemail() {
    try {
      // setDeleteModalVisible(false)
      // setDeleteConfirmationModalVisible(true)
      await deactivated({
        variables: { isActive: false, email: profile?.email }
      })
    } catch (error) {
      console.error('Error during deactivation mutation:', error)
    }
  }

  function changeNameTab() {
    return (
      <>
        <View
          style={{
            ...styles(currentTheme).containerInfo
          }}
        >
          <TextDefault
            textColor={currentTheme.iconColor}
            style={{
              fontSize: scale(13),
              textAlign: isArabic ? 'right' : 'left'
            }}
            bolder
          >
            {profile?.name ? profile?.name : 'N/A'}
          </TextDefault>
        </View>
      </>
    )
  }

  function changeEmailTab() {
    return (
      <>
        <View style={styles(currentTheme).containerInfo}>
          <View style={styles(currentTheme).flexRow}>
            <TextDefault
              style={{ fontSize: scale(13) }}
              textColor={currentTheme.iconColor}
              bolder
            >
              {profile?.email}
            </TextDefault>
          </View>
          {profile?.email !== '' && (
            <View
              style={[
                styles().verifiedButton,
                {
                  backgroundColor: profile?.emailIsVerified
                    ? colors.primary
                    : colors.dark
                }
              ]}
            >
              <TextDefault textColor={currentTheme.color4} bold>
                {profile?.emailIsVerified ? t('verified') : t('unverified')}
              </TextDefault>
            </View>
          )}
        </View>
      </>
    )
  }

  function changePasswordTab() {
    return (
      <>
        <View style={styles(currentTheme).containerInfo}>
          <TextDefault
            textColor={colors.dark}
            style={{ fontSize: scale(13) }}
            bolder
          >
            ***********
          </TextDefault>
        </View>
      </>
    )
  }

  function changePhoneTab() {
    return (
      <>
        <View style={styles(currentTheme).containerInfo}>
          <View style={styles(currentTheme).flexRow}>
            <TextDefault
              style={{ fontSize: scale(13) }}
              textColor={currentTheme.iconColor}
              bolder
            >
              {profile?.phone}
            </TextDefault>
          </View>
          {profile?.phone !== '' && (
            <View
              style={[
                styles().verifiedButton,
                {
                  backgroundColor: profile?.phoneIsVerified
                    ? currentTheme.main
                    : currentTheme.fontFourthColor
                }
              ]}
            >
              <TextDefault
                textColor={
                  profile?.phoneIsVerified
                    ? currentTheme.color4
                    : currentTheme.white
                }
                bold
              >
                {profile?.phoneIsVerified ? t('verified') : t('unverified')}
              </TextDefault>
            </View>
          )}
        </View>
      </>
    )
  }

  const showModal = () => {
    setModalVisible(true)
  }

  return (
    <>
      <ChangePassword
        modalVisible={modelVisible}
        hideModal={() => {
          setModalVisible(false)
        }}
      />
      <View style={{ ...styles(currentTheme).formContainer, paddingTop: 20 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles(currentTheme).flex}
        >
          <View
            style={{
              ...styles(currentTheme).mainContainer
            }}
          >
            <View>
              <View
                style={{
                  ...styles(currentTheme).formSubContainer,
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                  // justifyContent: 'space-between',
                  // backgroundColor: 'red'
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      ...styles(currentTheme).containerHeading,
                      justifyContent: isArabic ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!toggleNameView && (
                      <>
                        <View style={{ ...styles(currentTheme).headingTitle }}>
                          <TextDefault
                            H5
                            B700
                            bolder
                            left
                            textColor={currentTheme.darkBgFont}
                            style={{
                              ...styles(currentTheme).textAlignLeft,
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            {t('name')}
                          </TextDefault>
                        </View>
                      </>
                    )}
                  </View>
                  {!toggleNameView ? (
                    changeNameTab()
                  ) : (
                    <View>
                      <View style={styles(currentTheme).containerHeading}>
                        <View style={styles(currentTheme).headingTitle}>
                          <TextDefault
                            H5
                            B700
                            bolder
                            left
                            textColor={currentTheme.newFontcolor}
                            style={styles(currentTheme).textAlignLeft}
                          >
                            {t('name')}
                          </TextDefault>
                        </View>
                      </View>
                      <View style={{ marginTop: 10 }}>
                        {/* <OutlinedTextField
                          ref={refName}
                          defaultValue={profile?.name}
                          autoFocus={true}
                          maxLength={20}
                          textColor={currentTheme.newFontcolor}
                          baseColor={currentTheme.newFontcolor}
                          errorColor={currentTheme.textErrorColor}
                          tintColor={
                            !nameError ? currentTheme.newFontcolor : 'red'
                          }
                          error={nameError}
                        /> */}
                      </View>

                      <TouchableOpacity
                        disabled={loadingMutation}
                        activeOpacity={0.7}
                        style={{
                          ...styles(currentTheme).saveContainer
                        }}
                        onPress={handleNamePressUpdate}
                      >
                        <TextDefault bold>{t('update')}</TextDefault>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={styles().headingLink}>
                  <TouchableOpacity
                    activeOpacity={0.3}
                    style={{
                      ...styles().headingButton,
                      alignSelf: isArabic ? 'flex-start' : 'flex-end'
                    }}
                    onPress={handleNamePress}
                  >
                    <TextDefault textColor={colors.blue}>
                      {t('edit')}
                    </TextDefault>
                  </TouchableOpacity>
                </View>
              </View>

              {/* email */}
              {/* <View style={styles(currentTheme).formSubContainer}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={styles().containerHeading}>
                    <View
                      style={{
                        ...styles().headingTitle,
                        width: '100%',
                        backgroundColor: 'red'
                      }}
                    >
                      <TextDefault
                        H5
                        B700
                        bolder
                        left
                        textColor={currentTheme.darkBgFont}
                        style={{ textAlign: 'right' }}
                      >
                        {t('email')}
                      </TextDefault>
                    </View>
                  </View>
                  {changeEmailTab()}
                </View>
                <View style={{ flex: 1 }} />
              </View> */}

              <TextDefault
                H5
                B700
                bolder
                left
                textColor={currentTheme.darkBgFont}
                style={[
                  styles(currentTheme).textAlignLeft,
                  {
                    textAlign: !isArabic ? 'left' : 'right',
                    width: '92%',
                    marginTop: 10
                  }
                ]}
              >
                {t('email')}
              </TextDefault>
              <View
                style={{
                  borderRadius: scale(8),
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  width: '92%',
                  backgroundColor: colors.lightGray,
                  alignSelf: 'center',
                  // elevation: 1,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 0,
                  marginVertical: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <View>
                  {/* <TextDefault
                    style={{ textAlign: isArabic ? 'right' : 'left' }}
                  >
                    {t('email')}
                  </TextDefault> */}
                  <TextDefault
                    style={{
                      color: colors.dark
                    }}
                  >
                    {profile?.email ? profile?.email : 'N/A'}
                  </TextDefault>
                </View>
                {profile?.email !== '' && (
                  <View
                    style={[
                      styles().verifiedButton,
                      {
                        backgroundColor: profile?.emailIsVerified
                          ? colors.primary
                          : colors.dark
                      }
                    ]}
                  >
                    <TextDefault textColor={currentTheme.color4} bold>
                      {profile?.emailIsVerified
                        ? t('verified')
                        : t('unverified')}
                    </TextDefault>
                  </View>
                )}
              </View>

              {/* password */}
              <TextDefault
                H5
                B700
                bolder
                left
                textColor={currentTheme.darkBgFont}
                style={[
                  styles(currentTheme).textAlignLeft,
                  {
                    textAlign: !isArabic ? 'left' : 'right',
                    width: '92%',
                    marginTop: 10
                  }
                ]}
              >
                {t('password')}
              </TextDefault>
              <TouchableOpacity
                style={{
                  borderRadius: scale(8),
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  width: '92%',
                  // backgroundColor: colors.secondaryOrange,
                  backgroundColor: colors.lightGray,
                  alignSelf: 'center',
                  // elevation: 1,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 0,
                  marginVertical: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  justifyContent: 'flex-start',
                  alignItems: 'center'
                }}
                onPress={showModal}
              >
                <TextDefault
                  H5
                  B700
                  bolder
                  left
                  textColor={currentTheme.darkBgFont}
                >
                  {t('change_password')}
                </TextDefault>
              </TouchableOpacity>

              {/* phone */}
              <TextDefault
                H5
                B700
                bolder
                left
                textColor={currentTheme.darkBgFont}
                style={[
                  styles(currentTheme).textAlignLeft,
                  {
                    textAlign: !isArabic ? 'left' : 'right',
                    width: '92%',
                    marginTop: 10
                  }
                ]}
              >
                {t('mobileNumber')}
              </TextDefault>
              <View
                style={{
                  borderRadius: scale(8),
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  width: '92%',
                  // backgroundColor: 'transparent',
                  backgroundColor: colors.lightGray,
                  alignSelf: 'center',
                  // elevation: 1,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 0,
                  marginVertical: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <View>
                  <TextDefault
                    H5
                    B700
                    bolder
                    left
                    textColor={currentTheme.darkBgFont}
                    style={styles(currentTheme).textAlignLeft}
                  >
                    {profile?.phone ? profile?.phone : 'N/A'}
                  </TextDefault>
                </View>
                <View>
                  <TouchableOpacity
                    activeOpacity={0.3}
                    style={styles().headingButton}
                    onPress={() =>
                      props.navigation.navigate('PhoneNumber', {
                        prevScreen: 'Profile'
                      })
                    }
                  >
                    <TextDefault textColor={colors.blue}>
                      {t('edit')}
                    </TextDefault>
                  </TouchableOpacity>
                </View>
              </View>

              {/* <View style={styles(currentTheme).formSubContainer}>
                <View style={{ flex: 3 }}>
                  <View style={styles().containerHeading}>
                    {toggleView && (
                      <>
                        <View style={styles().headingTitle}>
                          <TextDefault
                            H5
                            B700
                            bolder
                            left
                            textColor={currentTheme.darkBgFont}
                            style={styles(currentTheme).textAlignLeft}
                          >
                            {t('mobileNumber')}
                          </TextDefault>
                        </View>
                      </>
                    )}
                  </View>
                  {toggleView ? (
                    changePhoneTab()
                  ) : (
                    <View>
                      <View style={styles().containerHeading}>
                        <View style={styles().headingTitle}>
                          <TextDefault
                            textColor={currentTheme.fontMainColor}
                            H5
                            B700
                            bolder
                            style={styles(currentTheme).textAlignLeft}
                          >
                            {t('mobileNumber')}
                          </TextDefault>
                        </View>
                      </View>

                      <View>
                        <View style={{ ...alignment.MTxSmall }}></View>

                        <View style={styles().flexRow}>
                          <View>
                            <TextDefault>{profile?.phone}</TextDefault>
                          </View>
                          <View style={styles().phoneDetailsContainer}>
                            {(profile?.phone === '' ||
                              !profile?.phoneIsVerified) && (
                              <TouchableOpacity
                                onPress={() =>
                                  props.navigation.navigate(
                                    profile?.phone === ''
                                      ? 'PhoneNumber'
                                      : 'PhoneOtp',
                                    { prevScreen: 'Profile' }
                                  )
                                }
                                disabled={
                                  profile?.phoneIsVerified &&
                                  profile?.phone !== ''
                                }
                              >
                                <TextDefault
                                  bold
                                  textColor={
                                    profile?.phoneIsVerified
                                      ? currentTheme.startColor
                                      : currentTheme.textErrorColor
                                  }
                                >
                                  {profile?.phone === ''
                                    ? t('addPhone')
                                    : profile?.phoneIsVerified
                                      ? t('verified')
                                      : t('verify')}
                                </TextDefault>
                              </TouchableOpacity>
                            )}
                            {profile?.phone !== '' && (
                              <Feather
                                style={{ marginLeft: 10, marginTop: -5 }}
                                name='check'
                                size={20}
                                color={currentTheme.black}
                                onPress={() =>
                                  props.navigation.navigate('PhoneNumber', {
                                    prevScreen: 'Profile'
                                  })
                                }
                              />
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles().headingLink}>
                  <TouchableOpacity
                    activeOpacity={0.3}
                    style={styles().headingButton}
                    onPress={() =>
                      props.navigation.navigate('PhoneNumber', {
                        prevScreen: 'Profile'
                      })
                    }
                  >
                    <TextDefault textColor={colors.blue}>
                      {t('edit')}
                    </TextDefault>
                  </TouchableOpacity>
                </View>
              </View> */}
              <View
                // style={{ alignItems: 'center', padding: 10 }}

                style={{
                  borderRadius: scale(8),
                  width: '92%',
                  backgroundColor: colors.white,
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: currentTheme.deleteAccountBtn,
                  marginVertical: scale(50),
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                  <TextDefault
                    bolder
                    H4
                    textColor={currentTheme.deleteAccountBtn}
                  >
                    {t('DeleteAccount')}
                  </TextDefault>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Modal
            onBackdropPress={() => setDeleteModalVisible(false)}
            onBackButtonPress={() => setDeleteModalVisible(false)}
            visible={deleteModalVisible}
            onRequestClose={() => {
              setDeleteModalVisible(false)
            }}
          >
            <View style={styles().centeredView}>
              <View style={styles(currentTheme).modalView}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 24,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: scale(10)
                  }}
                >
                  <TextDefault bolder H3 textColor={currentTheme.newFontcolor}>
                    {t('DeleteConfirmation')}
                  </TextDefault>
                  <Feather
                    name='x-circle'
                    size={24}
                    color={currentTheme.newFontcolor}
                    onPress={() => setDeleteModalVisible(!deleteModalVisible)}
                  />
                </View>
                <TextDefault H5 textColor={currentTheme.newFontcolor}>
                  {t('permanentDeleteMessage')}
                </TextDefault>
                <TouchableOpacity
                  style={[
                    styles(currentTheme).btn,
                    styles().btnDelete,
                    { opacity: deactivateLoading ? 0.5 : 1 }
                  ]}
                  onPress={deactivatewithemail}
                  disabled={deactivateLoading}
                >
                  {deactivateLoading ? (
                    <Spinner backColor='transparent' size='small' />
                  ) : (
                    <TextDefault bolder H4 textColor={currentTheme.white}>
                      {t('yesSure')}
                    </TextDefault>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles(currentTheme).btn, styles().btnCancel]}
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={deactivateLoading}
                >
                  <TextDefault bolder H4 textColor={currentTheme.black}>
                    {t('noDelete')}
                  </TextDefault>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </>
  )
}

export default Profile
