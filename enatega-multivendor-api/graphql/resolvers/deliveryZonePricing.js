const DeliveryPriceV2 = require('../../models/deliveryPriceV2')

module.exports = {
  Query: {},
  Mutation: {
    async createZonePricing(_, { input }) {
      console.log('createZonePricing', { input })
      try {
        const ZonePricing = await DeliveryPriceV2.create({
          originZone: input.originZone,
          destinationZone: input.destinationZone,
          baseFare: input.pricingRule.baseFare,
          perKmRate: input.pricingRule.perKmRate,
          surgeMultiplier: input.pricingRule.surgeMultiplier,
          minFare: input.pricingRule.minFare
        })
        return { message: 'create_zone_pricing_successfully' }
      } catch (err) {
        throw err
      }
    }
  }
}
