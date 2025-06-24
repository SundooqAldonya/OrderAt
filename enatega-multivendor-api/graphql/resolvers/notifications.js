const dateScalar = require('../../helpers/dateScalar')
const Notification = require('../../models/notification')

module.exports = {
  Date: dateScalar,
  RecipientItem: {
    __resolveType(obj) {
      console.log('Type resolver received:', obj?.constructor?.modelName)
      if (obj.constructor?.modelName === 'Rider') return 'Rider'
      if (obj.constructor?.modelName === 'User') return 'User'
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
  Mutation: {}
}
