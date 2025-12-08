import { useMutation, useQuery } from '@apollo/client/react'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getOrderBusinessEdits, singleOrder } from '../../apollo/queries'
import Spinner from '../../components/Spinner/Spinner'
import { useTranslation } from 'react-i18next'
import {
  approveBusinessEdits,
  rejectBusinessEdits
} from '../../apollo/mutations'
import gql from 'graphql-tag'

const ORDER = gql`
  ${singleOrder}
`

const CustomerOrderUpdatedScreen = () => {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const route = useRoute()
  const navigation = useNavigation()
  const [showChanges, setShowChanges] = useState(false)

  const { orderId, _id } = route.params

  const { data, loading, error } = useQuery(getOrderBusinessEdits, {
    variables: { id: orderId || _id },
    fetchPolicy: 'network-only'
  })

  const edits = data?.getOrderBusinessEdits || null
  const changes = edits?.changes || []
  const hasEdits = edits?.isEdited && !edits?.customerApproved

  /**
   * ✅ FINAL CHANGES PER ITEM
   * Rule:
   * - oldValue from FIRST change
   * - newValue + action from LAST change
   */
  const mergedChanges = useMemo(() => {
    const grouped = {}

    for (const change of changes) {
      if (!grouped[change.orderItemId]) {
        grouped[change.orderItemId] = []
      }
      grouped[change.orderItemId].push(change)
    }

    return Object.values(grouped).map((itemChanges) => {
      const first = itemChanges[0]
      const last = itemChanges[itemChanges.length - 1]

      return {
        item: first.item,
        action: last.action, // UPDATED | REMOVED
        oldValue: first.oldValue,
        newValue: last.newValue,
        note: last.note
      }
    })
  }, [changes])

  // ✅ FINAL TOTAL DIFFERENCE (no summing of intermediate edits)
  // const totalDiff = mergedChanges.reduce((sum, c) => {
  //   if (c.action !== 'updated') return sum
  //   return sum + ((c.newValue?.totalPrice || 0) - (c.oldValue?.totalPrice || 0))
  // }, 0)

  const [approveEdits, { loading: approving }] = useMutation(
    approveBusinessEdits,
    {
      refetchQueries: [{ query: ORDER }],
      onCompleted: (res) => {
        console.log({ res })
        // UX feedback (simple for now)
        Alert.alert(
          'تمت الموافقة',
          'تمت الموافقة على التعديلات',
          [
            {
              text: 'حسناً',
              onPress: () => {
                navigation.replace('OrderDetail', {
                  _id: orderId || _id
                })
              }
            }
          ],
          { cancelable: false }
        )
      },
      onError: (err) => {
        console.log({ err })
        alert('حدث خطأ أثناء الموافقة')
      }
    }
  )

  const [rejectEdits, { loading: rejecting }] = useMutation(
    rejectBusinessEdits,
    {
      onCompleted: (res) => {
        console.log({ res })
        // UX feedback (simple for now)
        alert('تم رفض التعديلات')
        // Navigate out (order no longer valid)
        navigation.navigate('Main')
      },
      onError: (err) => {
        console.log({ err })
        alert('حدث خطأ أثناء الرفض')
      }
    }
  )

  const handleApprove = async () => {
    try {
      await approveEdits({
        variables: {
          orderId: orderId || _id
        }
      })
    } catch (err) {
      console.log({ err })
    }
  }

  const handleReject = async () => {
    try {
      await rejectEdits({
        variables: {
          orderId: orderId || _id,
          reason: 'Customer rejected business edits'
        }
      })
    } catch (err) {
      console.log({ err })
    }
  }

  if (loading) return <Spinner />

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>
          حدث خطأ أثناء تحميل التعديلات
        </Text>
      </SafeAreaView>
    )
  }

  if (!hasEdits) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          لا توجد تعديلات على الطلب
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner */}
      <TouchableOpacity
        style={styles.banner}
        onPress={() => setShowChanges(true)}
      >
        <Text style={styles.bannerText}>
          قام المطعم بتعديل بعض أصناف الطلب. اضغط لعرض التغييرات.
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            ...styles.sectionTitle,
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          الأصناف المعدّلة
        </Text>

        {/* ✅ FINAL ITEMS */}
        {mergedChanges.map((c, index) => {
          if (c.action === 'REMOVED') {
            return (
              <View key={index} style={[styles.itemCard, styles.removedCard]}>
                <Text style={styles.itemName}>{c.item?.title}</Text>
                <Text style={styles.removedText}>تمت إزالة الصنف من الطلب</Text>
              </View>
            )
          }

          const diff =
            (c.newValue?.totalPrice || 0) - (c.oldValue?.totalPrice || 0)

          return (
            <View
              key={index}
              style={{
                ...styles.itemCard,
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }}
            >
              <View>
                <Text
                  style={{
                    ...styles.itemName,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {c.item?.title}
                </Text>
                <Text
                  style={{
                    ...styles.itemDetails,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  السعر (قبل): {c.oldValue?.unitPrice}
                </Text>
                <Text
                  style={{
                    ...styles.itemDetails,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  الكمية (قبل): {c.oldValue?.quantity}
                </Text>

                <Text
                  style={{
                    ...styles.itemDetails,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  السعر (بعد): {c.newValue?.unitPrice}
                </Text>

                <Text
                  style={{
                    ...styles.itemDetails,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  الكمية (بعد): {c.newValue?.quantity}
                </Text>
                {/* <Text
                  style={{
                    ...styles.itemDetails,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  الكمية: {c.oldValue?.quantity} → {c.newValue?.quantity}
                </Text>
                <Text
                  style={{
                    ...styles.itemDetails,
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  السعر: {c.oldValue?.unitPrice} → {c.newValue?.unitPrice}
                </Text> */}
              </View>
              {/* <Text style={styles.itemPrice}>
                {diff >= 0 ? `+${diff}` : diff} EGP
              </Text> */}
            </View>
          )
        })}

        {/* ✅ PRICE SUMMARY */}
        {/* <Text style={styles.sectionTitle}>ملخص السعر</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>فرق السعر الإجمالي</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: totalDiff >= 0 ? '#d9534f' : '#28a745' }
            ]}
          >
            {totalDiff >= 0 ? `+${totalDiff}` : totalDiff} EGP
          </Text>
        </View> */}

        <View style={styles.buttonsRow}>
          <TouchableOpacity onPress={handleReject} style={styles.rejectButton}>
            <Text style={styles.rejectText}>رفض التعديلات</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleApprove} style={styles.acceptButton}>
            <Text style={styles.acceptText}>الموافقة على التعديلات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ✅ MODAL – SAME FINAL DATA */}
      <Modal visible={showChanges} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{
                ...styles.modalTitle,
                textAlign: isArabic ? 'right' : 'left'
              }}
            >
              تفاصيل التعديلات
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {mergedChanges.map((c, index) => (
                <View key={index} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontWeight: '700',
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                  >
                    {c.item?.title}
                  </Text>

                  {c.action === 'REMOVED' ? (
                    <Text style={styles.removedText}>تمت إزالة الصنف</Text>
                  ) : (
                    <>
                      <Text
                        style={{
                          ...styles.itemDetails,
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        السعر (قبل): {c.oldValue?.unitPrice}
                      </Text>
                      <Text
                        style={{
                          ...styles.itemDetails,
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        الكمية (قبل): {c.oldValue?.quantity}
                      </Text>

                      <Text
                        style={{
                          ...styles.itemDetails,
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        السعر (بعد): {c.newValue?.unitPrice}
                      </Text>

                      <Text
                        style={{
                          ...styles.itemDetails,
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        الكمية (بعد): {c.newValue?.quantity}
                      </Text>
                    </>
                  )}

                  <Text
                    style={{
                      color: '#777',
                      textAlign: isArabic ? 'right' : 'left',
                      marginVertical: 10
                    }}
                  >
                    =========================================
                  </Text>

                  {c.note && (
                    <View>
                      <Text
                        style={{
                          color: '#777',
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        ملاحظة:{' '}
                      </Text>
                      <Text
                        style={{
                          color: '#777',
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        {c?.note}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#eee',
                      marginTop: 10
                    }}
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowChanges(false)}
            >
              <Text style={styles.closeModalText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: {
    backgroundColor: '#FFE5A7',
    padding: 12,
    margin: 12,
    borderRadius: 8
  },
  bannerText: { textAlign: 'center', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },

  itemCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  removedCard: { opacity: 0.6, borderLeftWidth: 4, borderLeftColor: '#d9534f' },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemDetails: { fontSize: 14, color: '#666', marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: '700' },
  removedText: { color: '#d9534f', marginTop: 4 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  summaryLabel: { fontSize: 15, fontWeight: '600' },
  summaryValue: { fontSize: 15, fontWeight: '700' },

  buttonsRow: { flexDirection: 'row', marginTop: 20 },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    padding: 14,
    marginRight: 8
  },
  rejectText: { textAlign: 'center', fontWeight: '700' },
  acceptButton: { flex: 1, backgroundColor: '#000', padding: 14 },
  acceptText: { color: '#fff', textAlign: 'center', fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  modalItem: { fontSize: 14, marginTop: 4 },

  closeModalButton: { backgroundColor: '#000', padding: 12, marginTop: 20 },
  closeModalText: { color: '#fff', textAlign: 'center', fontWeight: '700' }
})

export default CustomerOrderUpdatedScreen
