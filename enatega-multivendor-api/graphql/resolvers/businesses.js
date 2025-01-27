const Business = require('../../models/business')

module.exports = {
  Mutation: {
    async createBusiness(_, args) {
      console.log({ args })
      try {
        const business = new Business({ ...args.businessInput })
        await business.save()
        return { message: 'created_business' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
