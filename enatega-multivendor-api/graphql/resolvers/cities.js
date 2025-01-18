const City = require('../../models/city')
const DeliveryZone = require('../../models/deliveryZone')
const Zone = require('../../models/zone')
const { transformZone } = require('./merge')
module.exports = {
  Query: {
    async cities(_, args, { req, res }) {
      try {
        const cities = await City.find()
        return cities
      } catch (err) {
        throw new Error('Something went wrong', err)
      }
    }
  },
  Mutation: {
    async createCity(_, args) {
      console.log({ createCityArgs: args })
      try {
        await City.create({ ...args })
        return { message: 'Created the city' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    },

    async editCity(_, args) {
      console.log({ editCityArgs: args })
      try {
        const city = await City.findById(args.id)
        city.title = args.title
        await city.save()
        return { message: 'Edited the city' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    },

    async removeCity(_, args) {
      console.log({ argsRemoveCity: args })
      try {
        await City.findByIdAndDelete(args.id)
        return { message: 'City is being removed successfully!' }
      } catch (err) {
        throw new Error(`Something went wrong!: ${err}`)
      }
    }
  }
}
