const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Location {
    location: Point
    deliveryAddress: String
  }
  type Address {
    _id: ID!
    location: Point
    deliveryAddress: String
    details: String
    label: String!
    selected: Boolean
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type OrderAddress {
    location: Point
    deliveryAddress: String
    details: String
    label: String
    id: String
  }

  type Item {
    _id: ID
    title: String
    food: String
    description: String
    image: String
    quantity: Int
    variation: ItemVariation
    addons: [ItemAddon]
    specialInstructions: String
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type Category {
    _id: ID!
    title: String!
    # foods: [Food!]
    createdAt: String!
    updatedAt: String!
  }

  type RestaurantId {
    restaurant: String!
  }

  type Categories {
    _id: ID!
    title: String!
    restaurant: RestaurantId
    createdAt: String
    updatedAt: String
  }
  type CategoriesByRestaurant {
    _id: ID!
    title: String!
    restaurant: RestaurantId
    createdAt: String
    updatedAt: String
  }

  type ReviewData {
    reviews: [Review]
    ratings: Float
    total: Int
  }

  type Owner {
    _id: String
    email: String
    name: String
    phone: String
    userType: String
  }

  type OrdersWithCashOnDeliveryInfo {
    orders: [Order!]!
    totalAmountCashOnDelivery: Float!
    countCashOnDeliveryOrders: Int!
  }
  type RestaurantPreview {
    _id: ID!
    orderId: Int!
    orderPrefix: String
    name: String!
    image: String
    address: String
    location: Point
    zone: Zone
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    sections: [String!]
    rating: Float
    isActive: Boolean!
    isAvailable: Boolean!
    openingTimes: [OpeningTimes]
    slug: String
    stripeDetailsSubmitted: Boolean
    commissionRate: Float
    owner: Owner
    deliveryBounds: Polygon
    tax: Float
    notificationToken: String
    enableNotification: Boolean
    shopType: String
    cuisines: [String]
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
    restaurantUrl: String
    phone: String
    businessCategories: [BusinessCategory]
  }

  type Restaurant {
    _id: String
    orderId: Int!
    orderPrefix: String
    name: String
    image: String
    logo: String
    address: String
    location: Point
    # categories: [Category!]
    # options: [Option!]
    # addons: [Addon!]
    reviewData: ReviewData
    zone: Zone
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    sections: [String!]
    rating: Float
    isActive: Boolean!
    isAvailable: Boolean!
    openingTimes: [OpeningTimes]
    slug: String
    stripeDetailsSubmitted: Boolean
    commissionRate: Float
    owner: Owner
    deliveryBounds: Polygon
    tax: Float
    notificationToken: String
    enableNotification: Boolean
    shopType: String
    shopCategory: ShopCategory
    cuisines: [String]
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
    restaurantUrl: String
    phone: String
    city: CityArea
    createdAt: Date
    businessCategories: [BusinessCategory]
    salesPersonName: String
    responsiblePersonName: String
    contactNumber: String
    isVisible: Boolean
    featured: Boolean
    lastOnlineAt: Date
  }

  type RestaurantCustomer {
    _id: ID!
    orderId: Int!
    orderPrefix: String
    name: String!
    image: String
    logo: String
    address: String
    location: Point
    categories: [CategoryCustomer!]
    options: [Option!]
    addons: [Addon!]
    reviewData: ReviewData
    zone: Zone
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    sections: [String!]
    rating: Float
    isActive: Boolean!
    isAvailable: Boolean!
    openingTimes: [OpeningTimes]
    slug: String
    stripeDetailsSubmitted: Boolean
    commissionRate: Float
    owner: Owner
    deliveryBounds: Polygon
    tax: Float
    notificationToken: String
    enableNotification: Boolean
    shopType: String
    shopCategory: ShopCategory
    cuisines: [String]
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
    restaurantUrl: String
    phone: String
    createdAt: String
    businessCategories: [BusinessCategory]
    featured: Boolean
    deliveryFee(latitude: Float, longitude: Float): Amount
    isOpen: Boolean
  }

  type CategoryCustomer {
    _id: ID!
    title: String!
    foods: [FoodCustomer!]
    createdAt: String!
    updatedAt: String!
  }
  type OpeningTimes {
    day: String!
    times: [Timings]
  }

  type Timings {
    startTime: [String]
    endTime: [String]
  }

  type Variation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [String!]
    stock: String
  }
  type VariationCustomer {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [String!]
    stock: String
  }

  type CartVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [CartAddon!]
  }

  type ItemVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float!
  }

  type Food {
    _id: ID!
    title: String
    description: String
    # variations: [Variation!]
    restaurant: String!
    category: String
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }
  type FoodCustomer {
    _id: ID
    title: String
    description: String
    variations: [Variation!]
    restaurant: String!
    category: String
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type NewFood {
    _id: ID!
    title: String
    description: String
    # variations: [Variation!]
    restaurant: String
    category: Category
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type FoodListByRestaurant {
    _id: ID!
    title: String
    description: String
    variations: [Variation!]
    restaurant: String!
    category: Category!
    image: String
    isActive: Boolean!
    stock: String
    createdAt: String!
    updatedAt: String!
  }

  type CartFood {
    _id: ID!
    title: String!
    description: String!
    variation: CartVariation!
    image: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Rider {
    _id: String
    name: String
    email: String
    username: String
    password: String
    phone: String
    image: String
    available: Boolean
    muted: Boolean
    zone: Zone
    isActive: Boolean
    createdAt: Date
    updatedAt: Date
    location: PointUpdated
    accountNumber: String
    currentWalletAmount: Float
    totalWalletAmount: Float
    withdrawnWalletAmount: Float
    startAvailabilityDate: Date
    endAvailabilityDate: Date
    lastUpdatedLocationDate: Date
    assignedOrdersCount: Float
    city: String
    profileImage: Image
    nationalIdImage: Image
  }

  type RiderLocation {
    location: PointUpdated
  }

  type User {
    _id: String
    name: String
    phone: String
    governate: String
    address_free_text: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    password: String
    isActive: Boolean
    isOrderNotification: Boolean
    isOfferNotification: Boolean
    createdAt: String
    updatedAt: String
    addresses: [Address!]
    notificationToken: String
    favourite: [String!]
    userType: String
    area: String
    firstTimeLogin: Boolean
  }

  type Configuration {
    _id: String!
    pushToken: String
    email: String
    emailName: String
    password: String
    enableEmail: Boolean
    clientId: String
    clientSecret: String
    sandbox: Boolean
    publishableKey: String
    secretKey: String
    currency: String
    currencySymbol: String
    deliveryRate: Float
    minimumDeliveryFee: Float
    twilioAccountSid: String
    twilioAuthToken: String
    twilioPhoneNumber: String
    twilioEnabled: Boolean
    formEmail: String
    sendGridApiKey: String
    sendGridEnabled: Boolean
    sendGridEmail: String
    sendGridEmailName: String
    sendGridPassword: String
    dashboardSentryUrl: String
    webSentryUrl: String
    apiSentryUrl: String
    customerAppSentryUrl: String
    restaurantAppSentryUrl: String
    riderAppSentryUrl: String
    googleApiKey: String
    cloudinaryUploadUrl: String
    cloudinaryApiKey: String
    webAmplitudeApiKey: String
    appAmplitudeApiKey: String
    webClientID: String
    androidClientID: String
    iOSClientID: String
    expoClientID: String
    googleMapLibraries: String
    googleColor: String
    termsAndConditions: String
    privacyPolicy: String
    testOtp: String
    firebaseKey: String
    authDomain: String
    projectId: String
    storageBucket: String
    msgSenderId: String
    appId: String
    measurementId: String
    isPaidVersion: Boolean
    skipMobileVerification: Boolean
    skipEmailVerification: Boolean
    enableRiderDemo: Boolean
    enableRestaurantDemo: Boolean
    enableAdminDemo: Boolean
    costType: String
    vapidKey: String
    availabilityPeriod: Float
  }
  type OrderStatus {
    pending: String!
    preparing: String
    picked: String
    delivered: String
    cancelled: String
  }

  type Order {
    _id: ID
    orderId: String
    resId: String
    restaurant: RestaurantDetail
    deliveryAddress: OrderAddress
    items: [Item]
    user: User
    paymentMethod: String
    paidAmount: Float
    orderAmount: Float
    status: Boolean
    paymentStatus: String
    orderStatus: String
    reason: String
    isActive: Boolean
    createdAt: String
    updatedAt: String
    deliveryCharges: Float
    tipping: Float
    taxationAmount: Float
    rider: Rider
    review: Review
    zone: Zone
    completionTime: String
    orderDate: String
    expectedTime: String
    preparationTime: String
    isPickedUp: Boolean
    acceptedAt: String
    pickedAt: String
    deliveredAt: String
    cancelledAt: Date
    assignedAt: String
    isRinged: Boolean
    isRiderRinged: Boolean
    instructions: String
    pickedImage: PickedImage
    pickupLocation: Point
    pickupAddress: String
    type: String
    mandoobSpecialInstructions: String
    riderInteractions: [RiderInteractions]
    originalDeliveryCharges: Float
    originalSubtotal: Float
    originalPrice: Float
    cancellation: Cancellation
    pickupLabel: String
    coupon: Coupon
    area: String
  }

  scalar Date

  type RiderInteractions {
    _id: String
    rider: Rider
    seenAt: Date
    openedAt: Date
  }

  type PickedImage {
    url: String
    publicId: String
  }

  type MyOrders {
    userId: String!
    orders: [Order!]
  }

  type RiderOrders {
    riderId: String!
    orders: [Order!]
  }

  type RestaurantDetail {
    _id: ID
    name: String
    image: String
    address: String
    location: Point
    slug: String
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
    tax: Float
    city: CityArea
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    name: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    picture: String
    addresses: Location
    isNewUser: Boolean
    isActive: Boolean!
  }

  type OwnerAuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    email: String!
    userType: String!
    restaurants: [Restaurant]!
    pushToken: String
  }

  type OwnerData {
    _id: ID!
    email: String!
    name: String
    phone: String
    userType: String!
    restaurants: [Restaurant]!
    pushToken: String
  }

  type Review {
    _id: ID
    order: Order
    restaurant: Restaurant
    rating: Int
    description: String
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type ReviewOutput {
    _id: ID!
    order: String!
    restaurant: String!
    review: Review!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Admin {
    userId: String!
    email: String!
    name: String!
    token: String!
  }

  type ForgotPassword {
    result: Boolean!
  }

  type Option {
    _id: String!
    title: String!
    description: String
    price: Float!
    restaurant: String
  }
  type ItemOption {
    _id: String!
    title: String!
    description: String
    price: Float!
  }

  type Addon {
    _id: String!
    options: [String!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type CartAddon {
    _id: String!
    options: [Option!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type ItemAddon {
    _id: String!
    options: [ItemOption!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type DashboardData {
    totalOrders: Int!
    totalSales: Float!
  }

  type DashboardSales {
    orders: [SalesValues!]
  }
  type DashboardOrders {
    orders: [OrdersValues!]
  }

  type SalesValues {
    day: String!
    amount: Float!
  }
  type OrdersValues {
    day: String!
    count: Int!
  }

  type Coupon {
    _id: String
    code: String
    rules: CouponRules
    target: CouponTarget
    status: String
  }

  type CouponTarget {
    cities: [CityArea]
    businesses: [Restaurant]
    customers: [User]
    categories: [BusinessCategory]
    foods: [Food]
  }

  type CouponRules {
    discount_type: String
    discount_value: Float
    applies_to: [String]
    min_order_value: Float
    max_discount: Float
    start_date: Date
    end_date: Date
    limit_total: Int
    limit_per_user: Int
  }

  type Taxation {
    _id: String!
    taxationCharges: Float
    enabled: Boolean!
  }
  type Tipping {
    _id: String!
    tipVariations: [Float]
    enabled: Boolean!
  }

  type OfferInfo {
    _id: String!
    name: String!
    tag: String!
    restaurants: [String]
  }
  type SectionInfo {
    _id: String!
    name: String!
    restaurants: [String]
  }
  type Offer {
    _id: String!
    name: String!
    tag: String!
    restaurants: [OfferRestaurant]
  }

  type OfferRestaurant {
    _id: String!
    name: String!
    image: String!
    address: String!
    location: Point
    categories: [Category]
  }
  type SectionRestaurant {
    _id: String!
    name: String!
  }
  type Section {
    _id: String!
    name: String!
    enabled: Boolean!
    restaurants: [SectionRestaurant]
  }

  type SubscriptionOrders {
    restaurantId: String
    userId: String
    order: Order!
    origin: String!
  }

  type Subscription_Zone_Orders {
    zoneId: String
    order: Order!
    origin: String!
  }

  type NearByData {
    restaurants: [RestaurantCustomer!]
    offers: [OfferInfo!]
    sections: [SectionInfo!]
  }
  type NearByDataPreview {
    restaurants: [RestaurantCustomer!]
    offers: [OfferInfo!]
    sections: [SectionInfo!]
  }

  type RestaurantAuth {
    token: String!
    restaurantId: String!
    city: String
  }

  type Polygon {
    coordinates: [[[Float!]]]
  }

  type Point {
    type: String!
    coordinates: [String!]
  }

  type PointUpdated {
    _id: String
    coordinates: [Float]
  }

  type Zone {
    _id: String!
    title: String!
    tax: Float
    description: String!
    location: Polygon
    isActive: Boolean!
  }

  type Earnings {
    _id: String!
    rider: Rider!
    orderId: String!
    deliveryFee: Float!
    orderStatus: String!
    paymentMethod: String!
    deliveryTime: String!
  }

  type WithdrawRequest {
    _id: String!
    requestId: String!
    requestAmount: Float!
    requestTime: String!
    rider: Rider!
    status: String!
  }

  input EarningsInput {
    _id: String
    rider: String!
    orderId: String!
    deliveryFee: Float!
    orderStatus: String!
    paymentMethod: String!
    deliveryTime: String!
  }

  input EmailConfigurationInput {
    email: String!
    password: String!
    emailName: String!
    enableEmail: Boolean!
  }

  input TwilioConfigurationInput {
    twilioAccountSid: String!
    twilioAuthToken: String!
    twilioPhoneNumber: String!
    twilioEnabled: Boolean!
  }
  input FormEmailConfigurationInput {
    formEmail: String!
  }
  input SendGridConfigurationInput {
    sendGridApiKey: String!
    sendGridEnabled: Boolean!
    sendGridEmail: String!
    sendGridEmailName: String!
    sendGridPassword: String!
  }

  input SentryConfigurationInput {
    dashboardSentryUrl: String!
    webSentryUrl: String!
    apiSentryUrl: String!
    customerAppSentryUrl: String!
    restaurantAppSentryUrl: String!
    riderAppSentryUrl: String!
  }
  input GoogleApiKeyConfigurationInput {
    googleApiKey: String!
  }
  input CloudinaryConfigurationInput {
    cloudinaryUploadUrl: String!
    cloudinaryApiKey: String!
  }
  input AmplitudeApiKeyConfigurationInput {
    webAmplitudeApiKey: String!
    appAmplitudeApiKey: String!
  }
  input GoogleClientIDConfigurationInput {
    webClientID: String!
    androidClientID: String!
    iOSClientID: String!
    expoClientID: String!
  }
  input WebConfigurationInput {
    googleMapLibraries: String!
    googleColor: String!
  }
  input AppConfigurationsInput {
    termsAndConditions: String!
    privacyPolicy: String!
    testOtp: String!
  }

  input FirebaseConfigurationInput {
    firebaseKey: String!
    authDomain: String!
    projectId: String!
    storageBucket: String!
    msgSenderId: String!
    appId: String!
    measurementId: String!
    vapidKey: String
  }

  input PaypalConfigurationInput {
    clientId: String!
    clientSecret: String!
    sandbox: Boolean!
  }

  input StripeConfigurationInput {
    publishableKey: String!
    secretKey: String!
  }

  input CurrencyConfigurationInput {
    currency: String!
    currencySymbol: String!
  }

  input VerificationConfigurationInput {
    skipEmailVerification: Boolean!
    skipMobileVerification: Boolean!
  }

  input DemoConfigurationInput {
    enableRiderDemo: Boolean!
    enableRestaurantDemo: Boolean!
    enableAdminDemo: Boolean!
  }

  input DeliveryCostConfigurationInput {
    deliveryRate: Float!
    costType: String
    minimumDeliveryFee: Float!
  }

  input UpdateUser {
    name: String!
    email: String
  }
  input AddonsInput {
    _id: String
    options: [String!]
  }
  input OrderInput {
    food: String!
    quantity: Int!
    variation: String!
    addons: [AddonsInput!]
    specialInstructions: String
  }

  input VariationInput {
    _id: String
    title: String
    price: Float!
    discounted: Float
    addons: [String!]
    stock: String
  }

  input FoodInput {
    _id: String
    restaurant: String!
    category: String!
    title: String!
    description: String
    file: Upload
    variations: [VariationInput!]
    stock: String
  }

  input RiderInput {
    _id: String
    name: String!
    email: String
    username: String!
    password: String!
    phone: String!
    image: String
    available: Boolean!
    zone: String!
    accountNumber: String
    city: String
    profileImage: Upload
    nationalIdImage: Upload
  }

  input UserInput {
    phone: String
    email: String
    governate: String
    address_free_text: String
    password: String
    name: String
    addresses: [AddressInput]
    notificationToken: String
    appleId: String
    area: String
  }

  input UpdateAddressUserInput {
    userId: String!
    addresses: [AddressInput]
    details: String
    area: String
    type: String
  }

  input OwnerInput {
    email: String
    password: String
  }

  input VendorInput {
    _id: String
    email: String
    name: String
    phone: String
    password: String
  }

  input ReviewInput {
    order: String
    rating: Int
    description: String
  }

  input PointInput {
    type: String!
    coordinates: [String!]
  }

  input LocationInput {
    location: PointInput
    deliveryAddress: String
  }

  input CategoryInput {
    _id: String
    title: String!
    restaurant: String!
  }

  input RestaurantInput {
    name: String!
    username: String
    password: String
    image: String
    logo: String
    address: String
    categories: [CategoryInput!]
    reviews: [ReviewInput!]
    deliveryTime: Int
    minimumOrder: Int
    salesTax: Float
    shopType: String
    cuisines: [String]
    restaurantUrl: String
    phone: String
    city: String
    businessCategories: [String!]
    salesPersonName: String
    responsiblePersonName: String
    contactNumber: String
    featured: Boolean
  }

  input RestaurantProfileInput {
    _id: String
    name: String!
    image: String
    logo: String
    address: String
    orderPrefix: String
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    salesTax: Float
    shopType: String
    cuisines: [String]
    restaurantUrl: String
    phone: String
    city: String
    businessCategories: [String!]
    salesPersonName: String
    responsiblePersonName: String
    contactNumber: String
    isVisible: Boolean
    featured: Boolean
  }

  input OptionInput {
    _id: String
    title: String!
    description: String!
    price: Float!
    # restaurant: String!
  }

  input editOptionInput {
    # restaurant: String!
    options: OptionInput
  }

  input CreateOptionInput {
    options: [OptionInput!]!
  }

  input AddonInput {
    # addons: [createAddonInput!]!
    title: String!
    description: String
    options: [String!]
    quantityMinimum: Int!
    quantityMaximum: Int!
  }
  type AddonResponse {
    title: String
    description: String
    options: [String!]
    quantityMinimum: Int
    quantityMaximum: Int
  }
  input editAddonInput {
    restaurant: String!
    addons: createAddonInput!
  }
  input createAddonInput {
    title: String!
    _id: String
    description: String
    options: [String]
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  # input CouponInput {
  #   _id: String
  #   title: String!
  #   discount: Float!
  #   enabled: Boolean
  # }

  input CouponInput {
    _id: String
    code: String!
    description: String
    target: CouponTargetInput
    rules: CouponRulesInput
    tracking: CouponTrackingInput
    status: String
  }

  input CouponTargetInput {
    cities: [String]
    businesses: [String]
    customers: [String]
    categories: [String]
    foods: [String]
  }

  input CouponRulesInput {
    discount_type: String # Enum: "percent" or "flat"
    discount_value: Float
    applies_to: [String]
    min_order_value: Float
    max_discount: Float
    start_date: Date
    end_date: Date
    limit_total: Int
    limit_per_user: Int
  }

  input CouponTrackingInput {
    usage_count: Int
    user_usage: [UserUsageEntryInput]
  }

  input UserUsageEntryInput {
    user_id: String
    count: Int
  }

  input TippingInput {
    _id: String
    tipVariations: [Float]
    enabled: Boolean
  }
  input TaxationInput {
    _id: String
    taxationCharges: Float
    enabled: Boolean
  }
  input AddressInput {
    _id: String
    longitude: String
    latitude: String
    deliveryAddress: String
    details: String
    label: String!
    selected: Boolean
  }
  input CartFoodInput {
    _id: String
    variation: CartVariationInput!
  }
  input CartVariationInput {
    _id: String
    addons: [CartAddonInput!]
  }
  input CartAddonInput {
    _id: String
    options: [String!]
  }
  input OfferInput {
    _id: String
    name: String!
    tag: String!
    restaurants: [String]
  }
  input SectionInput {
    _id: String
    name: String!
    enabled: Boolean!
    restaurants: [String]
  }

  input ZoneInput {
    _id: String
    title: String!
    description: String!
    coordinates: [[[Float!]]]
  }

  input TimingsInput {
    day: String!
    times: [TimesInput]
  }

  input TimesInput {
    startTime: [String]
    endTime: [String]
  }

  input FormSubmissionInput {
    name: String!
    email: String!
    message: String!
  }

  input CuisineInput {
    _id: String
    name: String!
    description: String
    image: String
    shopType: String
  }

  type Cuisine {
    _id: String!
    name: String!
    description: String
    image: String
    shopType: String
  }

  type Banner {
    _id: String!
    title: String
    description: String
    file: String
    action: String
    screen: String
    parameters: String
  }

  input BannerInput {
    _id: String
    title: String
    description: String
    file: String
    action: String
    screen: String
    parameters: String
  }

  type FormSubmissionResponse {
    message: String!
    status: String!
  }

  type RestaurantResponse {
    success: Boolean!
    message: String
    data: Restaurant
  }

  input CoordinatesInput {
    longitude: Float!
    latitude: Float!
  }

  type SaveNotificationTokenWebResponse {
    success: Boolean!
    message: String
  }

  type Otp {
    result: Boolean!
  }

  type ChatMessageResponse {
    success: Boolean!
    message: String
    data: ChatMessageOutput
  }

  type ChatMessageOutput {
    id: ID!
    message: String!
    user: ChatUserOutput!
    createdAt: String!
  }

  input ChatMessageInput {
    message: String!
    user: ChatUserInput!
  }

  input ChatUserInput {
    id: ID!
    name: String!
  }

  type ChatUserOutput {
    id: ID!
    name: String!
  }
  type WithdrawRequestReponse {
    success: Boolean!
    data: [WithdrawRequest!]
    message: String
    pagination: Pagination
  }
  type Pagination {
    total: Int
  }
  type UpdateWithdrawResponse {
    success: Boolean!
    data: RiderAndWithdrawRequest
    message: String
  }
  type RiderAndWithdrawRequest {
    rider: Rider!
    withdrawRequest: WithdrawRequest!
  }

  type City {
    id: Int
    name: String
    latitude: String
    longitude: String
  }

  type Country {
    id: Int
    name: String
    latitude: String
    longitude: String
    cities: [City]
  }

  type PopularItemsResponse {
    id: String!
    count: Int!
  }

  type DemoCredentails {
    restaurantUsername: String
    restaurantPassword: String
    riderUsername: String
    riderPassword: String
  }

  type CityArea {
    _id: String!
    title: String
    address: String
    isActive: Boolean
    location: LocationArea
  }

  type InsideLocationArea {
    coordinates: [Float!]
  }

  type LocationArea {
    _id: String!
    location: InsideLocationArea
  }

  type Area {
    _id: String!
    title: String
    city: CityArea
    address: String
    location: LocationArea
  }

  type Business {
    _id: String!
    name: String!
    businessName: String!
    address: String!
    phone: String!
  }
  type RiderRegister {
    _id: String!
    name: String!
    city: String!
    phone: String!
  }

  type ShopCategory {
    _id: String!
    title: String
  }

  type OrdersPaginate {
    docs: [Order]
    totalDocs: Float
    limit: Float
    totalPages: Float
    page: Float
    pagingCounter: Float
    hasPrevPage: Boolean
    hasNextPage: Boolean
    prevPage: Float
    nextPage: Float
  }

  type DeliveryPrice {
    _id: String
    originZone: Zone
    destinationZone: Zone
    cost: Float!
  }

  type DeliveryZone {
    _id: String!
    title: String!
    tax: Float
    description: String!
    location: Polygon
    isActive: Boolean!
    city: String
  }

  type Amount {
    amount: Float
    originalDiscount: Float
    isPrepaid: Boolean
  }

  type Image {
    url: String
    publicId: String
  }

  type BusinessCategory {
    _id: String
    name: String
    description: String
    image: Image
    isActive: Boolean
    order: Float
  }

  type DeliveryFeeList {
    _id: String
    title: String
    city: CityArea
    address: String
    location: LocationArea
    distance: Float
    cost: Float
  }

  input ItemCart {
    _id: String
    price: Float
    quantity: Float
    variation: _idInput
    addons: [AddonCart]
  }

  input _idInput {
    _id: String
  }

  input OptionCart {
    _id: String
  }

  input AddonCart {
    _id: String
    options: [OptionCart]
  }

  input Cart {
    code: String
    items: [ItemCart]
    deliveryCharges: Float
    tax: Float
  }

  type CalculatePriceResult {
    total: Float
    subtotal: Float
    finalDeliveryCharges: Float
    subtotalDiscount: Float
    deliveryDiscount: Float
    tax: Float
    originalSubtotal: Float
    originalTotal: Float
    originalDeliveryCharges: Float
  }

  type Contactus {
    _id: String
    name: String
    phone: String
    email: String
    message: String
    createdAt: Date
  }

  type PaginatedContactus {
    docs: [Contactus]
    totalDocs: Int
    limit: Int
    page: Int
    totalPages: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
    nextPage: Int
    prevPage: Int
  }

  type PaginatedNotification {
    docs: [Notification]
    totalDocs: Int
    limit: Int
    page: Int
    totalPages: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
    nextPage: Int
    prevPage: Int
  }

  type Notification {
    _id: String
    title: String
    body: String
    data: NotificationData
    recipients: [NotificationRecipient]
    createdAt: Date
    sentAt: String
    acknowledgedAt: String
  }

  type NotificationData {
    orderId: String
    type: String
    extraInfo: String # optional, if needed
  }

  type NotificationRecipient {
    kind: String
    item: RecipientItem
    status: String
    lastAttempt: Date
  }

  union RecipientItem = User | Rider | Restaurant

  type PrepaidDeliveryPackage {
    _id: String!
    business: Restaurant
    totalDeliveries: Int!
    usedDeliveries: Int!
    price: Float!
    maxDeliveryAmount: Float
    isActive: Boolean!
    expiresAt: String
    createdBy: String
    createdAt: String
    updatedAt: String
    remainingDeliveries: Int
  }

  input DeliveryCalculationInput {
    originLong: Float!
    originLat: Float!
    destLong: Float!
    destLat: Float!
    code: String
    restaurantId: String
  }

  type DispatchOptions {
    delayDispatch: Float
    firstAttemptRiders: Float
    secondAttemptRiders: Float
    thirdAttemptRiders: Float
  }

  input FilterRestaurantsInput {
    longitude: Float!
    latitude: Float!
    mode: String # "offers" | "featured" | "mostOrdered" | "custom"
    categories: [ID]
    highlights: [String]
    minRating: Float
    maxRating: Float
    search: String
  }

  type Query {
    filterRestaurants(
      longitude: Float!
      latitude: Float!
      mode: String # "offers" | "featured" | "mostOrdered" | "custom"
      categories: [ID]
      highlights: [String]
      minRating: Float
      maxRating: Float
      search: String
    ): [RestaurantCustomer]
    getRestaurantsBusinessCategories(
      businessCategoryIds: [String!]!
      longitude: Float!
      latitude: Float!
    ): [RestaurantCustomer!]
    searchRiders(search: String): [Rider!]
    getRiderOrderReview(orderId: String!, riderId: String!): Boolean
    getDispatchOptions: DispatchOptions
    restaurantOrdersHistory(startDate: String, endDate: String): [Order!]
    getPrepaidDeliveryPackages: [PrepaidDeliveryPackage!]
    checkDeliveryZone(latitude: Float!, longitude: Float!): Message
    getAllNotifications(page: Int, limit: Int): PaginatedNotification
    getAllContactus(page: Int, limit: Int): PaginatedContactus
    getStockEnumValues: [String]
    checkoutCalculatePrice(cart: Cart): CalculatePriceResult
    coupons: [Coupon!]!
    getCouponStatuses: [String]
    getCouponDiscountTypeEnums: [String]
    getCouponEnums: [String]
    searchFood(search: String): [Food]
    searchUsers(search: String): [User]
    searchRestaurants(
      search: String
      longitude: Float
      latitude: Float
    ): [Restaurant]
    searchRestaurantsCustomer(
      search: String
      longitude: Float
      latitude: Float
      businessCategoryId: String
    ): [RestaurantPreview]
    getRidersLocation(cityId: String): [Rider]
    orderRidersInteractions(id: String!): [RiderInteractions]
    isRestaurantOpenNow(id: String!): Boolean!
    areasCalculatedList(restaurantId: String!): [DeliveryFeeList]
    featuredRestaurants(
      longitude: Float!
      latitude: Float!
    ): [RestaurantCustomer!]
    nearestRestaurants(
      longitude: Float!
      latitude: Float!
    ): [RestaurantCustomer!]
    restaurantsWithOffers(
      longitude: Float!
      latitude: Float!
    ): [RestaurantCustomer!]
    highestRatingRestaurant(
      longitude: Float!
      latitude: Float!
    ): [RestaurantCustomer!]
    getBusinessCategoriesCustomer: [BusinessCategory!]
    getBusinessCategories: [BusinessCategory!]
    getDeliveryCalculation(
      originLong: Float!
      originLat: Float!
      destLong: Float!
      destLat: Float!
      code: String
      restaurantId: String
    ): Amount
    getDeliveryCalculationV2(input: DeliveryCalculationInput!): Amount
    getAllDeliveryZones: [DeliveryZone!]
    allDeliveryPrices: [DeliveryPrice!]
    getShopCategories: [ShopCategory!]
    getBusinesses: [Business!]
    getRidersRegistered: [RiderRegister!]
    areasByCity(id: String!): [Area!]
    areas: [Area!]
    cities: [CityArea!]
    citiesAdmin: [CityArea!]
    withdrawRequests: [WithdrawRequest!]!
    earnings: [Earnings!]!
    categories: [Categories!]
    getAddonsByRestaurant(id: String!): [Addon!]
    foodListByRestaurant(id: String!): [FoodListByRestaurant!]
    categoriesByRestaurant(id: String!): [CategoriesByRestaurant!]
    foods: [Food!]!
    orders(offset: Int): [Order!]!
    singleOrder(id: String!): Order!
    undeliveredOrders(offset: Int): [Order!]!
    deliveredOrders(offset: Int): [Order!]!
    allOrders(page: Int): [Order!]!
    getDashboardTotal(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardData!
    likedFood: [Food!]!
    reviews(offset: Int, restaurant: String!): [Review!]
    userHasOrderReview(orderId: String!, restaurantId: String!): Boolean
    foodByCategory(
      category: String!
      onSale: Boolean
      inStock: Boolean
      min: Float
      max: Float
      search: String
    ): [Food!]!
    profile: User
    configuration: Configuration!
    users: [User!]
    search_users(search: String): [User!]
    userFavourite(latitude: Float, longitude: Float): [RestaurantCustomer]
    order(id: String!): Order!
    orderPaypal(id: String!): Order!
    orderStripe(id: String!): Order!
    riders: [Rider!]
    rider(id: String): Rider!
    riderEarnings(id: String, offset: Int): [Earnings!]
    riderWithdrawRequests(id: String, offset: Int): [WithdrawRequest!]
    pageCount(restaurant: String!): Int
    availableRiders: [Rider]
    getOrderStatuses: [String!]
    getPaymentStatuses: [String!]
    assignedOrders(id: String): [Order!]
    options(id: String!): [Option!]
    addons(id: String!): [Addon!]
    foodByIds(foodIds: [CartFoodInput!]!): [CartFood!]
    getDashboardOrders(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardOrders!
    getDashboardSales(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardSales!
    cuisines: [Cuisine!]!
    banners: [Banner!]!
    bannerActions: [String!]!
    taxes: Taxation!
    tips: Tipping!
    nearByRestaurants(
      latitude: Float
      longitude: Float
      shopType: String
    ): NearByData!
    nearByRestaurantsPreview(
      latitude: Float
      longitude: Float
      shopType: String
    ): NearByDataPreview!
    restaurantCustomerAppDetail(id: String!): RestaurantCustomer!
    restaurantList: [Restaurant!]
    restaurantListPreview: [RestaurantPreview!]
    ordersByRestId(
      restaurant: String!
      page: Int
      rows: Int
      search: String
    ): [Order!]
    getOrdersByAdmin(page: Int, limit: Int, search: String): OrdersPaginate
    getActiveOrders(page: Float, limit: Float, restaurantId: ID): OrdersPaginate
    getOrdersByDateRange(
      startingDate: String!
      endingDate: String!
      restaurant: String!
    ): OrdersWithCashOnDeliveryInfo!
    getSingleFood(id: String!): FoodCustomer!
    riderCompletedOrders: [Order!]
    restaurant(id: String, slug: String): Restaurant!
    restaurantCustomer(id: String, slug: String): RestaurantCustomer!
    restaurantPreview(id: String, slug: String): RestaurantPreview!
    restaurants: [Restaurant!]
    restaurantsPreview: [RestaurantPreview!]
    restaurantByOwner(id: String): [Restaurant!]
    offers: [Offer]
    sections: [Section]
    vendors: [OwnerData]
    getVendor(id: String!): OwnerData
    orderCount(restaurant: String!): Int
    restaurantOrders: [Order!]!
    zones: [Zone!]
    # deliveryZones: [Zone!]
    # singleDeliveryZone: Zone!
    zone(id: String!): Zone!
    unassignedOrdersByZone: [Order!]
    riderOrders: [Order!]
    orderDetails(id: String!): Order!
    ridersByZone(id: String!): [Rider!]
    chat(order: ID!): [ChatMessageOutput!]
    getAllWithdrawRequests(offset: Int): WithdrawRequestReponse!
    getCountries: [Country]
    getCountryByIso(iso: String!): Country
    recentOrderRestaurants(latitude: Float!, longitude: Float!): [Restaurant!]
    recentOrderRestaurantsPreview(
      latitude: Float!
      longitude: Float!
    ): [RestaurantPreview!]
    mostOrderedRestaurants(latitude: Float!, longitude: Float!): [Restaurant!]
    mostOrderedRestaurantsPreview(
      latitude: Float!
      longitude: Float!
    ): [RestaurantCustomer!]
    relatedItems(itemId: String!, restaurantId: String!): [String!]!
    # popularItems(restaurantId: String!): [PopularItemsResponse!]!
    popularItems(restaurantId: String!): [FoodCustomer!]!
    topRatedVendors(latitude: Float!, longitude: Float!): [Restaurant!]
    topRatedVendorsPreview(
      latitude: Float!
      longitude: Float!
    ): [RestaurantPreview!]
    lastOrderCreds: DemoCredentails
  }

  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Message {
    message: String!
  }

  input DeliveryInput {
    cityId: String!
    title: String!
  }

  input AreaInput {
    city: String!
    title: String!
    address: String!
    coordinates: [Float!]
  }

  input BusinessInput {
    name: String!
    businessName: String!
    address: String!
    phone: String!
  }

  input RiderRegisterInput {
    name: String!
    city: String!
    phone: String!
  }

  input ShopCategoryInput {
    title: String!
  }

  type GoogleUserLogin {
    token: String!
    user: User
  }

  input NewCheckoutOrderInput {
    phone: String
    name: String
    areaId: String
    addressDetails: String
    orderAmount: Int
    restaurantId: String
    preparationTime: Int
    # deliveryFee: Float
  }

  input DeliveryPriceInput {
    originZone: String!
    destinationZone: String!
    cost: Float!
  }

  input DeliveryZoneInput {
    _id: String
    title: String!
    description: String!
    coordinates: [[[Float!]]]
    city: String!
  }

  enum RequestStatus {
    pending
    accepted
    on_the_way
    picked_up
    delivered
    cancelled
    failed
  }

  enum RequestChannel {
    customer_app
    business_app
    web_portal
    api
    admin
    whatsapp_bot
    manual_entry
  }

  enum PaymentMethod {
    cash
    card
    wallet
  }

  enum PaymentStatus {
    pending
    paid
    failed
  }

  enum PriorityLevel {
    standard
    express
    bulk
  }

  enum CancellationReason {
    customer_cancelled
    mandoob_cancelled
    timeout
    admin_cancelled
    other
  }

  # enum CancelledBy {
  #   customer
  #   mandoob
  #   admin
  # }

  type DeliveryRequest {
    id: ID!
    customerId: ID!
    pickupLat: Float!
    pickupLng: Float!
    pickupAddressText: String!
    dropoffLat: Float!
    dropoffLng: Float!
    dropoffAddressText: String!
    itemDescription: String
    notes: String
    mandoobId: ID
    fare: Float!
    estimatedTime: Int!
    distanceKm: Float!
    status: RequestStatus!
    requestChannel: RequestChannel!
    scheduledAt: String
    paymentMethod: PaymentMethod!
    paymentStatus: PaymentStatus!
    transactionId: String
    proofPhotoUrlPick: String
    proofPhotoUrlDeliver: String
    recipientSignature: String
    recipientName: String
    recipientPhone: String
    priorityLevel: PriorityLevel!
    isUrgent: Boolean!
    attemptCount: Int!
    cancellationReason: CancellationReason
    cancelledBy: CancelledBy
    createdAt: String!
    updatedAt: String!
  }

  input CreateDeliveryRequestInput {
    pickupLat: Float!
    pickupLng: Float!
    pickupAddressText: String!
    pickupAddressFreeText: String
    pickupLabel: String
    dropoffLat: Float!
    dropoffLng: Float!
    dropoffAddressText: String!
    dropoffAddressFreeText: String
    dropoffLabel: String
    deliveryFee: Float!
    requestChannel: RequestChannel!
    is_urgent: Boolean
    notes: String
    phone: String
    name: String
    couponId: String
  }

  input BusinessCategoryInput {
    name: String!
    description: String
    file: Upload
    order: Float
  }

  type CustomerLoginResponse {
    token: String
    user: User
  }

  input ApplyCouponInput {
    code: String!
    type: String
    orderSubtotal: Float!
    orderMeta: CouponOrderMetaInput
  }

  type ApplyCouponResult {
    code: String
    valid: Boolean!
    discount: Float
    maxDiscount: Float
    message: String!
    appliesTo: String
    discountType: String
    foods: [Food]
  }

  input CouponOrderMetaInput {
    business_id: String
    # customer_id: String // Obtained from the authenticated user token - req.userId
    # city: String
    # category_ids: [String] // Obtained from the item_ids
    location: CoordinatesInput
    item_ids: [String]
  }

  # input LocationInputCoords {
  #   location: CoordinatesInput
  # }

  input ApplyCouponMandoobInput {
    code: String
    deliveryFee: Float
    location: CoordinatesInput
  }

  type Cancellation {
    kind: CancelledByKind
    cancelledBy: CancelledBy
    reason: String
  }

  enum CancelledByKind {
    User
    Owner
    Restaurant
  }

  union CancelledBy = User | Owner | Restaurant

  input LocationInputAddress {
    type: String!
    coordinates: [Float!]!
  }

  input AddressInputBulk {
    deliveryAddress: String
    details: String
    label: String
    isActive: Boolean
    location: LocationInputAddress!
  }

  input PrepaidDeliveryPackageInput {
    business: String!
    totalDeliveries: Int!
    usedDeliveries: Int
    price: Float!
    isActive: Boolean
    expiresAt: String
    maxDeliveryAmount: Float!
    # createdBy: String
  }

  input FoodStockInput {
    id: String!
    stock: String
  }

  input DispatchOptionsInput {
    delayDispatch: Float
    firstAttemptRiders: Float
    secondAttemptRiders: Float
    thirdAttemptRiders: Float
  }

  input RiderReviewInput {
    rider: String!
    order: String!
    rating: Int!
    description: String
  }

  input AdminCheckoutInput {
    restaurant: String!
    area: String!
    time: Float!
    deliveryAmount: Float!
    rider: String
    cost: Float!
  }
  input AdminUpdateOrder {
    # restaurant: String!
    area: String!
    time: Float!
    deliveryAmount: Float!
    rider: String
    cost: Float!
  }

  type Mutation {
    adminOrderUpdate(id: String!, input: AdminUpdateOrder!): Message
    adminCheckout(input: AdminCheckoutInput): Message
    createRiderReview(input: RiderReviewInput!): Message
    heartbeatRestaurant(id: String!): Message
    updateDispatchOptions(input: DispatchOptionsInput!): Message
    updateRiderAvailabilityPeriod(period: Float!): Message
    updateRiderStatus(available: Boolean!): Message
    updateStockFood(input: FoodStockInput!): Message
    updateActivePrepaidDeliveryPackage(id: String!): Message
    removePrepaidDeliveryPackage(id: String!): Message
    updatePrepaidDeliveryPackage(
      id: String!
      input: PrepaidDeliveryPackageInput!
    ): Message
    createPrepaidDeliveryPackage(input: PrepaidDeliveryPackageInput!): Message
    bulkAddUserAddresses(
      userId: String!
      addresses: [AddressInputBulk!]!
    ): Message
    updateUserName(id: String!, name: String!): Message
    makeRestaurantVisible(id: String!): Message
    createBusinessMenu(file: Upload, restaurantId: String!): Message
    acknowledgeNotification(notificationId: String): Message
    markContactusResponded(id: String): Message
    createContactus(
      email: String
      name: String
      phone: String
      message: String
    ): Message
    updateEmail(email: String): Message
    applyCouponMandoob(
      applyCouponMandoobInput: ApplyCouponMandoobInput
    ): ApplyCouponResult
    applyCoupon(applyCouponInput: ApplyCouponInput): ApplyCouponResult
    editCoupon(id: String!, couponInput: CouponInput!): Message
    createCoupon(couponInput: CouponInput!): Message
    orderSeenByRider(id: String!, riderId: String!): Message
    orderOpenedByRider(id: String!, riderId: String!): Message
    resetPasswordCustomer(phone: String!, password: String!): ForgotPassword
    customerLogin(
      phone: String!
      password: String!
      notificationToken: String
    ): CustomerLoginResponse
    defaultTimings(id: String!): Message
    refreshFirebaseToken(notificationToken: String): Message
    phoneIsVerified: Boolean!
    verifyPhoneOTP(otp: String!, phone: String!): Message
    validatePhoneUnauth(phone: String!): Message
    validatePhone(phone: String!): Message
    updatePhone(phone: String!): Message
    changeActiveBusinessCategory(id: String!): Message
    createBusinessCategory(input: BusinessCategoryInput!): Message
    editBusinessCategory(input: BusinessCategoryInput!, id: String!): Message
    removeBusinessCategory(id: String!): Message
    createDeliveryRequestAdmin(input: CreateDeliveryRequestInput!): Message
    createDeliveryRequest(input: CreateDeliveryRequestInput!): Message
    createDeliveryZone(deliveryZoneInput: DeliveryZoneInput): Message
    updateDeliveryZone(deliveryZoneInput: DeliveryZoneInput): Message
    removeDeliveryZone(id: String!): Message
    createDeliveryPrice(deliveryPriceInput: DeliveryPriceInput): Message
    updateDeliveryPrice(id: String!, cost: Float!): Message
    removeDeliveryPrice(id: String!): Message
    submitEmailOTP(email: String!, otp: String!): Message
    deactivateRestaurant(id: String!): Message
    googleAuthCustomerApp(
      name: String!
      email: String!
      sub: String
    ): GoogleUserLogin
    newCheckoutPlaceOrder(input: NewCheckoutOrderInput): Order!
    googleAuth(code: String!): GoogleUserLogin
    createShopCategory(shopCategoryInput: ShopCategoryInput!): Message
    editShopCategory(
      id: String!
      shopCategoryInput: ShopCategoryInput!
    ): Message
    removeShopCategory(id: String!): Message
    createBusiness(businessInput: BusinessInput): Message
    createRiderRegister(riderRegisterInput: RiderRegisterInput): Message
    removeRiderRegistered(id: String!): Message
    searchUsersByBusiness(searchText: String!): User
    createArea(areaInput: AreaInput!): Message
    editArea(id: String!, locationId: String!, areaInput: AreaInput!): Message
    removeArea(id: String!): Message
    createCity(title: String!, coordinates: [Float]): Message
    editCity(
      id: String!
      title: String!
      coordinates: [Float]
      locationId: String
    ): Message
    toggleCityActive(id: String!): Message
    removeCity(id: String!): Message
    CheckOutPlaceOrder(
      userId: ID!
      addressId: ID
      resId: String!
      orderAmount: Float!
      preparationTime: Float
    ): Order!
    createWithdrawRequest(amount: Float!): WithdrawRequest!
    updateWithdrawReqStatus(id: ID!, status: String!): UpdateWithdrawResponse!
    uploadFile(id: ID!, file: Upload!): Message!
    uploadRestaurantLogo(id: ID!, file: Upload!): Message!
    uploadFoodImage(id: ID!, file: Upload!): Message!
    createEarning(earningsInput: EarningsInput): Earnings!
    sendOtpToEmail(email: String!, otp: String!): Otp!
    sendOtpToPhoneNumber(phone: String!, otp: String!): Otp!
    emailExist(email: String!): User!
    phoneExist(phone: String!): User!
    findOrCreateUser(userInput: UserInput): User!
    updateUserAddress(userInput: UpdateAddressUserInput): User
    Deactivate(isActive: Boolean!, email: String!): User!
    adminLogin(email: String!, password: String!): Admin!
    login(
      appleId: String
      email: String
      password: String
      type: String!
      name: String
      notificationToken: String
      isActive: Boolean
    ): AuthData!
    ownerLogin(email: String!, password: String!): OwnerAuthData!
    createUser(userInput: UserInput): AuthData!
    createVendor(vendorInput: VendorInput): OwnerData!
    editVendor(vendorInput: VendorInput): OwnerData!
    deleteVendor(id: String!): Boolean
    updateUser(updateUserInput: UpdateUser): User!
    updateNotificationStatus(
      offerNotification: Boolean!
      orderNotification: Boolean!
    ): User!
    createCategory(category: CategoryInput): Category!
    editCategory(category: CategoryInput): Category!
    createFood(foodInput: FoodInput): NewFood!
    editFood(foodInput: FoodInput): NewFood!
    placeOrder(
      restaurant: String!
      orderInput: [OrderInput!]!
      paymentMethod: String!
      couponCode: String
      address: AddressInput!
      tipping: Float!
      orderDate: String!
      isPickedUp: Boolean!
      taxationAmount: Float!
      deliveryCharges: Float!
      instructions: String # total: Float!
    ): Order!
    editOrder(_id: String!, orderInput: [OrderInput!]!): Order!
    reviewOrder(reviewInput: ReviewInput!): Order!
    acceptOrder(_id: String!, time: String): Order!
    acceptOrderAdmin(_id: String!, restaurantId: String!, time: String): Order!
    orderPickedUp(_id: String!): Order!
    cancelOrder(_id: String!, reason: String!): Order!
    likeFood(foodId: String!): Food!
    saveEmailConfiguration(
      configurationInput: EmailConfigurationInput!
    ): Configuration!
    saveFormEmailConfiguration(
      configurationInput: FormEmailConfigurationInput!
    ): Configuration!
    saveSendGridConfiguration(
      configurationInput: SendGridConfigurationInput!
    ): Configuration!

    saveFirebaseConfiguration(
      configurationInput: FirebaseConfigurationInput!
    ): Configuration!

    saveSentryConfiguration(
      configurationInput: SentryConfigurationInput!
    ): Configuration!
    saveGoogleApiKeyConfiguration(
      configurationInput: GoogleApiKeyConfigurationInput!
    ): Configuration!
    saveCloudinaryConfiguration(
      configurationInput: CloudinaryConfigurationInput!
    ): Configuration!
    saveAmplitudeApiKeyConfiguration(
      configurationInput: AmplitudeApiKeyConfigurationInput!
    ): Configuration!
    saveGoogleClientIDConfiguration(
      configurationInput: GoogleClientIDConfigurationInput!
    ): Configuration!
    saveWebConfiguration(
      configurationInput: WebConfigurationInput!
    ): Configuration!
    saveAppConfigurations(
      configurationInput: AppConfigurationsInput!
    ): Configuration!

    saveDeliveryRateConfiguration(
      configurationInput: DeliveryCostConfigurationInput
    ): Configuration

    savePaypalConfiguration(
      configurationInput: PaypalConfigurationInput!
    ): Configuration!
    saveStripeConfiguration(
      configurationInput: StripeConfigurationInput!
    ): Configuration!
    saveTwilioConfiguration(
      configurationInput: TwilioConfigurationInput!
    ): Configuration!

    saveCurrencyConfiguration(
      configurationInput: CurrencyConfigurationInput!
    ): Configuration!
    pushToken(token: String): User!
    disableUserPushNotification(id: String!): Message
    updateOrderStatus(id: String!, status: String!, reason: String): Order!
    uploadToken(id: String!, pushToken: String!): OwnerData!
    forgotPassword(email: String!, otp: String!): ForgotPassword!
    resetPassword(email: String!, password: String!): ForgotPassword!
    vendorResetPassword(oldPassword: String!, newPassword: String!): Boolean!
    deleteCategory(id: String!): Message!
    deleteFood(id: String!): Message!
    createRider(riderInput: RiderInput): Rider!
    editRider(riderInput: RiderInput): Rider!
    deleteRider(id: String!): Message
    toggleAvailablity(id: String): Rider!
    toggleMute(id: String): Rider!
    toggleActive(id: String): Rider!
    updateStatus(id: String, orderStatus: String!): Order!
    assignRider(id: String!, riderId: String!): Order!
    riderLogin(
      username: String
      password: String
      notificationToken: String
    ): AuthData!
    riderLogout(token: String!): Message
    updateOrderStatusRider(id: String!, status: String!, file: Upload): Order!
    updatePaymentStatus(id: String, status: String): Order!
    createOptions(id: String, optionInput: CreateOptionInput): [Option!]
    editOption(optionInput: editOptionInput): Message!
    deleteOption(id: String!): Message!
    createAddons(id: String!, addonInput: [AddonInput!]!): AddonResponse!
    editAddon(id: String!, addonInput: AddonInput!): AddonResponse!
    deleteAddon(id: String!): Message!
    deleteCoupon(id: String!): Message
    coupon(coupon: String!): Coupon!
    createCuisine(cuisineInput: CuisineInput!): Cuisine!
    editCuisine(cuisineInput: CuisineInput!): Cuisine!
    deleteCuisine(id: String!): String!
    cuisine(cuisine: String!): Cuisine!
    createBanner(bannerInput: BannerInput!): Banner!
    editBanner(bannerInput: BannerInput!): Banner!
    deleteBanner(id: String!): String!
    banner(banner: String!): Banner!
    createTipping(tippingInput: TippingInput!): Tipping!
    editTipping(tippingInput: TippingInput!): Tipping!
    createTaxation(taxationInput: TaxationInput!): Taxation!
    editTaxation(taxationInput: TaxationInput!): Taxation!
    createRestaurant(restaurant: RestaurantInput!, owner: String!): Restaurant!
    createReview(review: ReviewInput!): Restaurant!
    deleteRestaurant(id: String!): Restaurant!
    editRestaurant(restaurant: RestaurantProfileInput!): Restaurant!
    createAddress(addressInput: AddressInput!): User!
    editAddress(addressInput: AddressInput!): User!
    deleteAddress(id: ID!): User!
    deleteBulkAddresses(ids: [ID!]!): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    createOffer(offer: OfferInput!): Offer!
    editOffer(offer: OfferInput!): Offer!
    deleteOffer(id: String!): Boolean
    createSection(section: SectionInput!): Section!
    editSection(section: SectionInput!): Section!
    deleteSection(id: String!): Boolean
    addRestaurantToOffer(id: String!, restaurant: String!): Offer
    selectAddress(id: String!): User!
    assignOrder(id: String): Order!
    muteRing(orderId: String): Boolean!
    updateRiderLocation(
      latitude: String!
      longitude: String!
      tracking: String
    ): Rider!
    restaurantLogin(username: String!, password: String!): RestaurantAuth!
    restaurantLogout(id: String!): Message
    createZone(zone: ZoneInput!): Zone!
    editZone(zone: ZoneInput!): Zone!
    deleteZone(id: String!): Message
    saveRestaurantToken(token: String, isEnabled: Boolean): Restaurant!
    notifyRiders(id: String!): Boolean!
    updateTimings(id: String!, openingTimes: [TimingsInput]): Restaurant!
    toggleAvailability: Restaurant!
    addFavourite(id: String!): User!
    sendNotificationUser(
      notificationTitle: String
      notificationBody: String!
    ): String!
    updateCommission(id: String!, commissionRate: Float!): Restaurant!
    updateDeliveryBoundsAndLocation(
      id: ID!
      bounds: [[[Float!]]]
      location: CoordinatesInput!
    ): RestaurantResponse!
    saveNotificationTokenWeb(token: String!): SaveNotificationTokenWebResponse!
    sendChatMessage(
      message: ChatMessageInput!
      orderId: ID!
    ): ChatMessageResponse!
    toggleMenuFood(id: ID!, restaurant: ID!, categoryId: ID!): Food!
    sendFormSubmission(
      formSubmissionInput: FormSubmissionInput!
    ): FormSubmissionResponse!
    abortOrder(id: String!, reason: String): Order!
    saveVerificationsToggle(
      configurationInput: VerificationConfigurationInput!
    ): Configuration!

    saveDemoConfiguration(
      configurationInput: DemoConfigurationInput!
    ): Configuration!
  }
  type Subscription {
    subscribePlaceOrder(restaurant: String!): SubscriptionOrders!
    orderStatusChanged(userId: String!): SubscriptionOrders!
    subscriptionAssignRider(riderId: String!): SubscriptionOrders!
    subscriptionRiderLocation(riderId: String!): Rider!
    subscriptionZoneOrders(zoneId: String!): Subscription_Zone_Orders!
    subscriptionOrder(id: String!): Order!
    subscriptionDispatcher: Order!
    subscriptionNewMessage(order: ID!): ChatMessageOutput!
  }
`
module.exports = typeDefs
