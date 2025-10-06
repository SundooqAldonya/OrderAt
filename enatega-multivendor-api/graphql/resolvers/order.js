/* eslint-disable no-tabs */
const path = require('path')
const User = require('../../models/user')
// const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Item = require('../../models/item')
const Coupon = require('../../models/coupon')
const Point = require('../../models/point')
const Zone = require('../../models/zone')
const Restaurant = require('../../models/restaurant')
const Configuration = require('../../models/configuration')
const Paypal = require('../../models/paypal')
const Stripe = require('../../models/stripe')
const { transformOrder, transformReviews } = require('./merge')
const {
  payment_status,
  order_status,
  ORDER_STATUS
} = require('../../helpers/enum')
const { sendEmail } = require('../../helpers/email')
const {
  sendNotification,
  calculateDistance,
  calculateAmount
} = require('../../helpers/utilities')
const { placeOrderTemplate } = require('../../helpers/templates')
const { sendNotificationToRestaurant } = require('../../helpers/notifications')
const { withFilter } = require('graphql-subscriptions')
const {
  pubsub,
  publishToUser,
  publishToDashboard,
  publishOrder,
  publishToDispatcher,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  SUBSCRIPTION_ORDER
} = require('../../helpers/pubsub')
const { sendNotificationToUser } = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const Food = require('../../models/food')
const Addon = require('../../models/addon')
const Option = require('../../models/option')
const {
  sendRestaurantNotifications
} = require('../../helpers/restaurantNotifications')
const Area = require('../../models/area')
const DeliveryPrice = require('../../models/DeliveryPrice')
const DeliveryZone = require('../../models/deliveryZone')
const { acceptOrder } = require('../../helpers/restaurantHelpers')
const {
  normalizeAndValidatePhoneNumber
} = require('../../helpers/normalizePhone')
const dateScalar = require('../../helpers/dateScalar')
const Variation = require('../../models/variation')
const { GraphQLError } = require('graphql')
const PrepaidDeliveryPackage = require('../../models/prepaidDeliveryPackage')
const { acceptOrderHandler } = require('../../helpers/acceptOrderHandler')
const Owner = require('../../models/owner')

var DELIVERY_CHARGES = 0.0
module.exports = {
  Date: dateScalar,
  CancelledBy: {
    __resolveType(obj) {
      if (obj.constructor?.modelName === 'Owner') return 'Owner'
      if (obj.constructor?.modelName === 'User') return 'User'
      if (obj.constructor?.modelName === 'Restaurant') return 'Restaurant'
      return null
    }
  },
  Subscription: {
    subscribePlaceOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PLACE_ORDER),
        (payload, args, context) => {
          const restaurantId = payload.subscribePlaceOrder.restaurantId
          console.log('restaurantId', restaurantId)
          return restaurantId === args.restaurant
        }
      )
    },
    orderStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_STATUS_CHANGED),
        (payload, args, context) => {
          const userId = payload.orderStatusChanged.userId.toString()
          return userId === args.userId
        }
      )
    },
    subscriptionAssignRider: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ASSIGN_RIDER),
        (payload, args) => {
          const riderId = payload.subscriptionAssignRider.userId.toString()
          return riderId === args.riderId
        }
      )
    },
    subscriptionOrder: {
      subscribe: withFilter(
        (_, args, { pubsub }) => {
          const asyncIterator = pubsub.asyncIterator(SUBSCRIPTION_ORDER)
          // Override return() to remove listener when unsubscribed
          const originalReturn = asyncIterator.return
          asyncIterator.return = async () => {
            console.log(`Cleaning up subscription for ORDER ID: ${args.id}`)
            if (originalReturn) await originalReturn.call(asyncIterator)
          }

          return asyncIterator
        },
        (payload, args) => {
          if (!payload?.subscriptionOrder?._id) return false
          const orderId = payload?.subscriptionOrder?._id?.toString()
          return orderId === args.id
        }
      )
    }
  },
  Query: {
    order: async (_, args, { req, res }) => {
      console.log('order')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        console.log(order)
        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },
    singleOrder: async (_, args, { req }) => {
      try {
        console.log('singleOrder')
        if (!req.isAuth) {
          throw new Error('Unauthenticated!')
        }
        const order = await Order.findById(args.id)
          .populate({
            path: 'riderInteractions',
            populate: { path: 'rider' }
          })
          .populate('cancellation.cancelledBy')
        // .populate('restaurant')
        // .populate('user')
        console.log({ coupon: order?.coupon })
        if (!order) throw new Error('Order does not exist')
        return await transformOrder(order)
        // return order
      } catch (err) {
        throw err
      }
    },
    orderPaypal: async (_, args, { req, res }) => {
      console.log('orderPaypal')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const paypal = await Paypal.findById(args.id)
        console.log('PAYPAL: ', paypal)
        if (!paypal) throw new Error('Order does not exist')
        return transformOrder(paypal)
      } catch (err) {
        throw err
      }
    },
    orderStripe: async (_, args, { req, res }) => {
      console.log('orderStripe')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const stripe = await Stripe.findById(args.id)
        console.log('STRIPE: ', stripe)
        if (!stripe) throw new Error('Order does not exist')
        return transformOrder(stripe)
      } catch (err) {
        throw err
      }
    },
    orders: async (_, args, { req, res }) => {
      console.log('orders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .populate('restaurant')
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(50)
        const filterOrders = orders.filter(order => order.restaurant)
        // console.log({ filterOrders: orders[0] })
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },

    getOrdersByDateRange: async (_, args, context) => {
      try {
        const orders = await Order.find({
          restaurant: args.restaurant,
          createdAt: {
            $gte: new Date(args.startingDate),
            $lt: new Date(args.endingDate)
          }
        }).sort({ createdAt: -1 })

        const cashOnDeliveryOrders = orders.filter(
          order =>
            order.paymentMethod === 'COD' && order.orderStatus === 'DELIVERED'
        )

        const totalAmountCashOnDelivery = cashOnDeliveryOrders
          .reduce((total, order) => total + parseFloat(order.orderAmount), 0)
          .toFixed(2)

        const countCashOnDeliveryOrders = cashOnDeliveryOrders.length

        return {
          orders: orders.map(order => transformOrder(order)),
          totalAmountCashOnDelivery,
          countCashOnDeliveryOrders
        }
      } catch (err) {
        throw err
      }
    },
    ordersByRestId: async (_, args, context) => {
      console.log('restaurant orders')
      try {
        let orders = []
        if (args.search) {
          const search = new RegExp(
            // eslint-disable-next-line no-useless-escape
            args.search.replace(/[\\\[\]()+?.*]/g, c => '\\' + c),
            'i'
          )
          orders = await Order.find({
            restaurant: args.restaurant,
            orderId: search
          }).sort({ createdAt: -1 })
          return orders.map(order => {
            return transformOrder(order)
          })
        } else {
          orders = await Order.find({ restaurant: args.restaurant })
            .sort({ createdAt: -1 })
            .skip((args.page || 0) * args.rows)
            .limit(args.rows)
          return orders.map(order => {
            return transformOrder(order)
          })
        }
      } catch (err) {
        throw err
      }
    },
    getOrdersByAdmin: async (_, args, context) => {
      console.log('admin orders')
      try {
        const search = args.search
          ? new RegExp(
              args.search.replace(/[\\\[\]()+?.*]/g, c => '\\' + c),
              'i'
            )
          : null
        const query = search ? { orderId: search } : {}
        const result = await Order.paginate(query, {
          page: args?.page ? args.page : 1,
          limit: args?.limit ? args?.limit : 10,
          sort: {
            createdAt: -1
          },
          populate: [
            { path: 'rider' },
            { path: 'user' },
            {
              path: 'restaurant',
              populate: { path: 'city' } // 👈 populate city inside restaurant
            }
          ]
        })
        return {
          docs: result.docs.map(order => ({
            ...order.toObject(),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString()
          })),
          totalDocs: result.totalDocs,
          limit: result.limit,
          totalPages: result.totalPages,
          page: result.page,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPage: result.prevPage,
          nextPage: result.nextPage
        }
      } catch (err) {
        throw new Error(err)
      }
    },
    undeliveredOrders: async (_, args, { req, res }) => {
      console.log('undeliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [
            { orderStatus: 'PENDING' },
            { orderStatus: 'PICKED' },
            { orderStatus: 'ACCEPTED' }
          ]
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    deliveredOrders: async (_, args, { req, res }) => {
      console.log('deliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [{ orderStatus: 'DELIVERED' }, { orderStatus: 'COMPLETED' }]
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    allOrders: async (_, args, context) => {
      try {
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .skip((args.page || 0) * 10)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    pageCount: async (_, args, context) => {
      try {
        const orderCount = await Order.countDocuments({
          restaurant: args.restaurant
        })
        const pageCount = orderCount / 10
        return Math.ceil(pageCount)
      } catch (err) {
        throw err
      }
    },
    orderCount: async (_, args, context) => {
      try {
        const orderCount = await Order.find({
          isActive: true,
          restaurant: args.restautant
        }).countDocuments()
        return orderCount
      } catch (err) {
        throw err
      }
    },
    reviews: async (_, args, { req, res }) => {
      console.log('reviews')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
          .populate('review')
        return transformReviews(orders)
      } catch (err) {
        throw err
      }
    },
    getOrderStatuses: async (_, args, context) => {
      return order_status
    },
    getPaymentStatuses: async (_, args, context) => {
      return payment_status
    },

    async orderRidersInteractions(_, args) {
      try {
        const order = await Order.findById(args.id).populate({
          path: 'riderInteractions',
          populate: { path: 'rider' }
        })
        console.log({ orderRiderInteractions: order })
        if (!order?.riderInteractions?.length)
          throw new Error('no_rider_interactions')
        return order.riderInteractions
      } catch (err) {
        throw err
      }
    },
    async checkoutCalculatePrice(_, args) {
      console.log('checkoutCalculatePrice', { args: args.cart })
      const { cart } = args
      const { items, deliveryCharges, tax, code } = cart
      console.log({
        code,
        items
        // variation: items[0].variation,
        // addons: items[0].addons
      })
      try {
        let originalSubtotal = 0
        let originalTotal = 0
        let subtotal = 0
        let deliveryDiscount = 0
        let finalDeliveryCharges = args.isPickedUp ? 0 : deliveryCharges
        let subtotalDiscount = 0

        const food = await Food.find({ _id: { $in: [...items] } })
        console.log({ food })

        let coupon = null
        if (code) {
          coupon = await Coupon.findOne({ code }).lean()
        }

        for (const item of items) {
          const quantity = item.quantity || 1
          const variation = await Variation.findById(item.variation._id).lean()
          if (!variation) continue

          // let originalPrice = variation.price || 0
          // originalSubtotal += variation.price
          // // Add add-on prices
          // if (item.addons?.length > 0) {
          //   for (const addon of item.addons) {
          //     for (const optionSingle of addon.options) {
          //       const option = await Option.findById(optionSingle._id)
          //       console.log({ option })
          //       originalPrice += option?.price || 0
          //       originalSubtotal += option?.price || 0
          //     }
          //   }
          // }
          // originalSubtotal *= quantity

          let originalPrice = variation.price || 0

          // Add add-on prices
          if (item.addons?.length > 0) {
            for (const addon of item.addons) {
              for (const optionSingle of addon.options) {
                const option = await Option.findById(optionSingle._id)
                originalPrice += option?.price || 0
              }
            }
          }

          // ✅ Multiply after summing up the item’s full price
          const itemTotal = originalPrice * quantity

          // ✅ Add to total subtotal
          originalSubtotal += itemTotal

          console.log({ originalSubtotal })
          let discountedPrice = originalPrice

          // Apply item-level discount
          const isItemEligible =
            coupon?.rules?.applies_to?.includes('items') &&
            coupon?.target?.foods?.some(
              f => f.toString() === item._id.toString()
            )

          if (coupon && isItemEligible) {
            const {
              discount_type,
              discount_value,
              max_discount = 0
            } = coupon.rules
            if (discount_type === 'percent') {
              const discount = (discount_value / 100) * originalPrice
              const appliedDiscount =
                max_discount > 0 ? Math.min(discount, max_discount) : discount
              subtotalDiscount = appliedDiscount
              discountedPrice = originalPrice - appliedDiscount
            } else if (discount_type === 'flat') {
              const appliedDiscount =
                max_discount > 0
                  ? Math.min(discount_value, max_discount)
                  : discount_value
              subtotalDiscount = appliedDiscount
              discountedPrice = originalPrice - appliedDiscount
            }
          }

          subtotal += discountedPrice * quantity
        }
        console.log({
          subtotal,
          coupon,
          applies_to: coupon?.rules?.applies_to[0]
        })
        // Apply subtotal-level discount
        if (coupon?.rules?.applies_to?.includes('subtotal')) {
          console.log('inside_subtotal')
          const { discount_type, discount_value, max_discount } = coupon.rules
          if (discount_type === 'percent') {
            console.log('inside_percent')
            const discount = (discount_value / 100) * subtotal
            const appliedDiscount = Math.min(discount, max_discount || discount)
            subtotalDiscount = appliedDiscount
            subtotal -= appliedDiscount
          } else if (discount_type === 'flat') {
            console.log('inside_flat')
            const appliedDiscount = Math.min(
              discount_value,
              max_discount || discount_value
            )
            console.log({ appliedDiscount })
            subtotalDiscount = appliedDiscount
            subtotal -= appliedDiscount
          }
        }

        // Apply delivery discount
        if (coupon?.rules?.applies_to?.includes('delivery')) {
          const { discount_type, discount_value, max_discount } = coupon.rules
          if (discount_type === 'percent') {
            const discount = (discount_value / 100) * finalDeliveryCharges
            deliveryDiscount = Math.min(discount, max_discount || discount)
          } else if (discount_type === 'flat') {
            deliveryDiscount = Math.min(
              discount_value,
              max_discount || discount_value
            )
          }
          finalDeliveryCharges -= deliveryDiscount
        }
        console.log({ subtotal })

        const calculatedTax = ((subtotal + finalDeliveryCharges) * tax) / 100
        console.log({ calculatedTax })
        const total = subtotal + finalDeliveryCharges + calculatedTax
        const originalTax = ((originalSubtotal + deliveryCharges) * tax) / 100
        console.log({ originalTax })
        originalTotal = originalSubtotal + deliveryCharges + originalTax
        console.log({ total, subtotalDiscount, originalTotal })

        return {
          originalSubtotal,
          subtotal,
          total,
          originalTotal,
          originalDeliveryCharges: deliveryCharges,
          finalDeliveryCharges,
          deliveryDiscount,
          subtotalDiscount,
          tax
        }
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    async newCheckoutPlaceOrder(_, args, { req }) {
      console.log('newCheckoutPlaceOrder', { args })
      try {
        const {
          phone,
          areaId,
          orderAmount,
          restaurantId,
          addressDetails,
          preparationTime,
          name,
          deliveryFee
        } = args.input

        const phoneNumber = normalizeAndValidatePhoneNumber(phone)
        console.log({ phoneNumber })
        if (!phoneNumber) throw new Error('invalid_number')
        let user = await User.findOne({
          phone: normalizeAndValidatePhoneNumber(phone)
        })
        // console.log({ user })
        if (user && !user.name && name) {
          user.name = name
          await user.save()
        }
        const area = await Area.findById(areaId).populate('location')
        // console.log({ areaId, area })
        let address = {}
        address['deliveryAddress'] = area.address
        address['details'] = addressDetails ? addressDetails : area.address
        address['label'] = area.title
        address['location'] = {
          type: 'Point',
          coordinates: [
            area.location.location.coordinates[0],
            area.location.location.coordinates[1]
          ]
        }
        delete address['latitude']
        delete address['longitude']

        if (!user) {
          user = new User({
            name: name ? name : 'N/A',
            phone: normalizeAndValidatePhoneNumber(phone),
            governate: 'N/A',
            address_free_text: address.details,
            addresses: address || [],
            email: '',
            userType: 'default',
            emailIsVerified: true,
            phoneIsVerified: false,
            isActive: true,
            area: area || null,
            firstTimeLogin: true
          })
          await user.save()
        }

        // console.log({ address })

        const restaurant = await Restaurant.findById(restaurantId)
        // Generate dynamic orderId
        const newOrderId = `${restaurant.orderPrefix}-${
          Number(restaurant.orderId) + 1
        }`
        restaurant.orderId = Number(restaurant.orderId) + 1
        await restaurant.save()

        const zone = await Zone.findOne({
          location: { $geoIntersects: { $geometry: restaurant.location } }
        })
        const latOrigin = +restaurant.location.coordinates[1]
        const lonOrigin = +restaurant.location.coordinates[0]

        const latDest = address['location']
          ? +address?.location.coordinates[1]
          : +area.location.location.coordinates[1]
        const longDest = address['location']
          ? +address?.location.coordinates[0]
          : +area.location.location.coordinates[0]

        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )

        console.log({ distance })

        let configuration = await Configuration.findOne()
        const costType = configuration.costType

        // get zone charges from delivery prices
        const originZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: restaurant.location.coordinates
              }
            }
          }
        })

        const destinationZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: address.location.coordinates
              }
            }
          }
        })

        console.log({ originZone, destinationZone })
        let deliveryPrice
        if (originZone && destinationZone) {
          deliveryPrice = await DeliveryPrice.findOne({
            $or: [
              {
                originZone: originZone._id,
                destinationZone: destinationZone._id
              },
              {
                originZone: destinationZone._id,
                destinationZone: originZone._id
              }
            ]
          })
        }

        console.log({ deliveryPrice })

        let amount
        if (deliveryPrice) {
          amount = deliveryPrice.cost
        } else {
          amount = calculateAmount(
            costType,
            configuration.deliveryRate,
            distance
          )
          console.log({ amount, distance })
        }

        let deliveryCharges = amount

        if (
          parseFloat(amount) <= configuration.minimumDeliveryFee ||
          distance <= 0.1 + Number.EPSILON
        ) {
          deliveryCharges = configuration.minimumDeliveryFee
        }

        // ===== CHECK PREPAID DELIVERY PACKAGE =====
        console.log({ restaurantId: req.restaurantId })
        if (restaurantId || req.restaurantId) {
          const prepaidPackage = await PrepaidDeliveryPackage.findOne({
            business: restaurantId || req.restaurantId,
            isActive: true,
            expiresAt: { $gte: new Date() },
            $expr: { $lt: ['$usedDeliveries', '$totalDeliveries'] }
          })

          if (
            prepaidPackage?.maxDeliveryAmount &&
            deliveryCharges <= prepaidPackage?.maxDeliveryAmount
          ) {
            deliveryCharges = 0 // Delivery is free with prepaid package
            prepaidPackage.usedDeliveries += 1
            await prepaidPackage.save()
            console.log('✅ Used prepaid delivery package.')
            console.log('✅ Prepaid package found. Delivery is free.')
          }
        }

        let taxationAmount = 0
        const taxRate = restaurant.tax / 100 || 0
        taxationAmount = (orderAmount + deliveryCharges) * taxRate
        let tipping = 0
        let totalOrderAmount = 0
        if (orderAmount) {
          totalOrderAmount =
            orderAmount + deliveryCharges + taxationAmount + tipping
        }

        console.log({ zone: zone?._id })
        const pickupLocation = {
          type: 'Point',
          coordinates: [
            restaurant.location.coordinates[0],
            restaurant.location.coordinates[1]
          ]
        }

        console.log({ totalOrderAmount, deliveryCharges })

        const order = new Order({
          orderId: newOrderId,
          user: user._id,
          resId: restaurantId,
          orderStatus: 'PENDING',
          orderAmount: orderAmount ? totalOrderAmount : deliveryCharges,
          deliveryAddress: { ...address },
          items: [], // Add items logic if applicable
          isActive: true,
          tipping: 0, // Store tipping amount
          taxationAmount: 0, // Store taxation amount
          deliveryCharges: deliveryCharges, // Store delivery charges
          //totalAmount: totalOrderAmount, // The final total amount including all fees
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          restaurant: restaurantId, // Adding restaurant ID to order
          zone: zone._id, // Adding zone ID to order
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          ),
          preparationTime: preparationTime
            ? new Date(Date.now() + preparationTime * 60 * 1000)
            : new Date(Date.now() + 20 * 60 * 1000),
          pickupLocation
        })

        const savedOrder = await order.save()
        // await acceptOrder({
        //   orderId: savedOrder._id,
        //   restaurantId: savedOrder.resId,
        //   time: preparationTime
        // })
        return {
          _id: savedOrder._id,
          orderId: savedOrder.orderId,
          resId: savedOrder.resId,
          paidAmount: 0,
          orderStatus: savedOrder.orderStatus,
          paymentMethod: 'COD',
          isPickedUp: false,
          taxationAmount: 0,
          orderDate: savedOrder.createdAt,
          user: {
            _id: user._id,
            name: user.name,
            phone: user.phone
          },
          deliveryAddress: savedOrder.deliveryAddress,
          //orderAmount: savedOrder.orderAmount,
          orderAmount: savedOrder.totalOrderAmount,
          //totalAmount: savedOrder.totalAmount,
          paymentStatus: savedOrder.paymentStatus,
          deliveryCharges: savedOrder.deliveryCharges,
          taxationAmount: savedOrder.taxationAmount,
          tipping: 0, // Return tipping amount
          totalAmount: savedOrder.orderAmount, // Return total order amount including all fees
          isActive: savedOrder.isActive,
          createdAt: savedOrder.createdAt,
          updatedAt: savedOrder.updatedAt,
          restaurant: {
            _id: savedOrder.restaurant, // Returning restaurant details
            name: restaurant.name,
            address: restaurant.address
          },
          zone: {
            _id: savedOrder.zone, // Returning zone details
            name: zone.name,
            region: zone.region
          }
        }
      } catch (err) {
        throw new Error(err)
      }
    },

    CheckOutPlaceOrder: async (
      _,
      {
        userId,
        addressId,
        resId,
        orderAmount,
        isPickedUp,
        tipping,
        details,
        preparationTime
      },
      { req }
    ) => {
      console.log('Entered CheckOutPlaceOrder resolver')
      console.log({
        userId,
        addressId,
        resId,
        orderAmount,
        isPickedUp,
        tipping,
        details,
        preparationTime
      })
      try {
        // Fetch the user
        const user = await User.findById(userId)
        if (!user) throw new Error('User not found')

        // Find the delivery address
        let address, area
        if (user?.addresses?.length) {
          address = user.addresses.find(
            addr => addr._id.toString() === addressId
          )
          if (!address) throw new Error('Address not found')
        }
        if (user?.area) {
          const populatedUser = await user.populate({
            path: 'area',
            populate: { path: 'location' }
          })
          area = populatedUser.area
        }
        console.log(address, 'Address@1233333333')

        // Fetch the restaurant details
        const restaurant = await Restaurant.findOne({ _id: resId })

        if (!restaurant) throw new Error('Restaurant not found')

        // Fetch the zone details
        const zone = await Zone.findOne({
          location: { $geoIntersects: { $geometry: restaurant.location } }
        })
        if (!zone) throw new Error('Zone not found')

        // Generate dynamic orderId
        const newOrderId = `${restaurant.orderPrefix}-${
          Number(restaurant.orderId) + 1
        }`
        restaurant.orderId = Number(restaurant.orderId) + 1
        await restaurant.save()

        // get previous orderid from db
        let configuration = await Configuration.findOne()

        if (!configuration) {
          configuration = new Configuration()
          await configuration.save()
        }

        const latOrigin = +restaurant.location.coordinates[1]
        console.log(latOrigin, 'latOrigin#$')
        const lonOrigin = +restaurant.location.coordinates[0]
        console.log(lonOrigin, 'lonOrigin#$')

        const latDest = +address?.location.coordinates[1] || null
        console.log(latDest, 'latDest#$')
        const longDest = +address?.location.coordinates[0] || null
        console.log(longDest, 'longDest#$')
        console.log({ area })
        // const latDest = address
        //   ? +address?.location.coordinates[0]
        //   : area
        //   ? area.location.location.coordinates[0]
        //   : null
        // const longDest = address
        //   ? +address?.location.coordinates[1]
        //   : area
        //   ? area.location.location.coordinates[1]
        //   : null

        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )

        console.log(distance, 'Distance@1223333--=========killl')

        const costType = configuration.costType
        console.log({ costType })
        // let deliveryCharges= 0

        // if (costType === 'fixed') {
        //     // Calculate delivery charges (if it's not picked up, apply delivery charges)
        //   deliveryCharges = configuration.deliveryRate
        // } else {
        //   deliveryCharges = Math.ceil(distance) * configuration.deliveryRate
        // }

        // deliveryCharges = configuration.minimumDeliveryFee

        let amount = calculateAmount(
          costType,
          configuration.deliveryRate,
          distance
        )
        console.log({ amount })
        let deliveryCharges = amount

        if (parseFloat(amount) <= configuration.minimumDeliveryFee) {
          deliveryCharges = configuration.minimumDeliveryFee
        }

        // if(costType === 'fixed'){
        //   deliveryCharges = configuration.deliveryRate
        //   if(deliveryCharges <= configuration.minimumDeliveryFee){
        //     deliveryCharges = configuration.minimumDeliveryFee
        //   }
        // }
        // else{
        //    if((Math.ceil(distance) * configuration.deliveryRate) <= (configuration.minimumDeliveryFee)){
        //     deliveryCharges = configuration.minimumDeliveryFee
        // }
        // else{
        //   deliveryCharges = Math.ceil(distance) * configuration.deliveryRate

        // }
        // }

        // if(Math.ceil(distance) * configuration.deliveryRate < configuration.minimumDeliveryFee){
        //   deliveryCharges = Math.ceil(distance) * configuration.deliveryRate
        // }
        // else{
        //   deliveryCharges = configuration.minimumDeliveryFee
        // }

        console.log(deliveryCharges, 'deliveryCharges@###!@##121313')

        // if (!isPickedUp) {
        //   // Delivery charge might depend on the zone or the restaurant
        //   deliveryCharges = zone.deliveryCharge || 0; // Default delivery charge if not found in zone
        // }

        // Calculate taxation amount (This is typically a percentage of the order amount)
        let taxationAmount = 0
        const taxRate = restaurant.tax / 100 || 0 // Default 10% tax rate if not found
        console.log({ tax: restaurant.tax })
        taxationAmount = (orderAmount + deliveryCharges) * taxRate
        console.log({ taxationAmount })
        // Ensure tipping is not undefined or null, default to 0 if missing
        tipping = tipping || 0
        // Calculate total order amount including delivery charges, taxation, and tipping
        const totalOrderAmount =
          orderAmount + deliveryCharges + taxationAmount + tipping

        console.log(
          deliveryCharges,
          'deliveryCharges@1233337777777777777777777777'
        )
        console.log(totalOrderAmount, 'totalOrderAmount77777777777777777777')

        // Create and save the order
        const order = new Order({
          orderId: newOrderId,
          user: userId,
          resId: resId,
          orderStatus: 'PENDING',
          //orderAmount: orderAmount, // The original order amount (before additional fees)
          orderAmount: totalOrderAmount,
          deliveryAddress: address ? address : { ...area, details },
          items: [], // Add items logic if applicable
          isActive: true,
          tipping: tipping, // Store tipping amount
          taxationAmount: taxationAmount, // Store taxation amount
          deliveryCharges: deliveryCharges, // Store delivery charges
          //totalAmount: totalOrderAmount, // The final total amount including all fees
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          restaurant: restaurant._id, // Adding restaurant ID to order
          zone: zone._id, // Adding zone ID to order
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          ),
          preparationTime: preparationTime
            ? new Date(Date.now() + preparationTime * 60 * 1000)
            : new Date(Date.now() + 30 * 60 * 1000)
        })

        const savedOrder = await order.save()

        // Return the saved order with restaurant and zone details
        return {
          _id: savedOrder._id,
          orderId: savedOrder.orderId,
          resId: savedOrder.resId,
          paidAmount: 0,
          orderStatus: savedOrder.orderStatus,
          paymentMethod: 'COD',
          isPickedUp: false,
          taxationAmount: 0,
          orderDate: savedOrder.createdAt,
          user: {
            _id: user._id,
            name: user.name,
            phone: user.phone
          },
          deliveryAddress: savedOrder.deliveryAddress,
          //orderAmount: savedOrder.orderAmount,
          orderAmount: savedOrder.totalOrderAmount,
          //totalAmount: savedOrder.totalAmount,
          paymentStatus: savedOrder.paymentStatus,
          deliveryCharges: deliveryCharges,
          taxationAmount: taxationAmount,
          tipping: tipping, // Return tipping amount
          totalAmount: totalOrderAmount, // Return total order amount including all fees
          isActive: savedOrder.isActive,
          createdAt: savedOrder.createdAt,
          updatedAt: savedOrder.updatedAt,
          restaurant: {
            _id: savedOrder.restaurant, // Returning restaurant details
            name: restaurant.name,
            address: restaurant.address
          },
          zone: {
            _id: savedOrder.zone, // Returning zone details
            name: zone.name,
            region: zone.region
          }
        }
      } catch (err) {
        console.error('Error in CheckOutPlaceOrder:', err)
        throw err
      }
    },

    placeOrder: async (_, args, { req, res }) => {
      console.log('orderInput', { argsOrderInput: args.orderInput })
      console.log('placeOrder', { args: args })
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const restaurant = await Restaurant.findById(args.restaurant)

        const location = new Point({
          type: 'Point',
          coordinates: [+args.address.longitude, +args.address.latitude]
        })
        const checkZone = await Restaurant.findOne({
          _id: args.restaurant,
          deliveryBounds: { $geoIntersects: { $geometry: location } }
        })
        if (!checkZone && args.isPickedUp !== true) {
          throw new Error("Sorry! we can't deliver to your address.")
        }
        const zone = await Zone.findOne({
          isActive: true,
          location: {
            $geoIntersects: { $geometry: restaurant.location }
          }
        })
        if (!zone) {
          throw new Error('Delivery zone not found')
        }

        const foods = await Food.find({ restaurant }).populate('variations')
        const availableAddons = await Addon.find({ restaurant })
        const availableOptions = await Option.find({ restaurant })
        console.log({ foods })

        console.log({ argsOrder: args })
        console.log({ argsOrderInput: args.orderInput })

        const items = args.orderInput.map(item => {
          const food = foods.find(
            element => element._id.toString() === item.food
          )
          if (food.stock && food.stock === 'Out of Stock') {
            // throw new Error(`${food.title} out_of_stock`)
            throw new GraphQLError('Out of stock', {
              extensions: {
                code: 'out_of_stock',
                foodTitle: food.title
              }
            })
          }
          const variation = food.variations.find(
            v => v._id.toString() === item.variation
          )
          if (variation.stock && variation.stock === 'Out of Stock') {
            // throw new Error(`${variation.title} out_of_stock`)
            throw new GraphQLError('Out of stock', {
              extensions: {
                code: 'out_of_stock',
                variationTitle: variation?.title
              }
            })
          }
          const addonList = []
          item.addons.forEach((data, index) => {
            const selectedOptions = []
            data.options.forEach((option, inx) => {
              selectedOptions.push(
                availableOptions.find(op => op._id.toString() === option)
              )
            })
            const adds = availableAddons.find(
              addon => addon._id.toString() === data._id.toString()
            )

            addonList.push({
              ...adds._doc,
              options: selectedOptions
            })
          })
          return new Item({
            food: item.food,
            title: food.title,
            description: food.description,
            image: food.image,
            variation,
            addons: addonList,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          })
        })

        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('invalid request')
        }
        // get previous orderid from db
        let configuration = await Configuration.findOne()
        if (!configuration) {
          configuration = new Configuration()
          await configuration.save()
        }

        const orderid =
          restaurant.orderPrefix + '-' + (Number(restaurant.orderId) + 1)
        restaurant.orderId = Number(restaurant.orderId) + 1
        await restaurant.save()

        const latOrigin = +restaurant.location.coordinates[1]
        const lonOrigin = +restaurant.location.coordinates[0]
        const latDest = +args.address.latitude
        const longDest = +args.address.longitude

        // Calculate distance
        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )
        console.log(`Calculated Distance: ${distance} km`)

        const costType = configuration.costType

        // get zone charges from delivery prices
        const originZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: restaurant.location.coordinates
            }
          }
        })

        const destinationZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [longDest, latDest]
              }
            }
          }
        })

        console.log({ originZone, destinationZone })
        let deliveryPrice
        if (originZone && destinationZone) {
          deliveryPrice = await DeliveryPrice.findOne({
            $or: [
              {
                originZone: originZone._id,
                destinationZone: destinationZone._id
              },
              {
                originZone: destinationZone._id,
                destinationZone: originZone._id
              }
            ]
          })
        }

        console.log({ deliveryPrice })

        let amount
        if (deliveryPrice) {
          amount = deliveryPrice.cost
        } else {
          amount = calculateAmount(
            costType,
            configuration.deliveryRate,
            distance
          )
        }

        let DELIVERY_CHARGES = amount
        if (
          parseFloat(amount) <= configuration.minimumDeliveryFee ||
          distance <= 0.1 + Number.EPSILON
        ) {
          DELIVERY_CHARGES = configuration.minimumDeliveryFee
        }

        console.log(`Delivery Charges: ${DELIVERY_CHARGES}`)
        let price = 0.0

        let itemTotal = 0
        let deliveryDiscount = 0
        let finalDeliveryCharges = args.isPickedUp ? 0 : DELIVERY_CHARGES
        let originalTotalPrice = 0
        let coupon = null
        if (args.couponCode) {
          coupon = await Coupon.findOne({ code: args.couponCode }).lean()
        }

        for (const item of items) {
          const quantity = item.quantity || 1
          let originalPrice = item.variation.price

          if (item.addons?.length > 0) {
            for (const addon of item.addons) {
              for (const option of addon.options) {
                originalPrice += option.price
              }
            }
          }

          let discountedPrice = originalPrice
          originalTotalPrice = originalPrice * quantity
          console.log({ originalPrice, originalTotalPrice })

          const isEligible =
            coupon?.rules?.applies_to?.includes('items') &&
            coupon?.target?.foods?.some(
              food => food.toString() === item.food.toString()
            )

          if (coupon && coupon.rules && isEligible) {
            const { discount_type, discount_value, max_discount } = coupon.rules

            if (discount_type === 'percent') {
              const discount = (discount_value / 100) * originalPrice
              const appliedItemDiscount = Math.min(
                discount,
                max_discount || discount
              )
              discountedPrice = originalPrice - appliedItemDiscount
            } else if (discount_type === 'flat') {
              const appliedItemDiscount = Math.min(
                discount_value,
                max_discount || discount_value
              )
              discountedPrice = originalPrice - appliedItemDiscount
            }
          }
          itemTotal += discountedPrice * quantity
        }
        console.log({
          itemTotal,
          coupon,
          applies_to: coupon?.rules?.applies_to[0]
        })
        // Apply subtotal-level discount
        if (coupon?.rules?.applies_to?.includes('subtotal')) {
          console.log('inside_subtotal')
          const { discount_type, discount_value, max_discount } = coupon.rules
          if (discount_type === 'percent') {
            console.log('inside_percent')
            const discount = (discount_value / 100) * itemTotal
            const appliedDiscount = Math.min(discount, max_discount || discount)
            itemTotal -= appliedDiscount
          } else if (discount_type === 'flat') {
            console.log('inside_flat')
            const appliedDiscount = Math.min(
              discount_value,
              max_discount || discount_value
            )
            console.log({ appliedDiscount })
            itemTotal -= appliedDiscount
          }
        }

        console.log({ itemTotal })

        // Apply delivery discount
        if (coupon?.rules?.applies_to?.includes('delivery')) {
          const { discount_type, discount_value, max_discount } = coupon.rules
          if (discount_type === 'percent') {
            const discount = (discount_value / 100) * finalDeliveryCharges
            deliveryDiscount = Math.min(discount, max_discount || discount)
          } else if (discount_type === 'flat') {
            deliveryDiscount = Math.min(
              discount_value,
              max_discount || discount_value
            )
          }
          finalDeliveryCharges -= deliveryDiscount
        }

        const couponCode = await Coupon.findById(coupon?._id)
        if (couponCode) {
          if (!couponCode.tracking.user_usage) {
            couponCode.tracking.user_usage = new Map()
          }

          // Convert to Map if it's a plain object (can happen when using `.lean()` or from Mongo)
          if (!(couponCode.tracking.user_usage instanceof Map)) {
            couponCode.tracking.user_usage = new Map(
              Object.entries(couponCode.tracking.user_usage)
            )
          }
        }

        const previousCount =
          couponCode?.tracking.user_usage.get(req.userId) || 0
        console.log({ previousCount })
        if (couponCode) {
          couponCode.tracking.user_usage.set(req.userId, previousCount + 1)
          couponCode.tracking.usage_count += 1
          console.log({
            nextCount: couponCode.tracking.user_usage.get(req.userId),
            usage_count: couponCode.tracking.usage_count
          })
          await couponCode.save()
        }

        const pickupLocation = {
          type: 'Point',
          coordinates: [
            restaurant.location.coordinates[0],
            restaurant.location.coordinates[1]
          ]
        }

        // ===== CHECK PREPAID DELIVERY PACKAGE =====
        if (restaurant?._id) {
          const prepaidPackage = await PrepaidDeliveryPackage.findOne({
            business: restaurant._id,
            isActive: true,
            expiresAt: { $gte: new Date() },
            $expr: { $lt: ['$usedDeliveries', '$totalDeliveries'] }
          })
          let isPrepaid = false
          if (
            prepaidPackage?.maxDeliveryAmount &&
            finalDeliveryCharges <= prepaidPackage?.maxDeliveryAmount
          ) {
            isPrepaid = true
            finalDeliveryCharges = 0
            console.log('✅ Prepaid package found. Delivery is free.')
          }
          // reduce the amount of used prepaid deliveries
          if (isPrepaid) {
            prepaidPackage.usedDeliveries += 1
            await prepaidPackage.save()
            console.log('✅ Used prepaid delivery package.')
          }
        }

        const orderObj = {
          zone: zone._id,
          restaurant: args.restaurant,
          user: req.userId,
          items: items,
          deliveryAddress: {
            ...args.address,
            location: location
          },
          orderId: orderid,
          paidAmount: 0,
          orderStatus: 'PENDING',
          deliveryCharges: args.isPickedUp ? 0 : finalDeliveryCharges,
          originalDeliveryCharges:
            finalDeliveryCharges < DELIVERY_CHARGES ? DELIVERY_CHARGES : 0,
          tipping: args.tipping,
          taxationAmount: args.taxationAmount,
          orderDate: args.orderDate,
          isPickedUp: args.isPickedUp,
          orderAmount: (
            itemTotal +
            finalDeliveryCharges +
            args.taxationAmount +
            args.tipping
          ).toFixed(2),
          originalPrice: coupon
            ? originalTotalPrice +
              DELIVERY_CHARGES +
              args.taxationAmount +
              args.tipping
            : 0,
          originalSubtotal: coupon ? originalTotalPrice : 0,
          paymentStatus: payment_status[0],
          coupon: coupon,
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          ),
          instructions: args.instructions,
          pickupLocation
        }

        let result = null
        if (args.paymentMethod === 'COD') {
          const order = new Order(orderObj)
          result = await order.save()

          // const placeOrder_template = await placeOrderTemplate([
          //   result.orderId,
          //   items,
          //   args.isPickedUp
          //     ? restaurant.address
          //     : result.deliveryAddress.deliveryAddress,
          //   `${configuration.currencySymbol} ${Number(price).toFixed(2)}`,
          //   `${configuration.currencySymbol} ${order.tipping.toFixed(2)}`,
          //   `${configuration.currencySymbol} ${order.taxationAmount.toFixed(
          //     2
          //   )}`,
          //   `${configuration.currencySymbol} ${order.deliveryCharges.toFixed(
          //     2
          //   )}`,
          //   `${configuration.currencySymbol} ${order.orderAmount.toFixed(2)}`,
          //   configuration.currencySymbol
          // ])
          const transformedOrder = await transformOrder(result)

          publishToDashboard(
            order.restaurant.toString(),
            transformedOrder,
            'new'
          )
          publishToDispatcher(transformedOrder)
          // const attachment = path.join(
          //   __dirname,
          //   '../../public/assets/tempImages/enatega.png'
          // )
          // sendEmail(
          //   user.email,
          //   'Order Placed',
          //   '',
          //   placeOrder_template,
          //   attachment
          // )
          // sendNotification(result.orderId)
          // sendNotificationToCustomerWeb(
          //   user.notificationTokenWeb,
          //   'Order placed',
          //   `Order ID ${result.orderId}`
          // )
          await sendRestaurantNotifications(restaurant, transformedOrder)

          // sendNotificationToRestaurant(result.restaurant, result)
        } else if (args.paymentMethod === 'PAYPAL') {
          orderObj.paymentMethod = args.paymentMethod
          const paypal = new Paypal(orderObj)
          result = await paypal.save()
        } else if (args.paymentMethod === 'STRIPE') {
          console.log('stripe')
          orderObj.paymentMethod = args.paymentMethod
          const stripe = new Stripe(orderObj)
          result = await stripe.save()
          console.log(result)
        } else {
          throw new Error('Invalid Payment Method')
        }
        const orderResult = await transformOrder(result)
        return orderResult
      } catch (err) {
        throw err
      }
    },

    async adminCheckout(_, { input }, { req }) {
      console.log('adminCheckout', input)
      if (!req.user) {
        throw new Error('Unauthenticated!')
      }
      try {
        const { area, restaurant, time, rider, deliveryAmount } = input
        // const user = await Owner.findById(req.user._id)
        const user = await User.findOne({ phone: '+201000000000' })
        if (!user) {
          throw new Error('User not found')
        }
        const restaurantData = await Restaurant.findById(restaurant).populate(
          'location'
        )
        if (!restaurantData) {
          throw new Error('Restaurant not found')
        }
        const foundArea = await Area.findById(area).populate('location')
        console.log({ foundArea: foundArea.location.location })
        if (!foundArea) {
          throw new Error('Area not found')
        }
        const zone = await Zone.findOne({
          isActive: true,
          location: {
            $geoIntersects: {
              $geometry: restaurantData.location
            }
          }
        })

        const lastOrder = await Order.findOne({
          restaurant: restaurantData._id
        })
          .sort({ createdAt: -1 })
          .limit(1)
          .lean()

        const lastOrderId = lastOrder
          ? Number(lastOrder.orderId.split('-')[1])
          : null

        console.log({ lastOrderId })

        const orderId = lastOrderId
          ? `${restaurantData.orderPrefix}-${lastOrderId + 1}`
          : `${restaurantData.orderPrefix}-100`

        console.log({ orderId })

        const totalAmount = input.cost + deliveryAmount

        const orderObj = {
          zone: zone._id,
          restaurant,
          user: user._id,
          owner: req.userId,
          items: [],
          deliveryAddress: {
            address: foundArea.address,
            // location: foundArea.location.location,
            location: {
              type: 'Point',
              coordinates: [
                foundArea.location.location.coordinates[0],
                foundArea.location.location.coordinates[1]
              ]
            },
            deliveryAddress: foundArea.address,
            label: foundArea.title
          },
          orderId,
          paidAmount: 0,
          orderStatus: 'PENDING',
          deliveryCharges: deliveryAmount,
          finalDeliveryCharges: deliveryAmount,
          originalDeliveryCharges: deliveryAmount,
          tipping: 0,
          taxationAmount: 0,
          orderDate: new Date(),
          isPickedUp: false,
          orderAmount: totalAmount,
          originalPrice: 0,
          originalSubtotal: 0,
          paymentStatus: payment_status[0],
          coupon: null,
          completionTime: new Date(
            Date.now() + restaurantData.deliveryTime * 60 * 1000
          ),
          instructions: input.instructions,
          rider: rider || null,
          area
          // pickupLocation
        }
        console.log({ orderObj })
        const order = await Order.create({
          ...orderObj
        })
        acceptOrderHandler({
          user,
          restaurant: restaurantData,
          time,
          orderId: order._id,
          rider
        })
        return { message: 'created_request_delivery_successfully' }
      } catch (err) {
        throw err
      }
    },

    async adminOrderUpdate(_, { id, input }, { req }) {
      console.log('adminOrderUpdate', { id, input })
      if (!req.user) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(id)
        if (!order) {
          throw new Error('Order not found')
        }
        // edit rider
        if (input.rider) {
          order.rider = input.rider
          order.orderStatus = order_status[6]
          order.assignedAt = new Date()
          order.isRiderRinged = false
        }
        // edit time
        if (input.time) {
          order.preparationTime = new Date(Date.now() + input.time * 60 * 1000)
        }
        // edit area
        if (input.area) {
          const foundArea = await Area.findById(input.area).populate('location')
          if (!foundArea) {
            throw new Error('Area not found')
          }
          order.area = input.area

          order.deliveryAddress = {
            address: foundArea.address,
            location: {
              type: 'Point',
              coordinates: [
                foundArea.location.location.coordinates[0],
                foundArea.location.location.coordinates[1]
              ]
            },
            deliveryAddress: foundArea.address,
            label: foundArea.title
          }
        }
        if (input.deliveryAmount || input.deliveryAmount === 0) {
          order.deliveryCharges = input.deliveryAmount
          order.finalDeliveryCharges = input.deliveryAmount
          order.originalDeliveryCharges = input.deliveryAmount
          // order.orderAmount = input.deliveryAmount
          // order.originalPrice = input.deliveryAmount
          // order.originalSubtotal = input.deliveryAmount
          const totalAmount = input.cost + input.deliveryAmount
          order.orderAmount = totalAmount
        }
        await order.save()
        return { message: 'updated_successfully' }
      } catch (err) {
        throw err
      }
    },
    editOrder: async (_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const items = args.orderInput.map(async function (item) {
          const newItem = new Item({
            ...item
          })
          const result = await newItem.save()
          return result._id
        })
        const completed = await Promise.all(items)
        const order = await Order.findOne({ _id: args._id, user: req.userId })
        if (!order) {
          throw new Error('order does not exist')
        }
        order.items = completed
        const result = await order.save()
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },

    updateOrderStatus: async (_, args, context) => {
      console.log('updateOrderStatus')
      try {
        const order = await Order.findById(args.id)
        const restaurant = await Restaurant.findById(order.restaurant)
        if (args.status === 'ACCEPTED') {
          order.completionTime = new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          )
        }
        order.orderStatus = args.status
        order.reason = args.reason
        const result = await order.save()

        const transformedOrder = await transformOrder(result)
        const user = await User.findById(order.user)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user, result)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },

    updatePaymentStatus: async (_, args, context) => {
      console.log('updatePaymentStatus', args.id, args.status)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        order.paymentStatus = args.status
        order.paidAmount = args.status === 'PAID' ? order.orderAmount : 0.0
        const result = await order.save()
        return transformOrder(result)
      } catch (error) {
        throw error
      }
    },

    muteRing: async (_, args, { req }) => {
      try {
        const order = await Order.findOne({ orderId: args.orderId })
        if (!order) throw new Error('Order does not exist')
        order.isRinged = false
        await order.save()
        return true
      } catch (error) {
        throw error
      }
    },

    abortOrder: async (_, args, { req }) => {
      console.log('abortOrder', args)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      const order = await Order.findById(args.id)
      order.orderStatus = ORDER_STATUS.CANCELLED
      order.cancelledAt = new Date()
      order.cancellation.kind = 'User'
      order.cancellation.cancelledBy = req.userId
      if (args.reason) {
        order.cancellation.reason = args.reason
      }
      const result = await order.save()

      const transformedOrder = await transformOrder(result)
      publishOrder(transformedOrder)

      return transformedOrder
    },

    async orderSeenByRider(_, args) {
      console.log('orderSeenByRider', { args })
      try {
        await Order.updateOne(
          { _id: args.id, 'riderInteractions.rider': { $ne: args.riderId } },
          {
            $push: {
              riderInteractions: {
                rider: args.riderId,
                seenAt: new Date()
              }
            }
          }
        )
        return { message: 'seen' }
      } catch (err) {
        throw err
      }
    },
    async orderOpenedByRider(_, args) {
      console.log('orderOpenedByRider', { args })
      try {
        await Order.updateOne(
          { _id: args.id, 'riderInteractions.rider': args.riderId },
          {
            $set: {
              'riderInteractions.$.openedAt': new Date()
            }
          }
        )
        return { message: 'seen' }
      } catch (err) {
        throw err
      }
    }
  }
}
