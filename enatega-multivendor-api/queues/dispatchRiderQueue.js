const Queue = require('bull')
const Order = require('../models/order')
const DispatchLog = require('../models/DispatchLog')
const Rider = require('../models/rider')
const rankRiders = require('../helpers/rankRiders')
const { sendNotificationToRiders } = require('../helpers/findRiders')
const DispatchRecipient = require('../models/DispatchRecipient')

const dispatchQueue = new Queue('dispatch', 'redis://127.0.0.1:6379')

dispatchQueue.process(async job => {
  console.log('started rider assignment process')
  const { orderId, attempt } = job.data
  const order = await Order.findById(orderId).populate('restaurant')
  console.log({ orderZoneId: order.zone })

  if (!order || order.rider) {
    console.log(`Order ${orderId} already assigned, skipping dispatch`)
    return
  }

  // Find already-notified riders for this order
  let log = await DispatchLog.findOne({ order: orderId })

  if (!log) {
    // First dispatch cycle → create fresh log
    log = await DispatchLog.create({
      order: orderId,
      zone: order.zone,
      currentCycle: 1,
      maxCycles: 3,
      status: 'in_progress',
      recipients: []
    })
  }

  console.log({ dispatchLog: log })

  const populatedLog = await log.populate({
    path: 'recipients',
    populate: { path: 'rider' }
  })

  console.log({ populatedLog })

  const mappedLogRider = populatedLog?.recipients?.map(item =>
    item.rider._id.toString()
  )

  console.log({ mappedLogRider })

  const alreadyNotified = mappedLogRider

  console.log({ alreadyNotified })

  // Get available riders in same zone
  const riders = await Rider.find({
    zone: order.zone,
    available: true,
    isActive: true,
    notificationToken: { $ne: null }
  })
  // console.log({ riders })

  // Rank and pick batch
  const ranked = await rankRiders({
    log,
    riders,
    alreadyNotifiedRiderIds: alreadyNotified,
    attempt
  })
  console.log({ rankedLength: ranked?.length })

  const firstAttempt = 1 // default 5

  const batchSize =
    attempt === 0 ? firstAttempt : attempt === 1 ? 10 : riders.length
  console.log({ batchSize })

  const selected = ranked.slice(0, batchSize)
  console.log({ selectedLength: selected?.length })

  if (!selected.length) {
    console.log(`No eligible riders for order ${orderId}`)
    return
  }

  // Send notifications
  await sendNotificationToRiders(order, selected)
  // await sendPushNotification(order.zone.toString(), order)

  // const recipientDocs = await DispatchRecipient.insertMany(
  //   selected.map(r => ({
  //     order: orderId,
  //     rider: r._id,
  //     order: orderId,
  //     status: 'pending'
  //   }))
  // )

  const ops = selected.map(r => ({
    updateOne: {
      filter: { rider: r._id, order: orderId },
      update: { $setOnInsert: { status: 'pending', cycle: attempt + 1 } },
      upsert: true
    }
  }))

  const result = await DispatchRecipient.bulkWrite(ops)
  console.log({ result })

  // Collect riderIds
  const riderIds = selected.map(r => r._id)

  // Fetch the actual recipient docs
  const recipients = await DispatchRecipient.find({
    rider: { $in: riderIds },
    order: orderId
  })

  console.log({ recipients })
  // Log
  await DispatchLog.updateOne(
    { order: orderId },
    {
      $inc: { currentCycle: 1 },
      $push: {
        recipients: { $each: recipients.map(d => d._id) }
      }
    },
    { upsert: true }
  )

  // Re-enqueue retry if not last attempt
  const freshOrder = await Order.findById(orderId)
  if (!freshOrder.rider && attempt + 1 < log.maxCycles) {
    await dispatchQueue.add({ orderId, attempt: attempt + 1 }, { delay: 30000 })
  }
})

module.exports = dispatchQueue
