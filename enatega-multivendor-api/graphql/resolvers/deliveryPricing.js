const DeliveryPrice = require('../../models/DeliveryPrice')
module.exports = {
  Query: {
    async allDeliveryPrices(_, args) {
      try {
        const deliveryPrices = await DeliveryPrice.find().populate([
          'originZone',
          'destinationZone'
        ])
        return deliveryPrices
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createDeliveryPrice(_, args) {
      try {
        const deliveryPrice = new DeliveryPrice()
        deliveryPrice.originZone = args.deliveryPriceInput.originZone
        deliveryPrice.destinationZone = args.deliveryPriceInput.destinationZone
        deliveryPrice.cost = args.deliveryPriceInput.cost
        await deliveryPrice.save()
        return { message: 'delivery_price_created' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async updateDeliveryPrice(_, args) {
      try {
        const deliveryPrice = await DeliveryPrice.findById(args.id)
        // deliveryPrice.originZone = args.deliveryPriceInput.originZone
        // deliveryPrice.destinationZone = args.deliveryPriceInput.destinationZone
        deliveryPrice.cost = args.cost
        await deliveryPrice.save()
        return { message: 'delivery_price_updated' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async removeDeliveryPrice(_, args) {
      try {
        const price = await DeliveryPrice.findById(args.id)
        await price.deleteOne()
        return { message: 'removed_delivery_price' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
