const ShopCategory = require('../../models/shopCategory')

module.exports = {
  Query: {
    async getShopCategories(_, args) {
      try {
        const categories = await ShopCategory.find()
        return categories
      } catch (err) {
        throw new Error({ err })
      }
    }
  },
  Mutation: {
    async createShopCategory(_, args) {
      try {
        await ShopCategory.create({
          ...args.shopCategoryInput
        })
        return { message: 'shop_category_created' }
      } catch (err) {
        throw new Error({ err })
      }
    },

    async editShopCategory(_, args) {
      try {
        const category = await ShopCategory.findById(args.id)
        category.title = args.shopCategoryInput.title
        await category.save()
        return { message: 'shop_category_updated' }
      } catch (err) {
        throw new Error({ err })
      }
    },

    async removeShopCategory(_, args) {
      try {
        const category = await ShopCategory.findById(args.id)
        await category.deleteOne()
        return { message: 'shop_category_deleted' }
      } catch (err) {
        throw new Error({ err })
      }
    }
  }
}
