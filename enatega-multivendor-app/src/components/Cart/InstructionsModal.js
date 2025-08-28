import React from 'react'
import {
  View,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import TextDefault from '../Text/TextDefault/TextDefault'
import { useStyles } from './styles'
import { moderateScale } from '../../utils/scaling'
import { textStyles } from '../../utils/textStyles'
import { alignment } from '../../utils/alignment'
import { useTranslation } from 'react-i18next'
import { colors } from '../../utils/colors'

export const InstructionsModal = ({
  theme,
  isVisible,
  hideModal,
  onSubmit,
  value,
  setValue
}) => {
  const styles = useStyles(theme)
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  return (
    <Modal visible={isVisible} animationType='slide' transparent={true}>
      <View style={styles.layout}>
        <Pressable style={styles.backdrop} onPress={hideModal} />
        <View style={[styles.container]}>
          <TouchableOpacity
            style={[
              {
                position: 'absolute',
                top: moderateScale(10),
                padding: moderateScale(5),
                zIndex: 1
              },
              isArabic ? { right: moderateScale(10) } : { left: moderateScale(10) }
            ]}
            onPress={hideModal}
          >
            <Ionicons
              name='close-circle-outline'
              size={moderateScale(34)}
              color={colors.red}
            />
          </TouchableOpacity>
          <View>
            <View>
              <TextDefault
                H3
                bolder
                textColor={theme.color4}
                style={{ textAlign: 'center' }}
              >
                {t('specialInstructionsoptional')}
              </TextDefault>
              <TextDefault
                H4
                bold
                textColor={colors.dark}
                style={styles.secondaryText}
              >
                {t('instructions')}
              </TextDefault>
              <TextDefault
                numberOfLines={3}
                H5
                smaller
                textColor={colors.dark}
                style={styles.ternaryText}
              >
                {t('courier_visibility_notice')}
              </TextDefault>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={value}
                onChangeText={(value) => setValue(value)}
                autoFocus
                onSubmitEditing={onSubmit}
                placeholder={t('specialInstructions')}
                allowFontScaling
                style={{ padding: moderateScale(10), ...textStyles.H4, flex: 1 }}
                maxLength={400}
                multiline={true} // This makes it a textarea
                numberOfLines={4} // Sets minimum visible lines
                textAlignVertical='top' // Aligns text to top (Android)
                textAlign={isArabic ? 'right' : 'left'} // RTL support
                blurOnSubmit={true} // Or false if you want to prevent keyboard dismissal
              />
              <TouchableOpacity
                style={alignment.MRxSmall}
                onPress={() => setValue('')}
              >
                <Ionicons
                  name='close-circle-outline'
                  size={moderateScale(22)}
                  color={colors.dark}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.topContainer]}>
            <TouchableOpacity
              disabled={value?.length === 0}
              onPress={onSubmit}
              style={[
                styles.closeButton,
                value?.length === 0 && styles.disabledButton
              ]}
            >
              {0 ? (
                <ActivityIndicator color={colors.dark} />
              ) : (
                <TextDefault bolder textColor={colors.dark}>
                  {t('send')}
                </TextDefault>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
