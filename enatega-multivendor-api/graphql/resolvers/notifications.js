const dateScalar = require('../../helpers/dateScalar')
const Notification = require('../../models/notification')

module.exports = {
  Date: dateScalar,
  RecipientItem: {
    __resolveType(obj) {
      if (obj.constructor?.modelName === 'Rider') return 'Rider'
      if (obj.constructor?.modelName === 'User') return 'User'
      if (obj.constructor?.modelName === 'Restaurant') return 'Restaurant'
      return null
    }
  },
  Query: {
    async getAllNotifications(_, args) {
      try {
        const notifications = await Notification.paginate(
          {},
          {
            page: args.page || 1,
            limit: 10,
            sort: { createdAt: -1 },
            populate: {
              path: 'recipients.item'
            }
          }
        )
        return notifications
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    async acknowledgeNotification(_, { notificationId }, { req }) {
      console.log('acknowledgeNotification', { notificationId })
      try {
        const userId = req.userId

        const notification = await Notification.findOneAndUpdate(
          {
            _id: notificationId,
            'recipients.item': userId
          },
          {
            $set: {
              'recipients.$.status': 'acknowledged',
              'recipients.$.lastAttempt': new Date()
            }
          },
          { new: true }
        )

        if (!notification)
          throw new Error('Notification not found or not authorized')

        return { message: 'notification_acknowledged' }
      } catch (err) {
        throw err
      }
    }
  }
}
