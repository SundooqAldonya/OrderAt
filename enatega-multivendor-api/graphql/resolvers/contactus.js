const dateScalar = require('../../helpers/dateScalar')
const Contactus = require('../../models/contactus')

module.exports = {
  Date: dateScalar,
  Query: {
    async getAllContactus(_, args) {
      console.log('getAllContactus', { args })
      try {
        const allContactus = await Contactus.paginate(
          {},
          {
            page: args.page || 1,
            limit: 10,
            sort: { _id: -1 }
          }
        )
        console.log({ allContactus })
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
          phone: args.phone,
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
