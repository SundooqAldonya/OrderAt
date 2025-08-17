import React, { useLayoutEffect, useEffect, useContext } from 'react'
import {
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import Spinner from '../../components/Spinner/Spinner'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import analytics from '../../utils/analytics'
import { useForgotPassword } from './useForgotPassword'
import { useTranslation } from 'react-i18next'
import { Feather } from '@expo/vector-icons'
import { moderateScale } from '../../utils/scaling'
import { colors } from '../../utils/colors'
import { useDispatch, useSelector } from 'react-redux'
import { setPhone } from '../../store/phoneSlice'
import { useMutation } from '@apollo/client'
import { validatePhoneUnauth } from '../../apollo/mutations'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { useNavigation } from '@react-navigation/native'

function ForgotPassword(props) {
  const navigation = useNavigation()
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const phone = useSelector((state) => state.phone.phone)
  const dispatch = useDispatch()

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const [mutateValidate, { loading }] = useMutation(validatePhoneUnauth, {
    onCompleted: (res) => {
      console.log({ res })
      navigation.navigate('PhoneOtp', {
        forgotPassword: true
      })
    },
    onError: (error) => {
      console.log({ error })
    }
  })

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        backColor: currentTheme.themeBackground,
        iconColor: currentTheme.newIconColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  const handleSubmit = () => {
    mutateValidate({
      variables: {
        phone
      }
    })
  }

  return (
    <SafeAreaView style={styles(currentTheme).safeAreaViewStyles}>
      <StatusBar backgroundColor={colors.primary} barStyle={'light-content'} />
      <View style={styles(currentTheme).mainContainer}>
        <View style={styles().subContainer}>
          <View
            style={{
              ...styles().logoContainer,
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
            <Feather name='lock' size={moderateScale(30)} color={currentTheme.newIconColor} />
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
              {t('forgotPassword')}
            </TextDefault>
            <TextDefault
              H5
              bold
              textColor={currentTheme.fontSecondColor}
              style={{
                ...styles().emailHeading,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              {t('enterYourPhone')}
            </TextDefault>
          </View>
          <View>
            <TextInput
              keyboardType='number-pad'
              placeholder={t('phone_placeholder')}
              style={[styles(currentTheme).textField]}
              placeholderTextColor={currentTheme.fontSecondColor}
              value={phone}
              onChangeText={(text) => dispatch(setPhone({ phone: text }))}
            />
          </View>
        </View>
        <View style={{ width: '100%', marginBottom: 20 }}>
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles(currentTheme).btn}
              onPress={handleSubmit}
            >
              <TextDefault H4 textColor={currentTheme.black} bold>
                {loading ? (
                  <Spinner
                    backColor='transparent'
                    spinnerColor={currentTheme.white}
                    size='small'
                  />
                ) : (
                  t('continueBtn')
                )}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
export default ForgotPassword
