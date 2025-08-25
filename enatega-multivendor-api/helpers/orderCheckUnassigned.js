const cron = require('node-cron')
const { sendSMS } = require('./sendSMS')
const Order = require('../models/order')
const Rider = require('../models/rider')
const Configuration = require('../models/configuration')

module.exports = {
  orderCheckUnassigned() {
    try {
      // Run every minute
      const TARGET_CITY_ID = '6789b2c2b37150d082341877' // كفر الشيخ
      // const TARGET_CITY_ID = '67d6a4e25919db84b9b59cab' // imbaba
      cron.schedule('* * * * *', async () => {
        const now = new Date()
        console.log('checking for unassigned orders')
        const orders = await Order.find({
          acceptedAt: { $ne: null },
          preparationTime: { $ne: null },
          rider: null,
          orderStatus: { $nin: ['DELIVERED', 'CANCELLED'] },
          notifiedUnassigned: { $ne: true }
        }).populate({
          path: 'restaurant',
          select: 'city name' // only get city from restaurant
        })

        // console.log({ orders })
        // console.log({ city: orders[0].restaurant.city })

        for (const order of orders) {
          const restaurant = order.restaurant

          // if (!restaurant || !restaurant.city) continue

          const cityId = restaurant.city.toString()

          if (cityId !== TARGET_CITY_ID) continue

          const expiration = order.preparationTime
          console.log('now is larger than expiration time? ', now >= expiration)
          if (now >= expiration) {
            const body = {
              username: 'w8pRT869',
              password: 'Oqo48lklp',
              sendername: 'Kayan',
              phone: '+201065258980',
              message: `⚠️ اوردرات - ${order.orderId}: لقد تجاوز الطلب وقت تحضيره ولا يزال غير مخصص لأي سائق.`
            }
            await sendSMS({
              body
            })

            order.notifiedUnassigned = true
            await order.save()
          }
        }
      })
    } catch (err) {
      throw err
    }
  },
  async checkRidersAvailability() {
    try {
      const config = await Configuration.findOne()
      const availabilityPeriod = config?.availabilityPeriod || 2 // fallback 2 hours
      cron.schedule('*/15 * * * *', async () => {
        const twoHoursAgo = new Date(
          Date.now() - availabilityPeriod * 60 * 60 * 1000
        )

        try {
          const result = await Rider.updateMany(
            {
              available: true,
              $or: [
                { lastActiveAt: { $lt: twoHoursAgo } },
                { lastActiveAt: null } // never used the app before
              ]
            },
            { $set: { available: false } }
          )
          console.log(`Idle riders set offline: ${result.modifiedCount}`)
        } catch (err) {
          console.error('Cron job error:', err)
        }
      })
    } catch (err) {
      throw err
    }
  }
}
