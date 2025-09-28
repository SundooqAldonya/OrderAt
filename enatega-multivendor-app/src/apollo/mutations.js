import gql from 'graphql-tag'

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

export const placeOrder = `
  mutation PlaceOrder($restaurant:String!,$orderInput:[OrderInput!]!,$paymentMethod:String!,$couponCode:String,$tipping:Float!, $taxationAmount: Float!,$address:AddressInput!, $orderDate: String!,$isPickedUp: Boolean!, $deliveryCharges: Float!, $instructions: String){
    placeOrder(restaurant:$restaurant,orderInput: $orderInput,paymentMethod:$paymentMethod,couponCode:$couponCode,tipping:$tipping, taxationAmount: $taxationAmount, address:$address, orderDate: $orderDate,isPickedUp: $isPickedUp, deliveryCharges:$deliveryCharges, instructions: $instructions) {
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
      orderDate
      expectedTime
      isPickedUp
      tipping
      taxationAmount
      createdAt
      completionTime
      preparationTime
      deliveryCharges
      acceptedAt
      pickedAt
      deliveredAt
      cancelledAt
      assignedAt
      instructions
    }
  }`

export const pushToken = `mutation PushToken($token:String){
    pushToken(token:$token){
      _id
      notificationToken
    }
  }`

export const forgotPassword = `mutation ForgotPassword($email:String!,$otp:String!){
    forgotPassword(email:$email,otp:$otp){
      result
    }
  }`

export const resetPassword = `mutation ResetPassword($password:String!,$email:String!){
    resetPassword(password:$password,email:$email){
      result
    }
  }`

export const deleteAddress = `mutation DeleteAddress($id:ID!){
    deleteAddress(id:$id){
      _id
      addresses{
        _id
        label
        deliveryAddress
        details
        location{coordinates}
      }
    }
  }`

export const createAddress = `mutation CreateAddress($addressInput:AddressInput!){
    createAddress(addressInput:$addressInput){
      _id
      addresses{
        _id
        label
        deliveryAddress
        details
        location{coordinates}
        selected
      }
    }
  }`

export const editAddress = `mutation EditAddress($addressInput:AddressInput!){
    editAddress(addressInput:$addressInput){
      _id
      addresses{
        _id
        label
        deliveryAddress
        details
        location{coordinates}
        selected
      }
    }
  }`

export const changePassword = `mutation ChangePassword($oldPassword:String!,$newPassword:String!){
    changePassword(oldPassword:$oldPassword,newPassword:$newPassword)
  }`

export const selectAddress = `mutation SelectAddress($id:String!){
    selectAddress(id:$id){
      _id
      addresses{
        _id
        label
        deliveryAddress
        details
        location{coordinates}
        selected
      }
    }
  }`

export const reviewOrder = gql`
  mutation ReviewOrder($order: String!, $rating: Int!, $description: String) {
    reviewOrder(
      reviewInput: { order: $order, rating: $rating, description: $description }
    ) {
      _id
      orderId
      restaurant {
        _id
        name
        image
        address
        location {
          coordinates
        }
      }
      deliveryAddress {
        location {
          coordinates
        }
        deliveryAddress
        id
      }
      items {
        _id
        title
        food
        description
        quantity
        variation {
          _id
          title
          price
          discounted
        }
        addons {
          _id
          options {
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
      user {
        _id
        name
        phone
      }
      rider {
        _id
        name
      }
      review {
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
    }
  }
`

export const addFavouriteRestaurant = `mutation AddFavourite($id:String!){
    addFavourite(id:$id){
      _id
      addresses{
        _id
        label
        deliveryAddress
        details
        location{coordinates}
        selected
      }
    }
  }`

export const emailExist = `
  mutation EmailExist($email: String!) {
    emailExist(email: $email) {
      userType
      _id
      email
    }
  }`

export const phoneExist = `
  mutation PhoneExist($phone: String!) {
    phoneExist(phone: $phone) {
      userType
      _id
      phone
      firstTimeLogin
    }
  }`

export const sendOtpToEmail = `
  mutation SendOtpToEmail($email: String!, $otp: String!) {
    sendOtpToEmail(email: $email, otp: $otp) {
      result
    }
  }
  `
export const sendOtpToPhoneNumber = `
  mutation SendOtpToPhoneNumber($phone: String!, $otp: String!) {
    sendOtpToPhoneNumber(phone: $phone, otp: $otp) {
      result
    }
  }
  `
export const Deactivate = `
  mutation deactivated($isActive: Boolean!, $email: String!) {
    Deactivate(isActive: $isActive,email: $email) {
      isActive
    }
  }
  `
export const login = `
  mutation Login($email:String,$password:String,$type:String!,$appleId:String,$name:String,$notificationToken:String){
    login(email:$email,password:$password,type:$type,appleId:$appleId,name:$name,notificationToken:$notificationToken){
     userId
     token
     tokenExpiration
     isActive
     name
     email
     phone
     isNewUser
   }
  }
  `
export const createUser = `
    mutation CreateUser($phone:String,$email:String,$password:String,$name:String,$notificationToken:String,$appleId:String){
        createUser(userInput:{
            phone:$phone,
            email:$email,
            password:$password,
            name:$name,
            notificationToken:$notificationToken,
            appleId:$appleId
        }){
            userId
            token
            tokenExpiration
            name
            email
            phone
        }
      }`

export const updateNotificationStatus = `
  mutation UpdateNotificationStatus($offerNotification:Boolean!,$orderNotification:Boolean!){
    updateNotificationStatus(offerNotification:$offerNotification,orderNotification:$orderNotification){
      _id
      notificationToken
      isOrderNotification
      isOfferNotification
    }
  }`

export const cancelOrder = `
  mutation($abortOrderId: String!, $reason: String){
    abortOrder(id: $abortOrderId, reason: $reason) {
      _id
      orderStatus
    }
  }`

export const disableUserNotifications = gql`
  mutation DisableUserPushNotification($id: String!) {
    disableUserPushNotification(id: $id) {
      message
    }
  }
`
export const googleAuthCustomerApp = gql`
  mutation GoogleAuthCustomerApp(
    $name: String!
    $email: String!
    $sub: String
  ) {
    googleAuthCustomerApp(name: $name, email: $email, sub: $sub) {
      token
      user {
        _id
        name
        email
        phone
      }
    }
  }
`
export const submitEmailOTP = gql`
  mutation SubmitEmailOTP($email: String!, $otp: String!) {
    submitEmailOTP(email: $email, otp: $otp) {
      message
    }
  }
`
export const createDeliveryRequest = gql`
  mutation CreateDeliveryRequest($input: CreateDeliveryRequestInput!) {
    createDeliveryRequest(input: $input) {
      message
    }
  }
`
export const updatePhone = gql`
  mutation UpdatePhone($phone: String!) {
    updatePhone(phone: $phone) {
      message
    }
  }
`
export const validatePhone = gql`
  mutation ValidatePhone($phone: String!) {
    validatePhone(phone: $phone) {
      message
    }
  }
`
export const validatePhoneUnauth = gql`
  mutation ValidatePhoneUnauth($phone: String!) {
    validatePhoneUnauth(phone: $phone) {
      message
    }
  }
`
export const verifyPhoneOTP = gql`
  mutation VerifyPhoneOTP($otp: String!, $phone: String!) {
    verifyPhoneOTP(otp: $otp, phone: $phone) {
      message
    }
  }
`

export const phoneIsVerified = gql`
  mutation PhoneIsVerified {
    phoneIsVerified
  }
`
export const customerLogin = gql`
  mutation CustomerLogin(
    $phone: String!
    $password: String!
    $notificationToken: String
  ) {
    customerLogin(
      phone: $phone
      password: $password
      notificationToken: $notificationToken
    ) {
      token
      user {
        _id
        name
        phone
      }
    }
  }
`

export const resetPasswordCustomer = gql`
  mutation ResetPasswordCustomer($password: String!, $phone: String!) {
    resetPasswordCustomer(password: $password, phone: $phone) {
      result
    }
  }
`

export const getCoupon = gql`
  mutation Coupon($coupon: String!) {
    coupon(coupon: $coupon) {
      _id
      code
      rules {
        discount_value
      }
    }
  }
`
export const applyCoupon = gql`
  mutation ApplyCoupon($applyCouponInput: ApplyCouponInput) {
    applyCoupon(applyCouponInput: $applyCouponInput) {
      code
      valid
      discount
      message
      appliesTo
      discountType
      maxDiscount
      foods {
        _id
      }
    }
  }
`
export const applyCouponMandoob = gql`
  mutation ApplyCouponMandoob(
    $applyCouponMandoobInput: ApplyCouponMandoobInput
  ) {
    applyCouponMandoob(applyCouponMandoobInput: $applyCouponMandoobInput) {
      code
      valid
      discount
      message
      appliesTo
      discountType
      maxDiscount
      foods {
        _id
      }
    }
  }
`

export const updateUser = gql`
  mutation UpdateUser($updateUserInput: UpdateUser) {
    updateUser(updateUserInput: $updateUserInput) {
      _id
      name
      phone
      phoneIsVerified
      emailIsVerified
    }
  }
`
export const updateEmail = gql`
  mutation UpdateEmail($email: String) {
    updateEmail(email: $email) {
      message
    }
  }
`
export const updateUserName = gql`
  mutation UpdateUserName($id: String!, $name: String!) {
    updateUserName(id: $id, name: $name) {
      message
    }
  }
`
export const bulkAddUserAddresses = gql`
  mutation BulkAddUserAddresses(
    $userId: String!
    $addresses: [AddressInputBulk!]!
  ) {
    bulkAddUserAddresses(userId: $userId, addresses: $addresses) {
      message
    }
  }
`
export const createRiderReview = gql`
  mutation CreateRiderReview($input: RiderReviewInput!) {
    createRiderReview(input: $input) {
      message
    }
  }
`
