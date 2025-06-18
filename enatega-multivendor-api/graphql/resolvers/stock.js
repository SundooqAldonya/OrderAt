const Stock = require('../../models/stock')

module.exports = {
  Query: {
    async getStockEnumValues(_, args) {
      try {
        const enumValues = await Stock.schema.path('unit').enumValues
        return enumValues
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {}
}
