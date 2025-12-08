import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

const PendingEditsView = ({
  mergedChanges = [],
  totalDiff = 0,
  onApprove,
  onReject
}) => {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔶 Banner */}
      <View style={styles.banner}>
        <Text
          style={[
            styles.bannerText,
            { textAlign: isArabic ? 'right' : 'left' }
          ]}>
          قام المطعم بتعديل بعض الأصناف. يرجى مراجعة التغييرات.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 📝 Items */}
        <Text
          style={[
            styles.sectionTitle,
            { textAlign: isArabic ? 'right' : 'left' }
          ]}>
          التغييرات على الطلب
        </Text>

        {mergedChanges.map((change, index) => {
          const { item, action, oldValue, newValue } = change
          const priceDiff =
            (newValue?.totalPrice || 0) - (oldValue?.totalPrice || 0)

          if (action === 'removed') {
            return (
              <View key={index} style={[styles.card, styles.removedCard]}>
                <Text
                  style={[
                    styles.itemTitle,
                    { textAlign: isArabic ? 'right' : 'left' }
                  ]}>
                  {item?.title}
                </Text>
                <Text
                  style={[
                    styles.removedText,
                    { textAlign: isArabic ? 'right' : 'left' }
                  ]}>
                  تمت إزالة الصنف من الطلب
                </Text>
              </View>
            )
          }

          return (
            <View key={index} style={styles.card}>
              <Text
                style={[
                  styles.itemTitle,
                  { textAlign: isArabic ? 'right' : 'left' }
                ]}>
                {item?.title}
              </Text>

              <Text
                style={[
                  styles.itemRow,
                  { textAlign: isArabic ? 'right' : 'left' }
                ]}>
                الكمية السابقة: {oldValue?.quantity}
              </Text>

              <Text
                style={[
                  styles.itemRow,
                  { textAlign: isArabic ? 'right' : 'left' }
                ]}>
                الكمية الجديدة: {newValue?.quantity}
              </Text>

              <Text
                style={[
                  styles.itemRow,
                  { textAlign: isArabic ? 'right' : 'left' }
                ]}>
                السعر السابق: {oldValue?.unitPrice} EGP
              </Text>

              <Text
                style={[
                  styles.itemRow,
                  { textAlign: isArabic ? 'right' : 'left' }
                ]}>
                السعر الجديد: {newValue?.unitPrice} EGP
              </Text>

              <Text
                style={[
                  styles.priceDiff,
                  {
                    color: priceDiff >= 0 ? '#C0392B' : '#27AE60',
                    textAlign: isArabic ? 'right' : 'left'
                  }
                ]}>
                فرق السعر: {priceDiff >= 0 ? '+' : ''}
                {priceDiff} EGP
              </Text>
            </View>
          )
        })}

        {/* 🧮 Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>فرق السعر الإجمالي</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color: totalDiff >= 0 ? '#C0392B' : '#27AE60'
              }
            ]}>
            {totalDiff >= 0 ? '+' : ''}
            {totalDiff} EGP
          </Text>
        </View>
      </ScrollView>

      {/* ✅ Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
          <Text style={styles.rejectText}>رفض</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
          <Text style={styles.approveText}>موافقة</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },

  banner: {
    backgroundColor: '#FFE8A6',
    padding: 14,
    margin: 12,
    borderRadius: 10
  },

  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1
  },

  removedCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C'
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },

  itemRow: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2
  },

  removedText: {
    color: '#E74C3C',
    fontWeight: '600',
    marginTop: 4
  },

  priceDiff: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700'
  },

  summaryBox: {
    borderTopWidth: 1,
    borderColor: '#EEE',
    paddingTop: 14,
    marginTop: 10
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: '700'
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4
  },

  actionsRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#EEE'
  },

  rejectButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#AAA',
    borderRadius: 8,
    marginRight: 8
  },

  rejectText: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#444'
  },

  approveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#000',
    borderRadius: 8
  },

  approveText: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#FFF'
  }
})

export default PendingEditsView
