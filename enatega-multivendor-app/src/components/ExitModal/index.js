import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, BackHandler } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors } from '../../utils/colors'

const ExitModal = ({ visible, onCancel, onConfirm }) => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  return (
    <Modal transparent visible={visible} animationType='fade'>
      <View style={styles.modalBackdrop}>
        <View style={styles.alertContainer}>
          <Text
            style={{
              ...styles.titleStyle,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('confirm_exit')}
          </Text>
          <Text
            style={{
              ...styles.messageStyle,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('quit_question')}
          </Text>

          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              justifyContent: 'flex-end',
              gap: 10
            }}
          >
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>{t('okey')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = {
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%'
  },
  titleStyle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  messageStyle: { fontSize: 16, color: '#666', marginBottom: 20 },
  cancelBtn: {
    // backgroundColor: 'red',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5
  },
  okBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5
  },
  cancelText: { color: '#000' },
  confirmText: { color: '#fff', fontWeight: 'bold' }
}

export default ExitModal
