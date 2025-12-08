import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ApprovedEditsView = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.stateBoxApproved}>
          <Text style={styles.stateIcon}>✅</Text>

          <Text style={styles.stateTitle}>تمت الموافقة</Text>

          <Text style={styles.stateText}>
            لقد وافقت على تعديلات المطعم، وتم تحديث الطلب بالقيم الجديدة.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onBack}>
        <Text style={styles.primaryText}>العودة إلى الطلب</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center'
  },

  /* ✅ State boxes */

  stateBoxApproved: {
    backgroundColor: '#E7F6EC',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center'
  },

  stateBoxRejected: {
    backgroundColor: '#FDECEC',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center'
  },

  stateIcon: {
    fontSize: 38,
    marginBottom: 10
  },

  stateTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111',
    textAlign: 'center'
  },

  stateText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    textAlign: 'center'
  },

  /* ✅ Button */

  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },

  primaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  }
})

export default ApprovedEditsView
