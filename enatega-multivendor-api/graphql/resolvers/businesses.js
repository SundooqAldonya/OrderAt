const Business = require('../../models/business')

module.exports = {
  Query: {
    async getBusinesses(_, args) {
      try {
        const businesses = await Business.find()
        return businesses
      } catch (err) {
        throw new Error(err)
      }
    }
  },
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
    // async editBusiness(_, args) {
    //   console.log({ args })
    //   try {
    //     const business = await Business.findById(args.id)
    //     business.name = args.businessInput.name
    //     business.businessName = args.businessInput.businessName
    //     business.address = args.businessInput.address
    //     business.phone = args.businessInput.phone
    //     await business.save()
    //     return { message: 'edited_business' }
    //   } catch (err) {
    //     throw new Error(err)
    //   }
    // },
    // async removeBusiness(_, args) {
    //   console.log({ args })
    //   try {
    //     const business = await Business.findById(args.id)
    //     await business.deleteOne()
    //     return { message: 'removed_business' }
    //   } catch (err) {
    //     throw new Error(err)
    //   }
    // }
  }
}
