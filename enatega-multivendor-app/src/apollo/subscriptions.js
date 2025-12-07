import gql from 'graphql-tag'

export const subscriptionOrder = `subscription SubscriptionOrder($id:String!){
    subscriptionOrder(id:$id){
        _id
        orderStatus
        rider{
          _id
        }
        completionTime
        preparationTime
    }
  }`

export const subscriptionRiderLocation = `subscription SubscriptionRiderLocation($riderId:String!){
    subscriptionRiderLocation(riderId:$riderId) {
      _id
      location {coordinates}
    }
  }`

export const orderStatusChanged = `subscription OrderStatusChanged($orderId:String!){
    orderStatusChanged(orderId:$orderId){
      userId
      origin
      order{
        _id
      orderId
      restaurant{
        _id
        name
        image
        address
        location{coordinates}
      }
      deliveryAddress{
        location{coordinates}
        deliveryAddress
        id
      }
      items{
        _id
        title
        food
        description
        quantity
        variation{
          _id
          title
          price
          discounted
        }
        addons{
          _id
          options{
            _id
            title
            description
            price
          }
          title
          description
          quantityMinimum
          quantityMaximum
        }
      }
      user{
        _id
        name
        phone
      }
      rider{
        _id
        name
      }
      review{
        _id
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      tipping
      taxationAmount
      createdAt
      completionTime
      preparationTime
      orderDate
      expectedTime
      isPickedUp
      deliveryCharges
      acceptedAt
      pickedAt
      deliveredAt
      cancelledAt
      assignedAt
      instructions
      }
    }
  }`

export const subscriptionNewMessage = `subscription SubscriptionNewMessage($order:ID!){
  subscriptionNewMessage(order:$order){
    id
    message
    user {
      id
      name
    }
    createdAt
  }
}`

export const BUSINESS_EDITS_UPDATED_SUB = gql`
  subscription BusinessEditsUpdated($orderId: String!) {
    businessEditsUpdated(orderId: $orderId) {
      isEdited
      customerApproved
      customerApprovalTime
      changes {
        orderItemId
        action
        note
        timestamp
        oldValue {
          unitPrice
          quantity
          totalPrice
        }
        newValue {
          unitPrice
          quantity
          totalPrice
        }
      }
    }
  }
`
