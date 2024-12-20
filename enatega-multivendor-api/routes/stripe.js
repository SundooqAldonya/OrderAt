const express = require('express')
const stripeObj = require('stripe')
const router = express.Router()
const Stripe = require('../models/stripe')
const User = require('../models/user')
const Order = require('../models/order')
const Configuration = require('../models/configuration')
const Restaurant = require('../models/restaurant')
const config = require('../config')
const Zone = require('../models/zone')
const { sendEmail } = require('../helpers/email')
const { sendNotification } = require('../helpers/utilities')
const { placeOrderTemplate } = require('../helpers/templates')
const { stripeCurrencies } = require('../helpers/currencies')
const { sendNotificationToRestaurant } = require('../helpers/notifications')
const {
  pubsub,
  publishToDashboard,
  publishToDispatcher,
  ORDER_STATUS_CHANGED
} = require('../helpers/pubsub')

const { transformOrder } = require('../graphql/resolvers/merge')
const bodyParser = require('body-parser')
const {
  sendNotificationToCustomerWeb
} = require('../helpers/firebase-web-notifications')

var stripe

var CURRENCY = 'USD'
var CURRENCY_SYMBOL = '$'
var CURRENCY_MULTIPLIER = 100
const initializeStripe = async() => {
  const configuration = await Configuration.findOne()

  stripe = stripeObj(configuration.secretKey)
  CURRENCY = configuration.currency
  CURRENCY_SYMBOL = configuration.currencySymbol
  CURRENCY_MULTIPLIER = stripeCurrencies.find(val => val.currency === CURRENCY)
    .multiplier
}

router.get('/success', async(req, res) => {
  console.log('success', req.query)
  try {
    const {
      session_id: stripeSessionId,
      platform = 'mobile',
      orderId
    } = req.query
    const order = await handleCompletedCheckoutSession(stripeSessionId, orderId)
    if (platform === 'web') {
      console.log('config.WEB_URL', config.WEB_URL)
      return res.redirect(
        config.WEB_URL +
          '#/' +
          config.ORDER_DETAIL_WEB_URL +
          order.id +
          '?clearCart=true'
      )
    } else {
      return res.render('stripeSuccess')
    }
  } catch (error) {
    console.log(error)
    return res.sendStatus(500)
  }
})
router.get('/failed', async(req, res) => {
  return res.render('stripeFailed')
})
router.get('/cancel', async(req, res) => {
  return res.render('stripeCancel')
})
router.post('/account', async(req, res) => {
  console.log('post.stripe/account', req.body)
  try {
    await initializeStripe()
    const { restaurantId } = req.body
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: {
        restaurantId
      }
    })
    // save account.id in restaurant data, use it later to update the status of account
    // const result = await Restaurant.updateOne({ _id: restaurantId }, { stripeAccountId: account.id, stripeDetailsSubmitted: false })
    // if (result.nModified > 0) {
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${config.SERVER_URL}${
        'stripe/account/refresh?accountId=' + account.id
      }`,
      return_url: `${config.SERVER_URL}${
        'stripe/account/return?accountId=' + account.id
      }`,
      type: 'account_onboarding'
    })
    res.send(accountLink)
    return
  } catch (error) {
    console.log('error', error)
  }
  res.sendStatus(400)
})
router.get('/account/refresh', async(req, res) => {
  console.log('get.account/refresh')
  try {
    const { accountId } = req.query
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url:
        config.SERVER_URL + 'stripe/account/refresh?accountId=' + accountId,
      return_url:
        config.SERVER_URL + 'stripe/account/return?accountId=' + accountId,
      type: 'account_onboarding'
    })
    console.log('accountLink', accountLink)
    // res.send(accountLink)
    res.redirect(accountLink.url)
    return
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})
router.get('/account/return', async(req, res) => {
  console.log('get.account/return')
  try {
    const { accountId } = req.query
    await initializeStripe()
    const account = await stripe.accounts.retrieve(accountId)
    if (account.details_submitted) {
      await Restaurant.updateOne(
        { _id: account.metadata.restaurantId },
        { stripeAccountId: accountId, stripeDetailsSubmitted: true }
      )
    }
    return res.redirect(config.DASHBOARD_URL + 'admin/payment')
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})
router.delete('/account', async(req, res) => {
  console.log('delete.account')
  try {
    const { accountId } = req.query
    await initializeStripe()
    const deleted = await stripe.accounts.del(accountId)
    res.send(deleted)
    return
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})
router.get('/account', async(req, res) => {
  console.log('get.account')
  try {
    const { accountId } = req.query
    await initializeStripe()
    const account = await stripe.accounts.retrieve(accountId)
    res.send(account)
    return
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})
router.get('/create-checkout-session', async(req, res) => {
  console.log('stripe/create-checkout-session', req.query)
  try {
    await initializeStripe()
    const { id: orderId, platform = 'mobile' } = req.query
    const line_items = []
    const stripeOrder = await Stripe.findOne({ orderId })
    const restaurant = await Restaurant.findById(stripeOrder.restaurant)
    stripeOrder.items.forEach(item => {
      line_items.push({
        name: `${item.title} ${item.variation.title}`,
        quantity: item.quantity,
        amount: parseInt(item.variation.price * CURRENCY_MULTIPLIER),
        currency: CURRENCY
      })
      item.addons.forEach(addon => {
        addon.options.map(option => {
          line_items.push({
            name: option.title,
            amount: parseInt(option.price * CURRENCY_MULTIPLIER),
            quantity: 1,
            currency: CURRENCY
          })
        })
      })
    })
    line_items.push({
      name: 'Delivery Fee',
      amount: parseInt(stripeOrder.deliveryCharges * CURRENCY_MULTIPLIER),
      currency: CURRENCY,
      quantity: 1
    })

    line_items.push({
      name: 'Tax',
      amount: parseInt(stripeOrder.taxationAmount * CURRENCY_MULTIPLIER),
      currency: CURRENCY,
      quantity: 1
    })

    line_items.push({
      name: 'Tip',
      amount: parseInt(stripeOrder.tipping * CURRENCY_MULTIPLIER),
      currency: CURRENCY,
      quantity: 1
    })

    const items_amount =
      stripeOrder.orderAmount -
      stripeOrder.deliveryCharges -
      stripeOrder.taxationAmount -
      stripeOrder.tipping
    const application_fee_amount =
      items_amount * (restaurant.commissionRate / 100) +
      stripeOrder.deliveryCharges +
      stripeOrder.taxationAmount +
      stripeOrder.tipping // save application fee percent in configuration
    let success_url
    if (platform === 'mobile') {
      success_url = `${config.SERVER_URL}stripe/success?session_id={CHECKOUT_SESSION_ID}&platform=${platform}`
    } else if (platform === 'web') {
      success_url = `${config.SERVER_URL}stripe/success?session_id={CHECKOUT_SESSION_ID}&platform=${platform}&orderId=${stripeOrder.orderId}`
    } else {
      success_url = `${config.SERVER_URL}stripe/success?session_id={CHECKOUT_SESSION_ID}`
    }
    const cancel_url =
      platform === 'web' ? config.WEB_URL : config.SERVER_URL + 'stripe/cancel'
    console.log('Restaurant ID: ' + restaurant.stripeAccountId)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      payment_intent_data: {
        application_fee_amount: parseInt(
          +application_fee_amount * CURRENCY_MULTIPLIER
        ),
        transfer_data: {
          destination: restaurant.stripeAccountId
        }
      },
      mode: 'payment',
      success_url,
      cancel_url
    })
    console.log('session', session)
    const result = await Stripe.updateOne(
      { orderId },
      { stripeSessionId: session.id }
    )
    console.log('result', result)
    if (result.modifiedCount > 0) {
      res.status(303).redirect(session.url)
      console.log(session.url)
      return
    } else {
      res.status(303).redirect(config.SERVER_URL + 'stripe/cancel')
      return
    }
  } catch (error) {
    console.log('Stripe error' + error)
    res.status(501).send(error)
  }
})
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async(req, res) => {
    const endpointSecret = config.STRIPE_WEBHOOK_ENDPOINT_SECRET
    const sig = req.headers['stripe-signature']

    let event

    // Verify webhook signature and extract the event.
    // See https://stripe.com/docs/webhooks/signatures for more information.
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('webhook checkout.session.completed', session.id)
      handleCompletedCheckoutSession(session.id)
    }
    if (event.type === 'account.updated') {
      console.log('account.updated', event.data.object)
      const account = event.data.object
      if (account.details_submitted) {
        await Restaurant.updateOne(
          { _id: account.metadata.restaurantId },
          { stripeAccountId: account.id, stripeDetailsSubmitted: true }
        )
      }
      console.log('webhook checkout.session.completed', account.id)
    }

    res.json({ received: true })
  }
)
const handleCompletedCheckoutSession = async(stripeSessionId, orderId) => {
  const stripeOrder = await Stripe.findOne({
    stripeSessionId
  })
  const existingOrder = await Order.findOne({ orderId: stripeOrder.orderId })
  if (existingOrder) {
    console.log('existing order')
    return existingOrder
  }
  const itemsFood = stripeOrder.items

  let price = 0
  itemsFood.forEach(async item => {
    let item_price = item.variation.price
    if (item.addons && item.addons.length) {
      const addonDetails = []
      item.addons.forEach(({ options }) => {
        // console.log("options:",options)
        options.forEach(option => {
          item_price = item_price + option.price
          // eslint-disable-next-line no-tabs
          addonDetails.push(`${option.title}	 ${CURRENCY_SYMBOL}${option.price}`)
        })
      })
    }
    price += item_price * item.quantity
    // eslint-disable-next-line no-tabs
    return `${item.quantity} x ${item.title}${
      item.variation.title ? `(${item.variation.title})` : ''
    } ${CURRENCY_SYMBOL}${item.variation.price}`
  })

  if (stripeOrder.coupon) {
    price = price - (stripeOrder.coupon.discount / 100) * price
  }
  const restaurant = await Restaurant.findById(stripeOrder.restaurant)
  const zone = await Zone.findOne({
    isActive: true,
    location: {
      $geoIntersects: { $geometry: restaurant.location }
    }
  })
  if (!zone) {
    throw new Error('Delivery zone not found')
  }
  const order = new Order({
    id: stripeOrder.id,
    zone: stripeOrder.zone,
    restaurant: stripeOrder.restaurant,
    user: stripeOrder.user,
    items: stripeOrder.items,
    deliveryAddress: stripeOrder.deliveryAddress, // dynamic address
    orderId: stripeOrder.orderId,
    orderStatus: 'PENDING',
    paymentMethod: 'STRIPE',
    paymentStatus: 'PAID',
    paidAmount: stripeOrder.orderAmount,
    orderAmount: stripeOrder.orderAmount,
    deliveryCharges: stripeOrder.isPickedUp ? 0 : stripeOrder.deliveryCharges,
    completionTime: new Date(Date.now() + restaurant.deliveryTime * 60 * 1000),
    tipping: stripeOrder.tipping,
    taxationAmount: stripeOrder.taxationAmount,
    orderDate: stripeOrder.orderDate,
    isPickedUp: stripeOrder.isPickedUp,
    expectedTime: stripeOrder.expectedTime,
    instructions: stripeOrder.instructions
  })
  console.log('before order.save')
  const result = await order.save()
  await stripeOrder.save()
  const placeOrder_template = await placeOrderTemplate([
    order.orderId,
    itemsFood,
    stripeOrder.isPickedUp
      ? restaurant.address
      : result.deliveryAddress.deliveryAddress,
    `${CURRENCY_SYMBOL} ${Number(price).toFixed(2)}`,
    `${CURRENCY_SYMBOL} ${result.tipping.toFixed(2)}`,
    `${CURRENCY_SYMBOL} ${result.taxationAmount.toFixed(2)}`,
    `${CURRENCY_SYMBOL} ${result.deliveryCharges.toFixed(2)}`,
    `${CURRENCY_SYMBOL} ${result.orderAmount.toFixed(2)}`,
    CURRENCY_SYMBOL
  ])

  const user = await User.findById(stripeOrder.user)
  sendEmail(user.email, 'Order Placed', '', placeOrder_template)
  sendNotificationToRestaurant(result.restaurant, result)
  const transformedOrder = await transformOrder(result)
  const orderStatusChanged = {
    userId: user.id,
    order: transformedOrder,
    origin: 'new'
  }
  pubsub.publish(ORDER_STATUS_CHANGED, {
    orderStatusChanged: orderStatusChanged
  })
  publishToDashboard(result.restaurant.toString(), transformedOrder, 'new')
  publishToDispatcher(transformedOrder)
  sendNotification(result.orderId)
  sendNotificationToCustomerWeb(
    user.notificationTokenWeb,
    'Order placed',
    `Order ID ${result.orderId}`
  )
  return result
}
module.exports = router
