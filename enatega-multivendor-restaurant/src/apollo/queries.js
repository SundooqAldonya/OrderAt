import { gql } from '@apollo/client'

export const orders = `query Orders{
    restaurantOrders{
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
        details
        label
      }
      items{
        _id
        title
        description
        image
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
          description
          title
          quantityMinimum
          quantityMaximum
        }
        specialInstructions
        isActive
        createdAt
        updatedAt
      }
      user{
        _id
        name
        phone
        email
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      tipping
      taxationAmount
      status
      paymentStatus
      reason
      isActive
      createdAt
      orderDate
      deliveryCharges
      isPickedUp
      preparationTime
      deliveredAt
      pickedAt
      assignedAt
      acceptedAt
      isRinged
      rider{
        _id
        name
        username
        available
        phone
      }
      originalDeliveryCharges
      originalSubtotal
      originalPrice
    }
}`

export const configuration = `query Configuration{
  configuration{
    _id
    currency
    currencySymbol
    restaurantAppSentryUrl
  }
}`

export const restaurantInfo = `query Restaurant($id:String){
  restaurant(id:$id){
  _id
  orderId
  orderPrefix
  name
  image
  address
  location {
    coordinates
  }
  deliveryTime
  username
  isAvailable
  notificationToken
  enableNotification
  openingTimes{
    day
    times{
      startTime
      endTime
    }
  }
  owner {
    _id
    name
  }
}}
`
export const defaultRestaurantCreds = `query LastOrderCreds {
  lastOrderCreds {
    restaurantUsername
    restaurantPassword
  }
}`

export const getCityAreas = `query AreasByCity($id: String!){
  areasByCity(id: $id){
    _id
    title
    location {
      location {
        coordinates
      }
    }
  }
}`

export const areasCalculatedList = gql`
  query AreasCalculatedList($restaurantId: String!) {
    areasCalculatedList(restaurantId: $restaurantId) {
      _id
      title
      # city
      address
      # location
      distance
      cost
    }
  }
`

export const getDeliveryCalculation = gql`
  query GetDeliveryCalculation(
    $originLong: Float!
    $originLat: Float!
    $destLong: Float!
    $destLat: Float!
  ) {
    getDeliveryCalculation(
      originLong: $originLong
      originLat: $originLat
      destLong: $destLong
      destLat: $destLat
    ) {
      amount
    }
  }
`
