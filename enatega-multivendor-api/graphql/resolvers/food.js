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
        const foodList = await Food.find({ restaurant: args.id })
          .populate('category')
          .populate('variations')
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
      console.log({ createFoodArgs: args.foodInput.file })
      try {
        let variations
        if (args.foodInput.variations.length) {
          const variationsArr = args.foodInput.variations
          variations = await Variation.insertMany([...variationsArr])
        }
        const food = new Food({
          title: args.foodInput.title,
          description: args.foodInput.description,
          restaurant: args.foodInput.restaurant,
          category: args.foodInput.category,
          variations
        })
        if (args.foodInput.variations.length) {
          const variationsArr = args.foodInput.variations.map(item => {
            return { ...item, food: food._id }
          })
          variations = await Variation.insertMany([...variationsArr])
        }
        console.log({ foodInputFile: args.foodInput.file })
        if (
          args.foodInput.file.file &&
          args.foodInput.file.file['createReadStream']
        ) {
          await uploadFoodImage({
            id: food._id,
            file: args.foodInput.file
          })
        }
        await food.save()
        const newFood = await food.populate('category')
        console.log({ newFood })
        return newFood
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    async editFood(_, { foodInput }) {
      console.log({ foodInput: foodInput.variations })
      try {
        const food = await Food.findById(foodInput._id)
        food.title = foodInput.title
        food.description = foodInput.description
        food.category = foodInput.category
        if (foodInput.file.file && foodInput.file.file['createReadStream']) {
          await uploadFoodImage({
            id: food._id,
            file: foodInput.file
          })
        }
        if (foodInput.variations.length) {
          const variationsArr = foodInput.variations
          const existingVariations = await Variation.find({
            title: { $in: variationsArr.map(item => item.title) },
            food: foodInput._id
          })
          console.log({ existingVariations })
          const existingTitles = existingVariations.map(item => item.title)
          console.log({ existingTitles })
          const newVariations = variationsArr.filter(
            item => !existingTitles.includes(item.title)
          )
          console.log({ newVariations })
          // let insertedVariations
          if (newVariations.length) {
            const insertedVariations = await Variation.insertMany([
              ...newVariations
            ])
            food.variations = [...existingVariations, ...insertedVariations]
          }
        }
        await food.save()
        const newFood = await food.populate('category')
        return newFood
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    async deleteFood(_, args) {
      try {
        await Food.findByIdAndDelete(args.id)
        return { message: 'Food removed successfully!' }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
    // editFood: async (_, args, context) => {
    //   // console.log('args: ', args)
    //   const foodId = args.foodInput._id
    //   const restId = args.foodInput.restaurant
    //   const categoryId = args.foodInput.category
    //   const variations = args.foodInput.variations.map(
    //     variation => new Variation(variation)
    //   )
    //   try {
    //     const restaurant = await Restaurant.findOne({ _id: restId })
    //     const category = restaurant.categories.find(category =>
    //       category.foods.find(food => food.id === foodId)
    //     )
    //     if (!category._id.equals(categoryId)) {
    //       // const oldFood = category.foods.find(food => food.id === foodId)

    //       // remove from previous category
    //       const categoryIndex = restaurant.categories.findIndex(category =>
    //         category.foods.find(food => food.id === foodId)
    //       )
    //       restaurant.categories[categoryIndex].foods.id(foodId).remove()
    //       // console.log('Cat: ', JSON.stringify(restaurant))
    //       await restaurant.save()
    //       // add to new category
    //       const food = new Food({
    //         title: args.foodInput.title,
    //         variations: variations,
    //         description: args.foodInput.description,
    //         image: args.foodInput.image
    //       })
    //       await Restaurant.updateOne(
    //         { _id: restId, 'categories._id': categoryId },
    //         {
    //           $push: {
    //             'categories.$.foods': food
    //           }
    //         }
    //       )
    //       const latestRest = await Restaurant.findOne({ _id: restId })
    //       return transformRestaurant(latestRest)
    //     } else {
    //       const categoryFood = await restaurant.categories
    //         .id(categoryId)
    //         .foods.id(foodId)
    //       if (categoryFood) {
    //         restaurant.categories.id(categoryId).foods.id(foodId).set({
    //           title: args.foodInput.title,
    //           description: args.foodInput.description,
    //           image: args.foodInput.image,
    //           variations: variations
    //         })
    //         const result = await restaurant.save()
    //         return transformRestaurant(result)
    //       } else {
    //         throw Error('Category Food error')
    //       }
    //     }
    //   } catch (err) {
    //     console.log(err)
    //     throw err
    //   }
    // },

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
    // deleteFood: async (_, { id, restaurant, categoryId }, context) => {
    //   console.log('deleteFood')
    //   try {
    //     const restaurants = await Restaurant.findOne({ _id: restaurant })
    //     restaurants.categories.id(categoryId).foods.id(id).remove()
    //     const result = await restaurants.save()
    //     return transformRestaurant(result)
    //   } catch (err) {
    //     throw err
    //   }
    // }
  }
}
