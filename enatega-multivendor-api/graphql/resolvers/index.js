const authResolver = require('./auth')
const foodResolver = require('./food')
const orderResolver = require('./order')
const categoryResolver = require('./category')
const configurationResolver = require('./configuration')
const riderResolver = require('./rider')
const optionResolver = require('./option')
const addonResolver = require('./addon')
const couponResolver = require('./coupon')
const dashboardResolver = require('./dashboard')
const restaurantResolver = require('./restaurant')
const reviewResolver = require('./review')
const offerResolver = require('./offer')
const zoneResolver = require('./zone')
const addressResolver = require('./address')
const userResolver = require('./user')
const vendorResolver = require('./vendor')
const dispatchResolver = require('./dispatch')
const taxationResolver = require('./taxation')
const tippingResolver = require('./tipping')
const sectionResolver = require('./section')
const notificationMutation = require('./notification')
const earningsResolver = require('./earnings')
const withdrawRequestResolver = require('./withdrawRequest')
const chatResolver = require('./chat')
const countries = require('./countries')
const cuisine = require('./cuisine')
const banner = require('./banner')
const demo = require('./demo')
const food = require('./food')
const cities = require('./cities')
const areas = require('./areas')
const businesses = require('./businesses')
const ridersRegister = require('./ridersRegister')
const shopCategories = require('./shopCategories')
const DeliveryPricing = require('./deliveryPricing')
const deliveryZones = require('./deliveryZones')
const deliveryRequest = require('./deliveryRequest')
const businessCategory = require('./businessCategory')
const stock = require('./stock')
const contactus = require('./contactus')
const notifications = require('./notifications')
const xlsx = require('./xlsx')
const prepaidDeliveryPackage = require('./prepaidDeliveryPackage')
const dispatchOptions = require('./dispatchOptions')
const riderReviews = require('./riderReviews')

const rootResolver = {
  RestaurantCustomer: {
    ...restaurantResolver.RestaurantCustomer
  },
  Query: {
    ...dashboardResolver.Query,
    ...categoryResolver.Query,
    ...orderResolver.Query,
    ...configurationResolver.Query,
    ...riderResolver.Query,
    ...optionResolver.Query,
    ...addonResolver.Query,
    ...couponResolver.Query,
    ...restaurantResolver.Query,
    ...reviewResolver.Query,
    ...offerResolver.Query,
    ...zoneResolver.Query,
    ...userResolver.Query,
    ...vendorResolver.Query,
    ...dispatchResolver.Query,
    ...tippingResolver.Query,
    ...taxationResolver.Query,
    ...sectionResolver.Query,
    ...withdrawRequestResolver.Query,
    ...earningsResolver.Query,
    ...chatResolver.Query,
    ...countries.Query,
    ...cuisine.Query,
    ...banner.Query,
    ...demo.Query,
    ...food.Query,
    ...cities.Query,
    ...areas.Query,
    ...businesses.Query,
    ...ridersRegister.Query,
    ...shopCategories.Query,
    ...deliveryZones.Query,
    ...DeliveryPricing.Query,
    ...businessCategory.Query,
    ...stock.Query,
    ...contactus.Query,
    ...notifications.Query,
    ...xlsx.Query,
    ...prepaidDeliveryPackage.Query,
    ...dispatchOptions.Query,
    ...riderReviews.Query
  },
  Mutation: {
    ...dashboardResolver.Mutation,
    ...authResolver.Mutation,
    ...foodResolver.Mutation,
    ...orderResolver.Mutation,
    ...categoryResolver.Mutation,
    ...configurationResolver.Mutation,
    ...riderResolver.Mutation,
    ...optionResolver.Mutation,
    ...addonResolver.Mutation,
    ...couponResolver.Mutation,
    ...restaurantResolver.Mutation,
    ...reviewResolver.Mutation,
    ...offerResolver.Mutation,
    ...zoneResolver.Mutation,
    ...addressResolver.Mutation,
    ...userResolver.Mutation,
    ...vendorResolver.Mutation,
    ...dispatchResolver.Mutation,
    ...tippingResolver.Mutation,
    ...taxationResolver.Mutation,
    ...sectionResolver.Mutation,
    ...notificationMutation.Mutation,
    ...withdrawRequestResolver.Mutation,
    ...earningsResolver.Mutation,
    ...chatResolver.Mutation,
    ...cuisine.Mutation,
    ...banner.Mutation,
    ...demo.Mutation,
    ...cities.Mutation,
    ...areas.Mutation,
    ...businesses.Mutation,
    ...ridersRegister.Mutation,
    ...shopCategories.Mutation,
    ...deliveryZones.Mutation,
    ...DeliveryPricing.Mutation,
    ...deliveryRequest.Mutation,
    ...businessCategory.Mutation,
    ...stock.Mutation,
    ...contactus.Mutation,
    ...notifications.Mutation,
    ...xlsx.Mutation,
    ...prepaidDeliveryPackage.Mutation,
    ...dispatchOptions.Mutation,
    ...riderReviews.Mutation
  },
  Subscription: {
    ...orderResolver.Subscription,
    ...riderResolver.Subscription,
    ...dispatchResolver.Subscription,
    ...chatResolver.Subscription
  },
  RecipientItem: notifications.RecipientItem,
  CancelledBy: orderResolver.CancelledBy
}

module.exports = rootResolver
