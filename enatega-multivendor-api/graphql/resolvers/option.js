const Option = require('../../models/option')
const Restaurant = require('../../models/restaurant')
const { transformOption, transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    options: async (_, args) => {
      console.log('options', args)
      try {
        const options = await Option.find({
          restaurant: args.id
        })
        console.log({ options })
        return options
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createOptions: async (_, args, context) => {
      console.log('createOption')
      // console.log({ argsOptions: args })
      try {
        const optionsInput = args.optionInput.options.map(option => ({
          ...option,
          restaurant: args.id
        }))
        const options = await Option.insertMany(optionsInput)
        return options
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editOption: async (_, args, context) => {
      console.log('editOption')
      console.log(args.optionInput)
      try {
        const { options } = args.optionInput
        const option = await Option.findById(options._id)
        option.title = options.title
        option.description = options.description
        option.price = options.price
        await option.save()
        return { message: 'Option is updated!' }
        // const restaurant = await Restaurant.findById(
        //   args.optionInput.restaurant
        // )
        // restaurant.options.id(options._id).set({
        //   title: options.title,
        //   description: options.description,
        //   price: options.price
        // })
        // const result = await restaurant.save()
        // return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteOption: async (_, { id }, context) => {
      console.log('deleteOption')
      try {
        await Option.findByIdAndDelete(id)
        return { message: 'Removed option successfully!' }
        // const restaurants = await Restaurant.findById(restaurant)
        // restaurants.options.id(id).remove()
        // restaurants.addons = restaurants.addons.map(addon => {
        //   addon.options = addon.options.filter(option => option !== id)
        //   return addon
        // })

        // const result = await restaurants.save()
        // return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
