const { Expo } = require('expo-server-sdk')
const User = require('../../models/user')
const { sendNotificationMobile } = require('../../helpers/utilities')

module.exports = {
  Mutation: {
    sendNotificationUser: async(_, args, { req, res }) => {
      console.log('sendNotificationUser')
      try {
        const users = await User.find({ isActive: true })
        const messages = []
        users.forEach(async(user, i) => {
          if (user.notificationToken && user.isOfferNotification) {
            if (Expo.isExpoPushToken(user.notificationToken)) {
              messages.push({
                to: user.notificationToken,
                sound: 'default',
                body: args.notificationBody,
                title: args.notificationTitle,
                channelId: 'default',
                data: {}
              })
            }
          }
        })
        await sendNotificationMobile(messages)
        console.log('Before Success')
        return 'Success'
      } catch (e) {
        console.log(e)
      }
    },
    saveNotificationTokenWeb: async(_, args, { req, res }) => {
      console.log('saveNotificationTokenWeb', args)
      try {
        if (!req.userId) throw new Error('Unauthenticated')
        const result = await User.updateOne(
          { _id: req.userId },
          { $set: { notificationTokenWeb: args.token } },
          { new: true, useFindAndModify: true }
        )
        return {
          success: result.modifiedCount > 0,
          message:
            result.modifiedCount > 0
              ? ''
              : 'an error occured while saving token'
        }
      } catch (error) {
        console.log(error)
        return {
          success: false,
          message: error.message
        }
      }
    }
  }
}
