const BusinessCategory = require('../../models/BusinessCategory')
const uploadBusinessCategoryImage = require('../../helpers/cloudinary')

module.exports = {
  Query: {
    async getBusinessCategories(_, args) {
      try {
        const businessCategories = await BusinessCategory.find().sort({
          _id: -1
        })
        return businessCategories
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createBusinessCategory(_, args) {
      try {
        const businessCategory = await BusinessCategory.create({
          name: args.input.name,
          description: args.input.description
        })
        if (args.input.file.file && args.input.file.file['createReadStream']) {
          await uploadBusinessCategoryImage({
            id: businessCategory._id,
            file: args.input.file
          })
        }
        return { message: 'created_business_category_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async editBusinessCategory(_, args) {
      try {
        const businessCategory = await BusinessCategory.findById(args.id)
        businessCategory.title = args.input.title
        businessCategory.description = args.input.description
        if (args.input.file.file && args.input.file.file['createReadStream']) {
          await uploadBusinessCategoryImage({
            id: businessCategory._id,
            file: args.input.file
          })
        }
        return { message: 'updated_business_category_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async removeBusinessCategory(_, args) {
      try {
        const businessCategory = await BusinessCategory.findById(args.id)
        await businessCategory.deleteOne()
        return { message: 'removed_business_category_successfully' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
