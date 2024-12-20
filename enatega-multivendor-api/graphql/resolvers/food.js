// const cons = require('consolidate')
const Food = require('../../models/food')
const Restaurant = require('../../models/restaurant')
const Variation = require('../../models/variation')
const { transformRestaurant } = require('./merge')

module.exports = {
  Mutation: {
    createFood: async(_, args, context) => {
      console.log('createFood')
      const restId = args.foodInput.restaurant
      const categoryId = args.foodInput.category
      const variations = await args.foodInput.variations.map(variation => {
        return new Variation(variation)
      })

      const food = await new Food({
        title: args.foodInput.title,
        variations: variations,
        description: args.foodInput.description,
        image: args.foodInput.image
      })

      try {
        await Restaurant.updateOne(
          { _id: restId, 'categories._id': categoryId },
          {
            $push: {
              'categories.$.foods': food
            }
          }
        )

        const latestRest = await Restaurant.findOne({ _id: restId })
        return await transformRestaurant(latestRest)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editFood: async(_, args, context) => {
      // console.log('args: ', args)
      const foodId = args.foodInput._id
      const restId = args.foodInput.restaurant
      const categoryId = args.foodInput.category
      const variations = args.foodInput.variations.map(
        variation => new Variation(variation)
      )
      try {
        const restaurant = await Restaurant.findOne({ _id: restId })
        const category = restaurant.categories.find(category =>
          category.foods.find(food => food.id === foodId)
        )
        if (!category._id.equals(categoryId)) {
          // const oldFood = category.foods.find(food => food.id === foodId)

          // remove from previous category
          const categoryIndex = restaurant.categories.findIndex(category =>
            category.foods.find(food => food.id === foodId)
          )
          restaurant.categories[categoryIndex].foods.id(foodId).remove()
          // console.log('Cat: ', JSON.stringify(restaurant))
          await restaurant.save()
          // add to new category
          const food = new Food({
            title: args.foodInput.title,
            variations: variations,
            description: args.foodInput.description,
            image: args.foodInput.image
          })
          await Restaurant.updateOne(
            { _id: restId, 'categories._id': categoryId },
            {
              $push: {
                'categories.$.foods': food
              }
            }
          )
          const latestRest = await Restaurant.findOne({ _id: restId })
          return transformRestaurant(latestRest)
        } else {
          const categoryFood = await restaurant.categories
            .id(categoryId)
            .foods.id(foodId)
          if (categoryFood) {
            restaurant.categories.id(categoryId).foods.id(foodId).set({
              title: args.foodInput.title,
              description: args.foodInput.description,
              image: args.foodInput.image,
              variations: variations
            })
            const result = await restaurant.save()
            return transformRestaurant(result)
          } else {
            throw Error('Category Food error')
          }
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteFood: async(_, { id, restaurant, categoryId }, context) => {
      console.log('deleteFood')
      try {
        const restaurants = await Restaurant.findOne({ _id: restaurant })
        restaurants.categories.id(categoryId).foods.id(id).remove()
        const result = await restaurants.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    }
  }
}
