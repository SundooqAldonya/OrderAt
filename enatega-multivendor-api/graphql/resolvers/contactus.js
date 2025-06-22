const Contactus = require('../../models/contactus')

module.exports = {
  Query: {
    async getAllContactus(_, args) {
      try {
        const allContactus = await Contactus.find()
        return allContactus
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    async createContactus(_, args) {
      try {
        const contact = await Contactus.create({
          name: args.name,
          email: args.email,
          message: args.message
        })
        return { message: 'message_sent_successfully' }
      } catch (err) {
        throw err
      }
    },
    async markContactusResponded(_, args) {
      try {
        const contact = await Contactus.findById(args.id)
        contact.responded = true
        await contact.save()
        return { message: 'marked_as_responded' }
      } catch (err) {
        throw err
      }
    }
  }
}
