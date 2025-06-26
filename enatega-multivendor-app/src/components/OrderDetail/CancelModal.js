import React from 'react'
import {
  View,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Text
} from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import styles from './styles'
import { alignment } from '../../utils/alignment'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { useTranslation } from 'react-i18next'

export const CancelModal = ({
  theme,
  modalVisible,
  setModalVisible,
  cancelOrder,
  loading,
  orderStatus
}) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <Modal animationType='slide' visible={modalVisible} transparent>
      <Pressable style={styles.container(theme)} onPress={setModalVisible}>
        <View style={styles.modalContainer(theme)}>
          {orderStatus === ORDER_STATUS_ENUM.CANCELLED ? (
            <>
              <View style={{ marginBottom: 12 }}>
                <TextDefault
                  H4
                  bolder
                  textColor={theme.gray900}
                  style={{ textAlign: isArabic ? 'right' : 'left' }}
                >
                  {t('yourOrderCancelled')}
                </TextDefault>
              </View>
              <TextDefault
                H5
                textColor={theme.gray500}
                style={{ textAlign: isArabic ? 'right' : 'left' }}
              >
                {t('anyQuestions')}
              </TextDefault>
            </>
          ) : (
            <>
              <View style={{ marginBottom: 12 }}>
                <TextDefault
                  H4
                  bolder
                  textColor={theme.gray900}
                  style={{ textAlign: isArabic ? 'right' : 'left' }}
                >
                  {t('cancelOrder')}
                </TextDefault>
              </View>
              <TextDefault
                H5
                textColor={theme.gray500}
                style={{ textAlign: isArabic ? 'right' : 'left' }}
              >
                {t('cancelAnyway')}
              </TextDefault>

              <View
                style={{ marginTop: 24, alignItems: 'center', width: '100%' }}
              >
                {/* Cancel Order Button */}
                <TouchableOpacity
                  onPress={cancelOrder}
                  disabled={loading}
                  style={[
                    styles.cancelButtonContainer(theme),
                    {
                      backgroundColor: theme.red600,
                      opacity: loading ? 0.6 : 1,
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      width: '100%',
                      alignItems: 'center'
                    }
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.white} />
                  ) : (
                    <Text style={{ color: theme.white, ...alignment.Pmedium }}>
                      {t('cancelOrder')}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Dismiss Button */}
                <TouchableOpacity
                  onPress={setModalVisible}
                  style={{
                    marginTop: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    backgroundColor: theme.white,
                    width: '100%',
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{ color: theme.newIconColor, ...alignment.Pmedium }}
                  >
                    {t('waitForOrder')}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  )
}
