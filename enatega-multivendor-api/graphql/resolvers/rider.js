const { withFilter } = require('graphql-subscriptions')
const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Point = require('../../models/point')
const User = require('../../models/user')
const Area = require('../../models/area')
const Zone = require('../../models/zone')
const Restaurant = require('../../models/restaurant')
const { transformOrder, transformRider } = require('../resolvers/merge')
const {
  pubsub,
  publishRiderLocation,
  RIDER_LOCATION,
  ZONE_ORDER,
  publishOrder
} = require('../../helpers/pubsub')
const { sendNotificationToUser } = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const { order_status } = require('../../helpers/enum')
const {
  notificationsQueue,
  JOB_TYPE,
  JOB_DELAY_DEFAULT
} = require('../../queue_old')
const { sendPushNotification } = require('../../helpers/findRiders')
const { uploadReceiptImage, uploadImage } = require('../../helpers/cloudinary')
const { GraphQLUpload } = require('graphql-upload')
const {
  sendCustomerNotifications
} = require('../../helpers/customerNotifications')
const dateScalar = require('../../helpers/dateScalar')
const mongoose = require('mongoose')

module.exports = {
  Date: dateScalar,
  Upload: GraphQLUpload,
  Subscription: {
    subscriptionRiderLocation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(RIDER_LOCATION),
        (payload, args) => {
          const riderId = payload.subscriptionRiderLocation._id
          return riderId === args.riderId
        }
      )
    },
    subscriptionZoneOrders: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ZONE_ORDER),
        (payload, args) => {
          const zoneId = payload.subscriptionZoneOrders.zoneId
          return zoneId === args.zoneId
        }
      )
    }
  },
  Query: {
    async searchRiders(_, { search }) {
      console.log('searchRiders', search)
      try {
        const riders = await Rider.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).limit(10)
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    riders: async () => {
      console.log('riders')
      try {
        const riders = await Rider.find()
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    rider: async (_, args, { req }) => {
      console.log('args', args)
      console.log('rider1111', args.id, req.userId, req.isAuth)
      console.log('rider', args.id, req.userId, req.isAuth)
      try {
        const userId = args.id || req.userId
        if (!userId) {
          throw new Error('Unauthenticated!')
        }
        const rider = await Rider.findById(userId)
        return transformRider(rider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    availableRiders: async _ => {
      console.log('riders')
      try {
        const riders = await Rider.find({ isActive: true, available: true })
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    assignedOrders: async (_, args, { req }) => {
      console.log('assignedOrders', args.id || req.userId)
      const userId = args.id || req.userId
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderOrders = await Order.find({
          rider: req.userId,
          $or: [{ orderStatus: 'ACCEPTED' }, { orderStatus: 'PICKED' }]
        }).sort({ createdAt: -1 })
        return riderOrders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    riderCompletedOrders: async (_, args, { req }) => {
      console.log('rider completed orders')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const orders = await Order.find({
          rider: req.userId,
          $or: [{ orderStatus: 'COMPLETED' }, { orderStatus: 'DELIVERED' }]
        }).sort({ createdAt: -1 })
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    unassignedOrdersByZone: async (_, args, { req }) => {
      console.log('unassignedOrders')

      try {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!')
        }

        const rider = await Rider.findById(req.userId)
        if (!rider) throw new Error('Rider does not exist')

        const orders = await Order.find({
          zone: rider.zone,
          orderStatus: 'ACCEPTED',
          rider: null
        }).sort({ createdAt: -1 })
        return orders.map(transformOrder)
      } catch (err) {
        throw err
      }
    },
    riderOrders: async (_, args, { req }) => {
      console.log('riderOrders', req.userId)
      try {
        const rider = await Rider.findById(req.userId)
        if (!rider) throw new Error('Rider does not exist')
        // const date = new Date()
        // date.setDate(date.getDate() - 1)
        const date = new Date()
        const twoDaysAgo = new Date()
        twoDaysAgo.setDate(date.getDate() - 2)
        twoDaysAgo.setHours(0, 0, 0, 0)
        const assignedOrders = await Order.find({
          rider: rider._id,
          // createdAt: {
          //   $gte: twoDaysAgo
          //   // $lte: date
          // },
          $or: [
            { orderStatus: 'ACCEPTED' },
            { orderStatus: 'PICKED' },
            { orderStatus: 'DELIVERED' },
            { orderStatus: 'ASSIGNED' }
          ]
        })
          .sort({ createdAt: -1 })
          .limit(10)
        const riderZone = await Zone.findById(rider.zone)
        // const restaurantsInZone = await Restaurant.find({
        //   location: {
        //     $geoIntersects: {
        //       $geometry: riderZone.location
        //     }
        //   }
        // }).select('_id')

        // const restaurantIds = restaurantsInZone.map(r => r._id)

        // 2. Find unassigned accepted orders from those restaurants
        // const orders = await Order.find({
        //   orderStatus: 'ACCEPTED',
        //   rider: null,
        //   // type: 'delivery_request',
        //   pickupLocation: {
        //     $geoWithin: {
        //       $geometry: riderZone.location
        //     }
        //   }
        // }).sort({ _id: -1 })

        console.log({ riderZone: rider.zone })
        const orders = await Order.find({
          zone: rider.zone,
          orderStatus: 'ACCEPTED',
          rider: null
        }).sort({ preparationTime: -1 })
        console.log({ ordersRider: orders ? orders[0] : null })
        console.log({
          assignedOrders: assignedOrders ? assignedOrders[0] : null
        })
        // await sendPushNotification(rider.notificationToken, orders[0])
        // const orders = await findOrdersWithinRadius(rider, 1)

        return [...orders, ...assignedOrders].map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },

    async getRidersLocation(_, args) {
      console.log('getRidersLocation', { args })
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const match = {
          available: true
          // lastUpdatedLocationDate: { $gte: twentyFourHoursAgo }
        }

        if (args.cityId) {
          match['city'] = new Types.ObjectId(args.cityId)
        }

        console.log({ match })

        const riders = await Rider.aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'orders', // collection name in MongoDB (lowercase + plural by default)
              localField: '_id',
              foreignField: 'rider',
              as: 'orders'
            }
          },
          {
            $addFields: {
              assignedOrdersCount: {
                $size: {
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: {
                      $in: ['$$order.orderStatus', ['ASSIGNED', 'PICKED']] // 👈 include both
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              orders: 0 // exclude full orders array if not needed
            }
          }
        ])

        return riders
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createRider: async (_, args) => {
      console.log('createRider')
      try {
        // check username, if already exists throw error
        const checkUsername = await Rider.countDocuments({
          username: args.riderInput.username
        })
        if (checkUsername) {
          throw new Error(
            'Username already associated with another rider account'
          )
        }
        const checkPhone = await Rider.countDocuments({
          phone: args.riderInput.phone
        })
        if (checkPhone) {
          throw new Error('Phone already associated with another rider account')
        }

        const rider = new Rider({
          name: args.riderInput.name,
          username: args.riderInput.username,
          password: args.riderInput.password,
          phone: args.riderInput.phone,
          available: args.riderInput.available,
          zone: args.riderInput.zone
        })

        if (args.riderInput.profileImage) {
          const profileUpload = await uploadImage({
            file: args.riderInput.profileImage
          })
          rider.profileImage.url = profileUpload.secure_url
          rider.profileImage.publicId = profileUpload.public_id
        }

        if (args.riderInput.nationalIdImage) {
          const nationalIdUpload = await uploadImage({
            file: args.riderInput.nationalIdImage
          })
          rider.nationalIdImage.url = nationalIdUpload.secure_url
          rider.nationalIdImage.publicId = nationalIdUpload.public_id
        }

        console.log('new rider :', rider)

        const result = await rider.save()
        console.log('result: ', result)
        return transformRider(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editRider: async (_, args) => {
      console.log('editRider', args)
      try {
        const checkUsername = await Rider.find({
          username: args.riderInput.username
        })
        if (
          checkUsername.length > 1 ||
          (checkUsername.length === 1 &&
            checkUsername[0].id !== args.riderInput._id)
        ) {
          throw new Error('Username associated with another rider account')
        }
        const checkPhone = await Rider.find({ phone: args.riderInput.phone })
        if (
          checkPhone.length > 1 ||
          (checkPhone.length === 1 && checkPhone[0].id !== args.riderInput._id)
        ) {
          throw new Error('Phone associated with another rider account')
        }

        const rider = await Rider.findOne({ _id: args.riderInput._id })

        rider.name = args.riderInput.name
        rider.password = args.riderInput.password
        rider.username = args.riderInput.username
        rider.phone = args.riderInput.phone
        rider.available = args.riderInput.available
        rider.zone = args.riderInput.zone
        rider.city = args.riderInput.city

        if (args.riderInput.profileImage) {
          const profileUpload = await uploadImage({
            file: args.riderInput.profileImage
          })
          rider.profileImage.url = profileUpload.secure_url
          rider.profileImage.publicId = profileUpload.public_id
        }

        if (args.riderInput.nationalIdImage) {
          const nationalIdUpload = await uploadImage({
            file: args.riderInput.nationalIdImage
          })
          rider.nationalIdImage.url = nationalIdUpload.secure_url
          rider.nationalIdImage.publicId = nationalIdUpload.public_id
        }

        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteRider: async (_, { id }) => {
      console.log('deleteRider')
      try {
        const rider = await Rider.findById(id)
        await rider.deleteOne()
        return { message: 'rider_removed' }
        // rider.isActive = false
        // const result = await rider.save()
        // return transformRider(result)
      } catch (err) {
        throw err
      }
    },

    toggleAvailablity: async (_, args, { req }) => {
      console.log('toggleAvailablity')
      const userId = args.id || req.userId
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const rider = await Rider.findById(userId)
        if (rider.isActive) {
          if (rider.available) {
            rider.endAvailabilityDate = new Date()
            rider.available = false
            rider.muted = true
          } else {
            rider.startAvailabilityDate = new Date()
            rider.available = true
            rider.muted = false
          }
        }
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    toggleActive: async (_, args, { req }) => {
      console.log('toggleActive')
      const userId = args.id || req.userId
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const rider = await Rider.findById(userId)
        if (rider.isActive) {
          rider.isActive = false
          rider.available = false
        } else {
          rider.isActive = true
          rider.available = true
        }
        const result = await rider.save()
        console.log({ result })
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    toggleMute: async (_, args, { req }) => {
      console.log('toggleMute')
      const userId = args.id || req.userId // if rider: get id from req, args otherwise
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const rider = await Rider.findById(userId)
        rider.muted = !rider.muted
        const result = await rider.save()
        console.log({ result })
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    updateOrderStatusRider: async (_, args, { req }) => {
      console.log('updateOrderStatusRider', args, req.userId)
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const order = await Order.findById(args.id)
        order.orderStatus = args.status
        if (args.status === 'PICKED') {
          console.log({ argsFile: args })
          if (args.file?.file && args.file?.file['createReadStream']) {
            await uploadReceiptImage({
              id: order._id,
              file: args.file
            })
          }
          order.completionTime = new Date(Date.now() + 15 * 60 * 1000)
          order.pickedAt = new Date()
        }
        if (args.status === 'DELIVERED') {
          notificationsQueue.add(
            JOB_TYPE.REVIEW_ORDER_NOTIFICATION,
            {
              type: 'REVIEW_ORDER',
              orderId: args.id,
              order,
              user: order.user,
              message: 'How was your order?'
            },
            { delay: JOB_DELAY_DEFAULT }
          )

          await Rider.updateMany(
            { assigned: { $in: [order.id] } },
            { $pull: { assigned: { $in: [order.id] } } }
          )
          // await Rider.updateOne(
          //   { _id: req.userId },
          //   { $push: { delivered: order.id } }
          // )
          order.deliveredAt = new Date()
        }
        const result = await order.save()
        const populatedOrder = await order.populate('restaurant')
        const user = await User.findById(order.user)
        const transformedOrder = await transformOrder(result)
        publishOrder(transformedOrder)
        // sendNotificationToUser(result.user, result)
        if (user) {
          if (user.isOrderNotification) {
            console.log('through condition')
            sendCustomerNotifications(user, populatedOrder)
          }
          sendNotificationToCustomerWeb(
            user.notificationTokenWeb,
            `Order status: ${result.orderStatus}`,
            `Order ID ${result.orderId}`
          )
        }
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    assignOrder: async (_, args, { req }) => {
      console.log('assignOrder', args.id, req.userId)
      const session = await mongoose.startSession()
      session.startTransaction()
      console.log('assignment session started for transaction')
      try {
        const order = await Order.findOneAndUpdate(
          {
            _id: args.id,
            $or: [{ rider: null }, { rider: { $exists: false } }]
          },
          {
            $set: {
              rider: req.userId,
              orderStatus: order_status[6],
              assignedAt: new Date(),
              isRiderRinged: false
            }
          },
          { new: true, session }
        )

        if (!order) {
          throw new Error('تم تعيين الطلب لشخص آخر!')
        }
        // check when last time assigned to order
        await Rider.findByIdAndUpdate(
          req.userId,
          { lastOrderAt: new Date() },
          { session }
        )
        await session.commitTransaction()
        session.endSession() // ending transaction

        const transformedOrder = await transformOrder(order)
        const populatedOrder = await order.populate('restaurant')
        // sendNotificationToUser(order.user.toString(), transformedOrder)
        const user = await User.findById(order.user)
        console.log({ user })
        if (user && user.isOrderNotification) {
          console.log('through condition')
          sendCustomerNotifications(user, populatedOrder)
        }
        publishOrder(transformedOrder)
        return transformedOrder
      } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
      }
    },
    updateRiderLocation: async (_, args, { req }) => {
      console.log('updateRiderLocation', args)
      if (!req.userId) {
        throw new Error('Unauthenticated!')
      }

      const rider = await Rider.findById(req.userId)
      if (!rider) {
        throw new Error('Unauthenticated!')
      }

      const location = new Point({
        coordinates: [args.longitude, args.latitude]
        // rider: '_id'
      })
      rider.location = location
      rider.lastUpdatedLocationDate = new Date()
      const result = await rider.save()

      publishRiderLocation({
        ...result._doc,
        _id: result.id,
        location: location
      })
      return transformRider(result)
    },

    async refreshFirebaseToken(_, args, { req }) {
      console.log('refreshFirebaseToken', { args })
      console.log({ userType: req.userType, userId: req.userId })
      if (!req.userId) throw new Error('unauthenticated')
      try {
        const rider = await Rider.findById(req.userId)
        rider.notificationToken = args.notificationToken
        await rider.save()
        console.log('rider notification has refreshed')
        return { message: 'Rider notification has refreshed' }
      } catch (err) {
        throw err
      }
    },

    async updateRiderStatus(_, args, { req }) {
      console.log('updateRiderStatus', { args })
      try {
        // let updateData = { available: args.available }
        // let updateData
        // if (args.available) {
        //   updateData['lastActiveAt'] = new Date() // update timestamp only when they come online
        // }

        await Rider.findByIdAndUpdate(req.userId, { lastActiveAt: new Date() })
        return { message: 'rider_availability_changed' }
      } catch (err) {
        throw err
      }
    }
  }
}
