const Category = require('../../models/category')
const Restaurant = require('../../models/restaurant')
const { transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    categoriesByRestaurant: async (_, args) => {
      console.log('categories')
      console.log({ args })
      try {
        const categories = await Category.find({
          restaurant: args.id
        })
        console.log({ categories })
        return categories
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createCategory: async (_, args, context) => {
      console.log('createCategory')
      try {
        console.log(args)
        const category = new Category({
          title: args.category.title,
          restaurant: args.category.restaurant
        })
        await category.save()
        return category
      } catch (err) {
        throw err
      }
    },
    editCategory: async (_, args, context) => {
      console.log('editCategory')
      console.log({ args })
      try {
        const category = await Category.findById(args.category._id)
        category.title = args.category.title
        await category.save()
        return category
      } catch (err) {
        throw err
      }
    },
    deleteCategory: async (_, { id }, context) => {
      console.log('deleteCategory')
      try {
        await Category.findByIdAndDelete(id)
        return { message: 'Removed category successfully!' }
      } catch (err) {
        throw err
      }
    }
  }
}
