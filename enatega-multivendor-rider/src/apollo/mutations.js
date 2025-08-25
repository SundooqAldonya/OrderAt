import { gql } from '@apollo/client'

export const riderLogin = `mutation RiderLogin($username:String,$password:String,$notificationToken:String){
  riderLogin(username:$username,password:$password,notificationToken:$notificationToken){
    userId
    token
  }
}`

export const updateOrderStatusRider = `mutation UpdateOrderStatusRider($id:String!,$status:String!, $file: Upload){
  updateOrderStatusRider(id:$id,status:$status, file: $file){
    _id
    orderStatus
  }
}
`

export const assignOrder = `mutation AssignOrder($id:String!){
  assignOrder(id:$id){
    _id
    orderStatus
    rider{
      _id
      name
      username
    }
  }
}`

export const updateLocation = `mutation UpdateRiderLocation($latitude:String!,$longitude:String!, $tracking: String){
updateRiderLocation(latitude:$latitude,longitude:$longitude, tracking: $tracking){
  _id
}
}`

export const toggleAvailablity = `
  mutation ToggleRider($id:String){
    toggleAvailablity(id:$id){
      _id
    }
}`
export const toggleMute = `
  mutation ToggleRider($id:String){
    toggleMute(id:$id){
      _id
    }
}`

export const createWithdrawRequest = `
  mutation CreateWithdrawRequest($amount: Float!) {
  createWithdrawRequest(amount: $amount) {
    _id
    requestId
    requestAmount
    requestTime
    status
    rider {
      name
      email
      accountNumber
    }
  }
}
`

export const createEarning = `
  mutation CreateEarning($earningsInput: EarningsInput) {
  createEarning(earningsInput: $earningsInput) {
    rider {
      _id
      username
    }
    orderId
    deliveryFee
    orderStatus
    paymentMethod
    deliveryTime
    _id
  }
}
`
export const sendChatMessage = `mutation SendChatMessage($orderId: ID!, $messageInput: ChatMessageInput!) {
  sendChatMessage(message: $messageInput, orderId: $orderId) {
    success
    message
    data {
      id
      message
      user {
        id
        name
      }
      createdAt
    }
  }
}
`
export const riderLogout = gql`
  mutation RiderLogout($token: String!) {
    riderLogout(token: $token) {
      message
    }
  }
`
export const refreshFirebaseToken = gql`
  mutation RefreshFirebaseToken($notificationToken: String!) {
    refreshFirebaseToken(notificationToken: $notificationToken) {
      message
    }
  }
`
export const orderSeenByRider = gql`
  mutation OrderSeenByRider($id: String!, $riderId: String!) {
    orderSeenByRider(id: $id, riderId: $riderId) {
      message
    }
  }
`
export const orderOpenedByRider = gql`
  mutation OrderOpenedByRider($id: String!, $riderId: String!) {
    orderOpenedByRider(id: $id, riderId: $riderId) {
      message
    }
  }
`
export const acknowledgeNotification = gql`
  mutation AcknowledgeNotification($notificationId: String) {
    acknowledgeNotification(notificationId: $notificationId) {
      message
    }
  }
`

export const updateRiderStatus = gql`
  mutation UpdateRiderStatus($available: Boolean!) {
    updateRiderStatus(available: $available) {
      message
    }
  }
`
