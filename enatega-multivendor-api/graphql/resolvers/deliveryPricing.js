const DeliveryPrice = require('../../models/DeliveryPrice')
module.exports = {
  Query: {
    async allDeliveryPrices(_, args) {
      try {
        const deliveryPrices = await DeliveryPrice.find()
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
    }
  }
}
