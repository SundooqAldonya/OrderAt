// TODO: make it either an object or named variables, i think object is better option
// e.g object: {PENDING:'PENDING',PAID:'PAID'}
// e.g variables: const PENDING='PENDING'
//               const PAID='PAID'
// all of them, except months
exports.payment_status = ['PENDING', 'PAID']
exports.order_status = [
  'PENDING', // 0
  'ACCEPTED', // 1
  'PICKED', // 2
  'DELIVERED', // 3
  'CANCELLED', // 4
  'COMPLETED', // 5,
  'ASSIGNED' // 6
] // TODO: i think we dont need COMPLETED anymore
exports.size = ['SMALL', 'MEDIUM', 'LARGE']
exports.payment_method = ['COD', 'PAYPAL', 'STRIPE']
exports.months = [
  'Jan',
  'Feb',
  'Mar',
  'April',
  'May',
  'Jun',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

exports.days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
exports.WITHDRAW_REQUEST_STATUS = {
  REQUESTED: 'REQUESTED',
  TRANSFERRED: 'TRANSFERRED',
  CANCELLED: 'CANCELLED'
}

exports.SHOP_TYPE = {
  GROCERY: 'grocery',
  RESTAURANT: 'restaurant'
}
exports.ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PICKED: 'PICKED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  ASSIGNED: 'ASSIGNED'
}

exports.BANNER_ACTIONS = {
  NAVIGATE: 'navigate',
  OPEN_MODAL: 'openModal'
}

exports.getThirtyDaysAgo = () => {
  return new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
}
