const Category = require('../../models/category')
const Restaurant = require('../../models/restaurant')
const { transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    categories: async () => {
      console.log('categories')
      try {
        const categories = await Category.find()
        // const categories = [{ _id: '1', title: 'category' }]
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
        console.log(args.category)
        const category = new Category({
          title: args.category.title
        })
        // await category.save()
        const restaurant = await Restaurant.findOne({
          _id: args.category.restaurant
        })
        restaurant.categories.push(category)
        await restaurant.save()

        return transformRestaurant(restaurant)
      } catch (err) {
        throw err
      }
    },
    editCategory: async (_, args, context) => {
      console.log('editCategory')
      try {
        const restaurant = await Restaurant.findOne({
          _id: args.category.restaurant
        })
        restaurant.categories.id(args.category._id).set({
          title: args.category.title
        })
        await restaurant.save()

        return transformRestaurant(restaurant)
      } catch (err) {
        throw err
      }
    },
    deleteCategory: async (_, { id, restaurant }, context) => {
      console.log('deleteCategory')
      try {
        const restaurants = await Restaurant.findOne({ _id: restaurant })
        restaurants.categories.id(id).remove()
        await restaurants.save()
        return transformRestaurant(restaurants)
      } catch (err) {
        throw err
      }
    }
  }
}