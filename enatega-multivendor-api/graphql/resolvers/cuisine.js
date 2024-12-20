const Cuisine = require('../../models/cuisine')

module.exports = {
  Query: {
    cuisines: async() => {
      console.log('cuisines')
      try {
        const cuisines = await Cuisine.find({ isActive: true }).sort({
          createdAt: -1
        })
        return cuisines.map(cuisine => ({
          ...cuisine._doc,
          _id: cuisine.id
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createCuisine: async(_, args, context) => {
      console.log('createCuisine')
      try {
        const count = await Cuisine.countDocuments({
          name: args.cuisineInput.name,
          isActive: true
        })
        if (count > 0) throw new Error('Cuisine already exists')
        const cuisine = new Cuisine({
          name: args.cuisineInput.name,
          description: args.cuisineInput.description,
          image: args.cuisineInput.image,
          shopType: args.cuisineInput.shopType
        })
        const result = await cuisine.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editCuisine: async(_, args, context) => {
      console.log('editCuisine')
      try {
        const cuisine = await Cuisine.findById(args.cuisineInput._id)
        if (!cuisine) {
          throw new Error('cuisine does not exist')
        }
        cuisine.name = args.cuisineInput.name
        cuisine.description = args.cuisineInput.description
        cuisine.image = args.cuisineInput.image
        cuisine.shopType = args.cuisineInput.shopType
        const result = await cuisine.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteCuisine: async(_, args, context) => {
      console.log('deleteCuisine')
      try {
        const cuisine = await Cuisine.findById(args.id)
        cuisine.isActive = false
        const result = await cuisine.save()
        return result.id
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    cuisine: async(_, args, context) => {
      console.log('cuisine', args)
      try {
        const cuisine = await Cuisine.findOne({
          isActive: true,
          name: args.cuisine
        })
        if (cuisine) {
          return {
            ...cuisine._doc,
            _id: cuisine.id
          }
        } else {
          throw new Error('Cuisine not found')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
