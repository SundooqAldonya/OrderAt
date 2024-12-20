const Offer = require('../../models/offer')
const { transformOffer } = require('./merge')
module.exports = {
  Query: {
    offers: async(_, args, context) => {
      console.log('Offers')
      try {
        const offers = await Offer.find({ isActive: true })
        return await offers.map(transformOffer)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createOffer: async(_, args, { req, res }) => {
      console.log('createOffer')
      try {
        const offer = new Offer({
          name: args.offer.name,
          tag: args.offer.tag,
          restaurants: args.offer.restaurants
        })
        const result = await offer.save()
        return transformOffer(result)
      } catch (err) {
        throw err
      }
    },
    editOffer: async(_, args, context) => {
      console.log('editOffer')
      try {
        const offer = await Offer.findById(args.offer._id)
        offer.name = args.offer.name
        offer.tag = args.offer.tag
        offer.restaurants = args.offer.restaurants
        const result = await offer.save()
        return transformOffer(result)
      } catch (error) {
        throw error
      }
    },
    deleteOffer: async(_, args, context) => {
      console.log('deleteOffer')
      try {
        const offer = await Offer.findById(args.id)
        offer.isActive = false
        await offer.save()
        return true
      } catch (error) {
        throw error
      }
    },
    addRestaurantToOffer: async(_, { id, restaurant }, { req, res }) => {
      console.log('addRestaurantToOffer')
      try {
        const offer = await Offer.findById(id)
        offer.restaurants.push(restaurant)
        const result = await offer.save()
        return transformOffer(result)
      } catch (err) {
        throw err
      }
    }
  }
}
