// const cons = require('consolidate')
const {
  cloudinaryClient,
  uploadFoodImage,
  uploadFoodImage2
} = require('../../helpers/cloudinary')
const Food = require('../../models/food')
const Restaurant = require('../../models/restaurant')
const Variation = require('../../models/variation')
const { transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    async foodListByRestaurant(_, args, context) {
      console.log({ argsFood: args })
      try {
        const foodList = await Food.find({ restaurant: args.id }).populate(
          'category'
        )
        console.log({ foodList })
        return foodList
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createFood: async (_, args, context) => {
      console.log('createFood')
      console.log({ args })
      try {
        const createReadStream = await args?.foodInput?.file?.file
          ?.createReadStream

        // const variations = await args.foodInput.variations.map(variation => {
        //   return new Variation(variation)
        // })

        const food = new Food({
          title: args.foodInput.title,
          description: args.foodInput.description,
          restaurant: args.foodInput.restaurant,
          category: args.foodInput.category
        })
        // await uploadFoodImage({
        //   id: food._id,
        //   file: args.foodInput.file
        // })
        console.log({ food })
        await food.save()
        return food
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editFood: async (_, args, context) => {
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

    // async uploadFoodImage(_, { id, file }) {
    //   console.log({ file })
    //   try {
    //     const {
    //       createReadStream,
    //       filename,
    //       mimetype,
    //       encoding
    //     } = await file.file
    //     const stream = createReadStream()

    //     const image = await cloudinary.uploader.upload_stream(
    //       {
    //         resource_type: 'auto'
    //       },
    //       async (error, result) => {
    //         if (error) {
    //           throw new Error('Upload failed')
    //         }
    //         console.log({ image: result.secure_url })
    //         const food = await Food.findById(id)
    //         console.log({ food })
    //         food.image = result.secure_url
    //         await food.save()
    //         return result.secure_url // Return the URL of the uploaded image
    //       }
    //     )

    //     stream.pipe(image)
    //     // console.log({ image: image })
    //     return { message: 'uploaded' }
    //   } catch (err) {
    //     throw err
    //   }
    // },
    deleteFood: async (_, { id, restaurant, categoryId }, context) => {
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
