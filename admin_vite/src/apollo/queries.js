import { gql } from '@apollo/client'

export const getOrders = `query Orders($page:Int){
    allOrders(page:$page){
      _id
      deliveryAddress
      deliveryCharges
      orderAmount
      paidAmount
      paymentMethod
      orderId
      user{
        _id
        name
        email
        phone
      }
      items{
        _id
        food{
          _id
          title
          description
          image
        }
        variation{
          _id
          title
          price
          discounted
        }
        addons{
          _id
          title
          description
          quantityMinimum
          quantityMaximum
          options{
            _id
            title
            price
          }
        }
        specialInstructions
        quantity
      }
      reason
      status
      paymentStatus
      orderStatus
      createdAt
      review{
        _id
        rating
        description
      }
      rider{
        _id
        name
      }
    }
  }`

export const reviews = `query Reviews($restaurant:String!){
    reviews(restaurant:$restaurant){
      _id
      order{
        _id
        orderId
        items{
          title
        }
        user{
          _id
          name
          email
        }
      }
      restaurant{
        _id
        name
        image
      }
      rating
      description
      createdAt
    }
  }
`

export const getOrdersByDateRange = `query GetOrdersByDateRange($startingDate: String!, $endingDate: String!, $restaurant: String!) {
    getOrdersByDateRange(startingDate: $startingDate, endingDate: $endingDate, restaurant: $restaurant) {
      totalAmountCashOnDelivery
      countCashOnDeliveryOrders
    }
    
  }
`

export const getOrdersByRestaurant = `query ordersByRestId($restaurant:String!,$page:Int,$rows:Int,$search:String){
    ordersByRestId(restaurant:$restaurant,page:$page,rows:$rows,search:$search){
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
      status
      paymentStatus
      reason
      isActive
      createdAt
      deliveryCharges
      tipping
      taxationAmount
      rider{
        _id
        name
        username
        phone
        available
      }
    }
  }`

export const getOrdersByAdmin = `query GetOrdersByAdmin($page:Int, $limit:Int, $search:String){
    getOrdersByAdmin(page:$page, limit:$limit, search:$search){
      docs {
        _id
        orderId
        restaurant{
          _id
          name
          image
          address
          location {
            coordinates
          }
          city {
            _id
            title
          }
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
        status
        paymentStatus
        reason
        isActive
        createdAt
        deliveryCharges
        tipping
        taxationAmount
        rider{
          _id
          name
          username
          phone
          available
        }
        cancelledAt
        area
      }
      totalDocs
      limit
      totalPages
      page
      hasPrevPage
      hasNextPage
      prevPage
      nextPage
    }
  }`

export const getDashboardTotal = `query GetDashboardTotal($startingDate: String, $endingDate: String,$restaurant:String!){
    getDashboardTotal(starting_date: $startingDate, ending_date: $endingDate,restaurant:$restaurant){
      totalOrders
      totalSales
    }
  }`
export const getDashboardSales = `query GetDashboardSales($startingDate: String, $endingDate: String,$restaurant:String!){
    getDashboardSales(starting_date: $startingDate, ending_date: $endingDate,restaurant:$restaurant){
      orders{
        day
        amount
      }
    }
  }`
export const getDashboardOrders = `query GetDashboardOrders($startingDate: String, $endingDate: String,$restaurant:String!){
    getDashboardOrders(starting_date: $startingDate, ending_date: $endingDate,restaurant:$restaurant){
      orders{
        day
        count
      }
    }
  }`

export const getDashboardData = `query GetDashboardData($startingDate: String, $endingDate: String){
    getDashboardData(starting_date: $startingDate, ending_date: $endingDate){
      totalOrders
      totalUsers
      totalSales
      orders{
        day
        count
        amount
      }
    }
  }`

export const getConfiguration = `query GetConfiguration{
    configuration{
      _id
      email
      emailName
      password
      enableEmail
      clientId
      clientSecret
      sandbox
      publishableKey
      secretKey
      currency
      currencySymbol
      deliveryRate
      minimumDeliveryFee
      twilioAccountSid
      twilioAuthToken
      twilioPhoneNumber
      twilioEnabled
      formEmail
      sendGridApiKey
      sendGridEnabled   
      sendGridEmail
      sendGridEmailName
      sendGridPassword
      dashboardSentryUrl
      webSentryUrl
      apiSentryUrl
      customerAppSentryUrl
      restaurantAppSentryUrl
      riderAppSentryUrl
      googleApiKey
      cloudinaryUploadUrl
      cloudinaryApiKey
      webAmplitudeApiKey
      appAmplitudeApiKey
      webClientID
      androidClientID
      iOSClientID
      expoClientID
      googleMapLibraries
      googleColor    
      termsAndConditions
      privacyPolicy
      testOtp
      firebaseKey
      authDomain
      projectId
      storageBucket
      msgSenderId
      appId
      measurementId
      isPaidVersion
      skipEmailVerification
      skipMobileVerification
      costType
      vapidKey
      availabilityPeriod
    }
  }`

export const orderCount = `
query OrderCount($restaurant:String!){
  orderCount(restaurant:$restaurant)
}`

export const getActiveOrders = gql`
  query GetActiveOrders($page: Float, $limit: Float, $restaurantId: ID) {
    getActiveOrders(page: $page, limit: $limit, restaurantId: $restaurantId) {
      docs {
        _id
        zone {
          _id
        }
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
          details
          label
        }
        items {
          _id
          title
          description
          image
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
        user {
          _id
          name
          phone
          email
        }
        paymentMethod
        paidAmount
        orderAmount
        orderStatus
        isPickedUp
        status
        paymentStatus
        reason
        isActive
        createdAt
        preparationTime
        deliveredAt
        pickedAt
        assignedAt
        acceptedAt
        deliveryCharges
        rider {
          _id
          name
          username
          available
        }
        riderInteractions {
          _id
          rider {
            _id
            name
            phone
          }
          seenAt
          openedAt
        }
      }
      totalDocs
      limit
      totalPages
      page
      hasPrevPage
      hasNextPage
      prevPage
      nextPage
    }
  }
`

export const getRidersByZone = `query RidersByZone($id:String!){
  ridersByZone(id:$id){
    _id
    name
    username
    password
    phone
    available
    zone{
      _id
      title
    }
  }
}`

export const getZones = `query Zones{
    zones{
    _id
    title
    description
    location{coordinates}
    isActive
  }
}`

export const getAllDeliveryZones = `query GetAllDeliveryZones{
    getAllDeliveryZones{
    _id
    title
    description
    location{coordinates}
    isActive
    city 
  }
}`

export const getVendors = `query Vendors{
    vendors{
      _id
      email
      name
      phone
      userType
      restaurants{
        _id
        
      }
    }
}`

export const getVendor = `query GetVendor($id:String!){
    getVendor(id:$id){
        _id
        email
        userType
        restaurants{
          _id
          orderId
          orderPrefix
          slug
          name
          image
          address
          location{coordinates}
          shopType
        }
    }
}`

export const getTaxation = `query Taxes{
    taxes {
      _id
      taxationCharges
      enabled
      }
    }`

export const getCoupons = `query Coupons{
    coupons {
      _id
      code
      target {
        cities {
          _id
          title
        }
        businesses {
          _id
          name
        }
        customers {
          _id
          name
        }
        categories {
          _id
          name
        }
        foods {
          _id
          title
        }
      }
      rules {
        discount_type
        discount_value
        applies_to
        min_order_value
        max_discount
        start_date
        end_date
        limit_total
        limit_per_user
      }
      status
    }
  }`

export const getCuisines = `query Cuisines{
    cuisines {
      _id
      name
      description
      image
      shopType
    }
  }`

export const getBanners = `query Banners{
    banners {
      _id
      title
      description
      action
      screen
      file
      parameters
    }
  }`
export const getBannerActions = `query BannerActions{
    bannerActions
  }`

export const getTipping = `query Tips{
    tips {
      _id
      tipVariations
      enabled
    }
  }`

export const getAddons = `query Addons($id: String!){
    addons(id: $id){
    _id
    title
    description
    options
    quantityMinimum
    quantityMaximum
  }}`

export const getOptions = `query Options($id: String!){
    options(id: $id) {
      _id
      title
      description
      price
    }
  }
  `
export const getPaymentStatuses = `query{
    getPaymentStatuses
  }`

export const restaurantByOwner = `query RestaurantByOwner($id:String){
  restaurantByOwner(id:$id){
  
    _id
    orderId
    orderPrefix
    name
    slug
    image
    address
    username
    password
    location{coordinates}
    shopType
  }
}`

export const restaurantList = `query RestaurantList{
  restaurantList{
    _id
    name
    address
  }
}`

export const restaurants = `query Restaurants{
  restaurants{
    _id
    name
    image
    orderPrefix
    slug
    address
    deliveryTime
    minimumOrder
    isActive
    commissionRate
    tax
    owner{
      _id
      email
      name
    }
    shopType
    city {
      _id
      title
    }
    createdAt
    isVisible
    lastOnlineAt
  }
}
`

export const getRestaurantProfile = `query Restaurant($id:String){
      restaurant(id:$id)
      {
      _id
      orderId
      orderPrefix
      slug
      name
      image
      logo
      address
      location{coordinates}
      deliveryBounds{
        coordinates
      }
      username
      password
      deliveryTime
      minimumOrder
      tax
      isAvailable
      stripeDetailsSubmitted
      openingTimes{
        day
        times{
          startTime
          endTime
        }
      }
      shopCategory {
        _id
        title
      }
      owner{
        _id
        email
      }
      shopType
      cuisines
      city {
        _id
        title
      }
      businessCategories{
        _id
        name
        description
        image {
          url
          publicId
        }
      }
      salesPersonName
      responsiblePersonName
      contactNumber
      isVisible
      featured
    }
}`

export const categoriesByRestaurants = `query CategoriesByRestaurant($id:String!){
  categoriesByRestaurant(id: $id){
    _id
    title    
  }  
}`

export const getFoodListByRestaurant = `query FoodListByRestaurant($id: String!) {
  foodListByRestaurant(id: $id) {
    _id
    title
    description
    image
    restaurant
    variations {
      _id
      title
      price
      discounted
      addons
      stock
    }
    category {
      _id
      title
    }
    isActive
    stock
    createdAt
    updatedAt
  }
}`

export const getRestaurantDetail = `query Restaurant($id:String){
      restaurant(id:$id){
      _id
      orderId
      orderPrefix
      slug
      name
      image
      address
      location{coordinates}
      deliveryTime
      minimumOrder
      tax
      shopType
    }
}`

export const getAddonsByRestaurant = `query GetAddonsByRestaurant($id: String!){
  getAddonsByRestaurant(id: $id){
    _id
    options
    title
    description
    quantityMinimum
    quantityMaximum
    }
}`

export const getOffers = `query Offers{
  offers{
    _id
    name
    tag
    restaurants{
      _id
      name
    }
  }
}`

export const getSections = `query Sections{
  sections{
    _id
    name
    enabled
    restaurants{
      _id
      name
    }
  }
}`

export const pageCount = `
query PageCount($restaurant:String!){
  pageCount(restaurant:$restaurant)
}
`
export const getUsers = `query{
    users{
      _id
      name
      email
      phone
      addresses{
        location{coordinates}
        deliveryAddress
      }
    }
  }`

export const getCities = `query {
    citiesAdmin {
      _id
      title    
      isActive
      location {
        _id
        location {
          coordinates
        }
     }
    }
  }`

export const getAreas = `query {
    areas {
      _id
      title
      city {
        _id
        title
      }
     location {
      _id
      location {
        coordinates
      }
     }
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

export const getRiders = `query{
    riders{
      _id
      name
      username
      password
      phone
      available
      isActive
      zone{
        _id
        title
      }
      startAvailabilityDate
      endAvailabilityDate
      location {
        coordinates
      }
      city
      profileImage {
        url
      }
      nationalIdImage {
        url
      }
    }
  }`

export const getAvailableRiders = `query{
    availableRiders{
      _id
      name
      username
      phone
      available
      zone{
        _id
      }
    }
  }`

export const withdrawRequestQuery = `query GetWithdrawRequests($offset:Int){
      getAllWithdrawRequests(offset:$offset){
          success
          message
          data{
            _id
            requestId
            requestAmount
            requestTime
            rider{
              _id
              name
              currentWalletAmount
            }
            status
          }
          pagination{
            total
          }
      }
  }`

export const getUsersBySearch = `
  query Users($search: String) {
    search_users(search: $search) {
      _id
     name
    email
    phone
    addresses {
      _id
      deliveryAddress
      label
      selected
    }
      createdAt
      updatedAt
    }
  }
`
export const getBusinesses = gql`
  query GetBusinesses {
    getBusinesses {
      _id
      name
      phone
      businessName
      address
    }
  }
`
export const getRidersRegistered = gql`
  query GetRidersRegistered {
    getRidersRegistered {
      _id
      name
      phone
      city
    }
  }
`

export const getShopCategories = gql`
  query GetShopCategories {
    getShopCategories {
      _id
      title
    }
  }
`

export const singleOrder = gql`
  query SingleOrder($id: String!) {
    singleOrder(id: $id) {
      _id
      orderId
      restaurant {
        _id
        name
        image
        slug
        address
        location {
          coordinates
        }
      }
      deliveryAddress {
        location {
          coordinates
        }
        label
        deliveryAddress
      }
      items {
        _id
        title
        food
        description
        quantity
        specialInstructions
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
        phone
      }
      review {
        _id
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      deliveryCharges
      tipping
      taxationAmount
      orderDate
      expectedTime
      isPickedUp
      createdAt
      completionTime
      cancelledAt
      assignedAt
      deliveredAt
      acceptedAt
      pickedAt
      preparationTime
      pickedImage {
        url
        publicId
      }
      riderInteractions {
        _id
        rider {
          _id
          name
          phone
        }
        seenAt
        openedAt
      }
      originalDeliveryCharges
      originalSubtotal
      originalPrice
      cancellation {
        kind
        reason
        cancelledBy {
          ... on User {
            _id
            name
            phone
          }
          ... on Owner {
            _id
            name
            phone
            userType
          }
          ... on Restaurant {
            _id
            name
            phone
            image
          }
        }
      }
    }
  }
`
export const allDeliveryPrices = gql`
  query AllDeliveryPrices {
    allDeliveryPrices {
      _id
      originZone {
        _id
        title
      }
      destinationZone {
        _id
        title
      }
      cost
    }
  }
`
export const removeDeliveryZone = gql`
  mutation RemoveDeliveryZone($id: String!) {
    removeDeliveryZone(id: $id) {
      message
    }
  }
`
export const updateDeliveryZone = gql`
  mutation UpdateDeliveryZone($deliveryZoneInput: DeliveryZoneInput) {
    updateDeliveryZone(deliveryZoneInput: $deliveryZoneInput) {
      message
    }
  }
`
export const getBusinessCategories = gql`
  query GetBusinessCategories {
    getBusinessCategories {
      _id
      name
      description
      image {
        url
      }
      order
      isActive
    }
  }
`
export const orderRidersInteractions = gql`
  query orderRidersInteractions($id: String!) {
    orderRidersInteractions(id: $id) {
      _id
      rider {
        _id
        name
        phone
      }
      seenAt
      openedAt
    }
  }
`
export const getRidersLocation = gql`
  query getRidersLocation($cityId: String) {
    getRidersLocation(cityId: $cityId) {
      _id
      name
      username
      password
      phone
      available
      isActive
      startAvailabilityDate
      endAvailabilityDate
      location {
        coordinates
      }
      updatedAt
      createdAt
      lastUpdatedLocationDate
      assignedOrdersCount
    }
  }
`

export const searchRestaurants = gql`
  query SearchRestaurants($search: String) {
    searchRestaurants(search: $search) {
      _id
      name
      location {
        coordinates
      }
    }
  }
`

export const searchCategories = gql`
  query GetBusinessCategories {
    getBusinessCategories {
      _id
      name
    }
  }
`
export const searchUsers = gql`
  query SearchUsers($search: String) {
    searchUsers(search: $search) {
      _id
      name
      phone
    }
  }
`
export const searchFood = gql`
  query SearchFood($search: String) {
    searchFood(search: $search) {
      _id
      title
    }
  }
`
export const getCouponEnums = gql`
  query GetCouponEnums {
    getCouponEnums
  }
`
export const getCouponDiscountTypeEnums = gql`
  query GetCouponDiscountTypeEnums {
    getCouponDiscountTypeEnums
  }
`
export const getCouponStatuses = gql`
  query GetCouponStatuses {
    getCouponStatuses
  }
`
export const assignedOrders = gql`
  query AssignedOrders($id: String!) {
    assignedOrders(id: $id) {
      _id
    }
  }
`
export const getStockUnits = gql`
  query getStockEnumValues {
    getStockEnumValues
  }
`
export const getAllContactus = gql`
  query GetAllContactus($page: Int, $limit: Int) {
    getAllContactus(page: $page, limit: $limit) {
      docs {
        _id
        name
        phone
        email
        message
        createdAt
      }
      totalDocs
      page
      totalPages
      hasNextPage
      hasPrevPage
      nextPage
      prevPage
    }
  }
`

export const getAllNotifications = gql`
  query GetAllNotifications($page: Int, $limit: Int) {
    getAllNotifications(page: $page, limit: $limit) {
      docs {
        _id
        title
        body
        data {
          orderId
          type
        }
        createdAt
        recipients {
          kind
          status
          lastAttempt
          item {
            ... on Rider {
              _id
              name
            }
            ... on User {
              _id
              name
            }
            ... on Restaurant {
              _id
              name
            }
          }
        }
      }
      totalDocs
      page
      totalPages
      hasNextPage
      hasPrevPage
      nextPage
      prevPage
    }
  }
`

export const getDeliveryCalculation = gql`
  query GetDeliveryCalculation(
    $originLong: Float!
    $originLat: Float!
    $destLong: Float!
    $destLat: Float!
    $code: String
    $restaurantId: String
  ) {
    getDeliveryCalculation(
      originLong: $originLong
      originLat: $originLat
      destLong: $destLong
      destLat: $destLat
      code: $code
      restaurantId: $restaurantId
    ) {
      amount
      originalDiscount
    }
  }
`

export const getPrepaidDeliveryPackages = gql`
  query GetPrepaidDeliveryPackages {
    getPrepaidDeliveryPackages {
      _id
      business {
        _id
        name
      }
      totalDeliveries
      usedDeliveries
      remainingDeliveries
      price
      maxDeliveryAmount
      isActive
      expiresAt
      createdBy
      createdAt
      updatedAt
    }
  }
`
export const getDispatchOptions = gql`
  query GetDispatchOptions {
    getDispatchOptions {
      delayDispatch
      firstAttemptRiders
      secondAttemptRiders
      thirdAttemptRiders
    }
  }
`

export const searchRiders = gql`
  query SearchRiders($search: String) {
    searchRiders(search: $search) {
      _id
      name
      username
    }
  }
`
