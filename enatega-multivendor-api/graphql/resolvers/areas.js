const Area = require('../../models/area')
module.exports = {
  Query: {
    async areas(_, args, { req, res }) {
      try {
        const areas = await Area.find().populate('city')
        return areas
      } catch (err) {
        throw new Error('Something went wrong')
      }
    }
  },
  Mutation: {
    async createArea(_, args) {
      console.log({ createAreaArgs: args })
      try {
        await Area.create({ ...args.areaInput })
        return { message: 'Created the area' }
      } catch (err) {
        console.log({ err })
        throw new Error('Something went wrong!')
      }
    }
  }
}
