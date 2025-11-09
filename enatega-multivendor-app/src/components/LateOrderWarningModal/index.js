import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const LateOrderWarningModal = ({ visible, onProceed, onCancel, message }) => {
  const { t } = useTranslation()
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('warning')}</Text>

          <Text style={styles.message}>
            {message ||
              'تم إنشاء الطلب خارج مواعيد العمل، قد لا نتمكن من ضمان التوصيل. هل تريد المتابعة؟'}
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.proceedBtn]}
              onPress={onProceed}
            >
              <Text style={styles.proceedText}>متابعة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default LateOrderWarningModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D9534F', // red
    marginBottom: 12
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    color: '#000',
    marginBottom: 24,
    width: '90%'
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: '#eee',
    marginRight: 8
  },
  proceedBtn: {
    backgroundColor: '#28a745',
    marginLeft: 8
  },
  cancelText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600'
  },
  proceedText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600'
  }
})
