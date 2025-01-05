const Addon = require('../../models/addon')
const Restaurant = require('../../models/restaurant')
const { transformAddon, transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    getAddonsByRestaurant: async (_, args) => {
      console.log('addons')
      console.log({ argsAddons: args })
      try {
        const addons = await Addon.find({ restaurant: args.id })

        return addons
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createAddons: async (_, args, context) => {
      console.log('createAddon')
      console.log({ argsCreateAddon: args.addonInput })
      try {
        const addonsInput = args.addonInput.map(addon => ({
          ...addon,
          restaurant: args.id
        }))
        const addons = await Addon.insertMany(addonsInput)
        return addons
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editAddon: async (_, args, context) => {
      console.log('editAddon')
      console.log({ addonInput: args.addonInput })
      try {
        const addon = await Addon.findById(args.id)
        console.log({ addon })
        addon.title = args.addonInput.title
        addon.description = args.addonInput.description
        addon.quantityMinimum = args.addonInput.quantityMinimum
        addon.quantityMaximum = args.addonInput.quantityMaximum
        addon.options = [...args.addonInput.options]
        await addon.save()
        return addon
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteAddon: async (_, { id }, context) => {
      console.log('deleteAddon')
      try {
        const addon = await Addon.findByIdAndDelete(id)
        console.log({ addon })
        return { message: 'Addon deleted successfully!' }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
