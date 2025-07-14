const BusinessCategory = require('../../models/BusinessCategory')
const { uploadImage } = require('../../helpers/cloudinary')

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
    },

    async getBusinessCategoriesCustomer(_, args) {
      try {
        const businessCategories = await BusinessCategory.find({
          isActive: true
        }).sort({
          order: 1
        })
        return businessCategories
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createBusinessCategory(_, args) {
      console.log('createBusinessCategory', { args })
      try {
        const businessCategory = new BusinessCategory({
          name: args.input.name,
          description: args.input.description,
          order: args.input.order
        })
        if (args.input.file?.file && args.input.file.file['createReadStream']) {
          const image = await uploadImage({
            file: args.input.file
          })
          businessCategory.image.url = image.secure_url
          businessCategory.image.publicId = image.public_id
          console.log({ businessCategory })
        }
        await businessCategory.save()
        return { message: 'created_business_category' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async editBusinessCategory(_, args) {
      try {
        const businessCategory = await BusinessCategory.findById(args.id)
        businessCategory.name = args.input.name
        businessCategory.description = args.input.description
        businessCategory.order = args.input.order
        if (
          args.input?.file?.file &&
          args.input.file.file['createReadStream']
        ) {
          const image = await uploadImage({
            file: args.input.file
          })
          businessCategory.image.url = image.secure_url
          businessCategory.image.publicId = image.public_id
        }
        await businessCategory.save()
        return { message: 'updated_business_category' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async changeActiveBusinessCategory(_, args) {
      try {
        const category = await BusinessCategory.findById(args.id)
        category.isActive = category.isActive ? false : true
        await category.save()
        return { message: 'updated_active' }
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
