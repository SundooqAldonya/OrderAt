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
  Pressable,
  TextInput
} from 'react-native'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
//import { TextField, OutlinedTextField } from 'react-native-material-textfield'
import { moderateScale } from '../../utils/scaling'
import {
  updateUser,
  login,
  Deactivate,
  updateEmail
} from '../../apollo/mutations'
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
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'

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
  const [name, setName] = useState(profile?.name ? profile.name : '')
  const [email, setEmail] = useState(profile?.email ? profile.email : '')
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const backScreen = props.route.params ? props.route.params.backScreen : null
  const [mutate, { loading: loadingMutation }] = useMutation(UPDATEUSER, {
    onCompleted,
    onError
  })
  const [mutateEmail, { loading: loadingEmail }] = useMutation(updateEmail, {
    onCompleted: (res) => {
      console.log({ res })
      // setToggleEmailView(true)
      navigation.navigate('EmailOtp', {
        user: {
          editProfile: true,
          // phone: profile.phone,
          email: email.length ? email.toLowerCase().trim() : ''
          // password: password,
          // name: profile.name
        }
      })
    },
    onError: (error) => {
      console.log({ error })
    }
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
        fontWeight: 'bold',
        fontSize: moderateScale(14)
      },
      headerTitleContainerStyle: {
        paddingLeft: moderateScale(25),
        paddingRight: moderateScale(25),
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
            <View style={{ paddingLeft: moderateScale(10) }}>
              <MaterialIcons
                name='arrow-back'
                size={moderateScale(22)}
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
      setToggleNameView(false)
      setToggleEmailView(true)
      if (backScreen) {
        props.navigation.goBack()
      }
    }
  }

  const validateName = async () => {
    setNameError('')
    if (name !== profile?.name) {
      if (!name.trim()) {
        refName.current.focus()
        setNameError(t('nameError'))
        return false
      }
    }
    return true
  }

  const updateName = async () => {
    console.log({ name })
    const isValid = await validateName()
    if (isValid) {
      await mutate({
        variables: {
          updateUserInput: {
            name
            // email
          }
        }
      })
    }
  }

  const updateEmailMutation = () => {
    mutateEmail({
      variables: {
        email
      }
    })
  }

  const handleNamePress = () => {
    viewHideAndShowName()
  }
  const handleNamePressUpdate = async () => {
    await updateName()
    // viewHideAndShowName()
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
      <View
        style={{
          flexDirection: isArabic ? 'row-reverse' : 'row',
          height: moderateScale(40)
        }}
      >
        <View
          style={{
            ...styles(currentTheme).containerInfo,
            flex: 2
          }}
        >
          <TextDefault
            textColor={currentTheme.iconColor}
            style={{
              fontSize: moderateScale(13),
              textAlign: isArabic ? 'right' : 'left'
            }}
            bolder
          >
            {profile?.name ? profile?.name : 'N/A'}
          </TextDefault>
        </View>
        <View style={{ flex: 1, alignSelf: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.3}
            style={{
              ...styles().headingButton,
              alignSelf: isArabic ? 'flex-start' : 'flex-end'
            }}
            onPress={handleNamePress}
          >
            <TextDefault textColor={colors.blue}>{t('edit')}</TextDefault>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  function changeEmailTab() {
    return (
      <>
        <View style={styles(currentTheme).containerInfo}>
          <View style={styles(currentTheme).flexRow}>
            <TextDefault
              style={{ fontSize: moderateScale(13) }}
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
            style={{ fontSize: moderateScale(13) }}
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
              style={{ fontSize: moderateScale(13) }}
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

  console.log({ toggleEmailView })

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
                      <View
                        style={{
                          ...styles(currentTheme).containerHeading,
                          flexDirection: isArabic ? 'row-reverse' : 'row'
                        }}
                      >
                        <View
                          style={{
                            ...styles(currentTheme).headingTitle
                          }}
                        >
                          <TextDefault
                            H5
                            B700
                            bolder
                            left
                            textColor={currentTheme.newFontcolor}
                            style={{ textAlign: isArabic ? 'right' : 'left' }}
                          >
                            {t('name')}
                          </TextDefault>
                        </View>
                      </View>
                      <View style={{ marginTop: 10 }}>
                        <TextInput
                          name='name'
                          value={name}
                          onChangeText={(text) => setName(text)}
                          style={{
                            backgroundColor: colors.white,
                            color: '#000',
                            width: '100%',
                            height: moderateScale(40),
                            paddingHorizontal: 5,
                            borderRadius: 5,
                            fontSize: moderateScale(14)
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: isArabic ? 'row-reverse' : 'row',
                          gap: 10,
                          marginTop: 10
                        }}
                      >
                        <TouchableOpacity
                          disabled={loadingMutation}
                          style={{
                            ...styles(currentTheme).saveContainer
                          }}
                          onPress={handleNamePressUpdate}
                        >
                          <TextDefault bold>{t('update')}</TextDefault>
                        </TouchableOpacity>
                        <TouchableOpacity
                          disabled={loadingMutation}
                          style={{
                            ...styles(currentTheme).saveContainer
                          }}
                          onPress={() => setToggleNameView(!toggleNameView)}
                        >
                          <TextDefault bold>{t('cancel')}</TextDefault>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                {/* <View style={styles().headingLink}>
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
                </View> */}
                {/* >>>>>>> d2bb9e7b17990dbcc93961db35f78cc6d72df51d */}
              </View>

              {/* email */}
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
                    marginTop: 20,
                    paddingHorizontal: 20
                  }
                ]}
              >
                {t('email')}
              </TextDefault>
              <View
                style={{
                  borderRadius: moderateScale(8),
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
                {toggleEmailView ? (
                  <View
                    style={{
                      flexDirection: isArabic ? 'row-reverse' : 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      color: colors.dark,
                      alignItems: 'center'
                    }}
                  >
                    {/* <View > */}
                    <TextDefault
                      style={{
                        color: colors.dark
                      }}
                    >
                      {email ? `${email.substring(0, 18)}...` : 'N/A'}
                    </TextDefault>
                    {profile?.email.length && toggleEmailView && (
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
                        <TextDefault textColor={'#fff'} bold>
                          {profile?.emailIsVerified
                            ? t('verified')
                            : t('unverified')}
                        </TextDefault>
                      </View>
                    )}
                    {/* </View> */}
                    <TouchableOpacity onPress={() => setToggleEmailView(false)}>
                      <TextDefault style={{ color: colors.blue }}>
                        {t('edit')}
                      </TextDefault>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      width: '100%'
                    }}
                  >
                    <View>
                      <TextInput
                        autoCapitalize='none'
                        name='email'
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        style={{
                          backgroundColor: colors.white,
                          color: '#000',
                          width: '100%',
                          height: moderateScale(40),
                          paddingHorizontal: 5,
                          borderRadius: 5,
                          fontSize: moderateScale(14)
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: isArabic ? 'row-reverse' : 'row',
                        gap: 10,
                        marginTop: 10
                      }}
                    >
                      <TouchableOpacity
                        disabled={loadingMutation}
                        style={{
                          ...styles(currentTheme).saveContainer
                        }}
                        onPress={updateEmailMutation}
                      >
                        <TextDefault bold>{t('update')}</TextDefault>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={loadingMutation}
                        style={{
                          ...styles(currentTheme).saveContainer
                        }}
                        onPress={() => setToggleEmailView(true)}
                      >
                        <TextDefault bold>{t('cancel')}</TextDefault>
                      </TouchableOpacity>
                    </View>
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
                    marginTop: 20,
                    paddingHorizontal: 20
                  }
                ]}
              >
                {t('password')}
              </TextDefault>
              <TouchableOpacity
                style={{
                  borderRadius: moderateScale(8),
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  justifyContent: 'space-between',
                  width: '92%',

                  backgroundColor: colors.lightGray,
                  alignSelf: 'center',

                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 0,
                  marginVertical: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  // justifyContent: 'flex-start',
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
                {/* <TouchableOpacity onPress={() => setToggleEmailView(false)}> */}
                <TextDefault style={{ color: colors.blue }}>
                  {t('edit')}
                </TextDefault>
                {/* </TouchableOpacity> */}
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
                    marginTop: 20,
                    paddingHorizontal: 20
                  }
                ]}
              >
                {t('mobileNumber')}
              </TextDefault>
              <View
                style={{
                  borderRadius: moderateScale(8),
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
                {/* <View>
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
                </View> */}
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
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                // style={{ alignItems: 'center', padding: 10 }}

                style={{
                  borderRadius: moderateScale(8),
                  width: '92%',
                  backgroundColor: colors.white,
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: currentTheme.deleteAccountBtn,
                  marginVertical: moderateScale(50),
                  paddingHorizontal: moderateScale(10),
                  paddingVertical: moderateScale(10),
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
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

          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 270
            }}
          >
            <Text style={{ color: '#666' }}>
              App Version: {nativeApplicationVersion} ({nativeBuildVersion})
            </Text>
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
                    paddingHorizontal: moderateScale(10)
                  }}
                >
                  <TextDefault bolder H3 textColor={currentTheme.newFontcolor}>
                    {t('DeleteConfirmation')}
                  </TextDefault>
                  <Feather
                    name='x-circle'
                    size={moderateScale(24)}
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
