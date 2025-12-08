import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation, useQuery, useSubscription } from '@apollo/client/react'
import moment from 'moment'
import { colors } from '../../utilities'
import {
  BUSINESS_EDITS_APPROVED_SUB,
  BUSINESS_EDITS_DISAPPROVED_SUB,
  BUSINESS_EDITS_UPDATED_SUB,
  getOrderBusinessEdits,
  REMOVE_ORDER_ITEM,
  singleOrder,
  SUBMIT_BUSINESS_EDITS,
  UPDATE_ORDER_ITEM
} from '../../apollo'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'
import Spinner from '../../components/Spinner/Spinner'
import PendingEditsView from '../../components/PendingEditsView'

function OrderEditScreen({ route }) {
  const { orderId } = route.params
  const navigation = useNavigation()
  const [localItems, setLocalItems] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [note, setNote] = useState('')
  const [changesPending, setChangesPending] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [customerRejected, setCustomerRejected] = useState(false)

  console.log({ orderId })

  const { data, loading, error, refetch: refetchSingleOrder } = useQuery(
    singleOrder,
    {
      variables: {
        id: orderId
      },
      nextFetchPolicy: 'no-cache'
    }
  )

  const order = data?.singleOrder || null

  const {
    data: dataOrderEdit,
    loading: loadingOrderEdit,
    error: errorOrderEdit,
    refetch
  } = useQuery(getOrderBusinessEdits, {
    variables: { id: orderId },
    fetchPolicy: 'network-only'
  })

  console.log({ dataOrderEdit })

  const edits = dataOrderEdit?.getOrderBusinessEdits
  const isPending =
    edits?.isEdited === true && edits?.customerApproved === false
  const isApproved = edits?.isEdited && edits?.customerApproved
  const isRejected = edits?.customerRejected

  useEffect(() => {
    if (
      dataOrderEdit &&
      dataOrderEdit?.getOrderBusinessEdits?.customerRejected
    ) {
      setCustomerRejected(true)
    }
  }, [dataOrderEdit])

  console.log({ customerRejected })

  const [submitBusinessEdits] = useMutation(SUBMIT_BUSINESS_EDITS, {
    refetchQueries: [
      { query: getOrderBusinessEdits, variables: { id: orderId } }
    ],
    onCompleted: res => {
      console.log({ res })
      setEditModalVisible(false)
    }
  })

  const [updateOrderItem] = useMutation(UPDATE_ORDER_ITEM, {
    refetchQueries: [
      { query: getOrderBusinessEdits, variables: { id: orderId } }
    ],
    onCompleted: res => {
      console.log({ res })
      setEditModalVisible(false)
    }
  })

  const [removeOrderItem] = useMutation(REMOVE_ORDER_ITEM, {
    refetchQueries: [
      { query: getOrderBusinessEdits, variables: { id: orderId } }
    ],
    onCompleted: res => {
      console.log({ res })
      setEditModalVisible(false)
    }
  })

  const { data: approvedData } = useSubscription(BUSINESS_EDITS_APPROVED_SUB, {
    variables: { orderId }
  })

  const { data: rejectedData } = useSubscription(
    BUSINESS_EDITS_DISAPPROVED_SUB,
    { variables: { orderId } }
  )

  useEffect(() => {
    // create a deep copy of order items to edit locally
    const itemsCopy = order?.items?.map(it => ({ ...it }))
    setLocalItems(itemsCopy)
    navigation.setOptions({ title: `#${order?.orderId || order?._id}` })
  }, [order])

  useEffect(() => {
    if (approvedData) {
      Alert.alert('✅ Customer approved the changes')
      // lock editing UI
      refetchSingleOrder()
      refetch()
    }
  }, [approvedData])

  console.log({ rejectedData })

  useEffect(() => {
    if (rejectedData) {
      Alert.alert('❌ Customer rejected the changes')
      // lock editing UI
      refetchSingleOrder()
      refetch()
    }
  }, [rejectedData])

  const openEditPrice = item => {
    setEditingItem(item)
    setNewPrice((item.unitPrice || item.food?.price || 0).toString())
    setNewQuantity((item.quantity || 1).toString())
    setNote('')
    setEditModalVisible(true)
  }

  const applyLocalEdit = () => {
    console.log({ editingItem })
    if (!editingItem) return

    const priceFloat = parseFloat(newPrice) || 0
    const qtyFloat = parseFloat(newQuantity) || 0

    updateOrderItem({
      variables: {
        orderId,
        itemId: editingItem._id,
        newUnitPrice: priceFloat,
        newQuantity: qtyFloat,
        note
      }
    })

    // const updatedItems = localItems.map(it => {
    //   if (it._id === editingItem._id) {
    //     const oldValue = { unitPrice: it.unitPrice, quantity: it.quantity }
    //     const newValue = { unitPrice: priceFloat, quantity: qtyFloat }
    //     // update local snapshot
    //     const updated = {
    //       ...it,
    //       unitPrice: priceFloat,
    //       quantity: qtyFloat,
    //       totalPrice: priceFloat * qtyFloat
    //     }

    //     // register pending change
    //     setChangesPending(prev => [
    //       ...prev,
    //       {
    //         itemId: it._id,
    //         action: 'updated',
    //         oldValue,
    //         newValue,
    //         note,
    //         timestamp: new Date().toISOString()
    //       }
    //     ])
    //     return updated
    //   }
    //   return it
    // })

    // setLocalItems(updatedItems)
    // setEditModalVisible(false)
    // setEditingItem(null)
  }

  const markRemoveItem = item => {
    // soft remove locally
    setLocalItems(prev =>
      prev.map(it => (it._id === item._id ? { ...it, _removed: true } : it))
    )
    setChangesPending(prev => [
      ...prev,
      {
        itemId: item._id,
        action: 'removed',
        oldValue: item,
        newValue: null,
        timestamp: new Date().toISOString()
      }
    ])
  }

  const undoRemove = item => {
    setLocalItems(prev =>
      prev.map(it => (it._id === item._id ? { ...it, _removed: false } : it))
    )
    setChangesPending(prev =>
      prev.filter(c => !(c.itemId === item._id && c.action === 'removed'))
    )
  }

  const calculateTotals = useMemo(() => {
    const subtotal = localItems?.reduce((sum, it) => {
      if (it._removed) return sum
      const unit = it.variation?.price - it.variation?.discounted
      const qty = it.quantity ?? 1
      return sum + unit * qty
    }, 0)
    // you may want to include delivery fees, tax, coupons recalculation
    return { subtotal }
  }, [localItems])

  const submitChanges = async () => {
    if (changesPending.length === 0) {
      Alert.alert('No changes', 'There are no edits to submit.')
      return
    }

    setSubmitting(true)
    try {
      // Option A: Submit batch changes to server in businessEdits format
      await submitBusinessEdits({
        variables: { orderId: order?._id, changes: changesPending }
      })

      // Optionally call individual mutations for realtime update (remove/update) if your backend expects them
      // Example (uncomment if you want to send per-item requests):
      // for (const ch of changesPending) {
      //   if (ch.action === 'updated') {
      //     await updateOrderItem({ variables: { orderId: order?._id, itemId: ch.itemId, newUnitPrice: ch.newValue.unitPrice, newQuantity: ch.newValue.quantity, note: ch.note } })
      //   } else if (ch.action === 'removed') {
      //     await removeOrderItem({ variables: { orderId: order?._id, itemId: ch.itemId } })
      //   }
      // }

      Alert.alert(
        'Changes submitted',
        'Customer will be notified to approve the changes'
      )
      // clear pending changes; UI will enter waiting for approval state
      setChangesPending([])
      navigation.goBack()
    } catch (err) {
      console.error('submitChanges error', err)
      Alert.alert('Error', 'Failed to submit changes. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && loadingOrderEdit) {
    return <Spinner />
  }

  const canEditByBusiness =
    (order?.orderStatus === 'PENDING' || order?.orderStatus === 'ACCEPTED') &&
    !isApproved &&
    !isRejected

  const renderItem = ({ item }) => {
    console.log({ item })
    if (item._removed) {
      return (
        <View style={styles.removedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.food?.name || item.name}</Text>
            <Text style={styles.removedText}>REMOVED by Business</Text>
          </View>
          <TouchableOpacity
            onPress={() => undoRemove(item)}
            style={styles.undoButton}>
            <Text style={{ fontWeight: '600' }}>Undo</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.itemCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.food?.name || item.name}</Text>
          <Text style={styles.itemSubtitle}>{`Quantity: ${
            item.quantity || 1
          }`}</Text>
          {item.variations?.length > 0 && (
            <Text style={styles.itemSubtitle}>
              {item.variations
                .map(v => `${v.name}: ${v.selected?.name ?? ''}`)
                .join(' • ')}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemPrice}>
            {`${(item.variation?.price - item.variation?.discounted).toFixed(
              2
            )} EGP`}
          </Text>

          {/* {canEditByBusiness ? ( */}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => openEditPrice(item)}>
              <Text style={styles.smallButtonText}>Edit price</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, { marginLeft: 8 }]}
              onPress={() => markRemoveItem(item)}>
              <Text style={[styles.smallButtonText, { color: '#c00' }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
          {/* ) : null} */}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{`Order ${
          order?.orderId || order?._id
        }`}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isApproved && (
        <View style={[styles.banner, styles.approvedBanner]}>
          <Text style={styles.bannerText}>✅ العميل وافق على التعديلات</Text>
        </View>
      )}

      {isRejected && (
        <View style={[styles.banner, styles.rejectedBanner]}>
          <Text style={styles.bannerText}>❌ العميل رفض التعديلات</Text>
        </View>
      )}

      {!isApproved && !isRejected && (
        <View style={[styles.banner, styles.pendingBanner]}>
          <Text style={styles.bannerText}>
            ⏳ في انتظار رد العميل على التعديلات
          </Text>
        </View>
      )}

      <View style={styles.orderSummaryCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.restaurantName}>
              {order?.restaurant?.name || 'N/A'}
            </Text>
            <Text style={styles.itemsCount}>{`${
              (order?.items || []).length
            } item${(order?.items || []).length > 1 ? 's' : ''}`}</Text>
          </View>
          <Text
            style={styles.totalPrice}>{`${calculateTotals?.subtotal?.toFixed(
            2
          )} EGP`}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.statusText}>
            {order?.orderStatus === 'DELIVERED'
              ? 'Delivered'
              : 'Delivery in progress'}
          </Text>
          {order?.preparationTime && (
            <Text style={styles.etaText}>{`Est. delivery ${moment(
              order?.createdAt
            )
              .add(order?.preparationTime, 'minutes')
              .format('h:mm a')}`}</Text>
          )}
        </View>
      </View>

      <FlatList
        data={localItems}
        keyExtractor={it => it._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 160 }}
      />

      {changesPending.length > 0 && (
        <View style={styles.unsavedBar}>
          <Text
            style={{
              color: '#fff',
              fontWeight: '600'
            }}>{`${changesPending.length} change(s) pending`}</Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitChanges}
            disabled={submitting}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>
              {submitting ? 'Submitting...' : 'Submit changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Item</Text>

            <Text style={{ marginTop: 8 }}>New unit price</Text>
            <TextInput
              keyboardType={
                Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'
              }
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <Text style={{ marginTop: 8 }}>New quantity</Text>
            <TextInput
              keyboardType={
                Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'
              }
              style={styles.input}
              value={newQuantity}
              onChangeText={setNewQuantity}
            />

            <Text style={{ marginTop: 8 }}>Reason (optional)</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              value={note}
              onChangeText={setNote}
              multiline
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16
              }}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setEditModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={applyLocalEdit}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  orderSummaryCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  restaurantName: { fontSize: 16, fontWeight: '700' },
  itemsCount: { color: '#777', marginTop: 2 },
  totalPrice: { fontWeight: '800', fontSize: 18 },
  statusText: { color: '#2ea44f', marginTop: 6, fontWeight: '700' },
  etaText: { color: '#777', marginTop: 4 },
  itemCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  removedCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7
  },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemSubtitle: { color: '#666', marginTop: 4 },
  itemPrice: { fontWeight: '800', fontSize: 16 },
  smallButton: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    padding: 8,
    borderRadius: 6
  },
  smallButtonText: { fontWeight: '600' },
  undoButton: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    padding: 8,
    borderRadius: 6
  },
  unsavedBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 10,
    borderRadius: 8,
    marginTop: 6
  },
  banner: {
    margin: 12,
    padding: 14,
    borderRadius: 10
  },

  pendingBanner: {
    backgroundColor: '#FFF2CC'
  },

  approvedBanner: {
    backgroundColor: '#E7F6EC'
  },

  rejectedBanner: {
    backgroundColor: '#FDECEC'
  },

  bannerText: {
    fontWeight: '700',
    textAlign: 'center',
    color: '#333'
  }
})

export default OrderEditScreen
