const PrepaidDeliveryPackage = require('../../models/prepaidDeliveryPackage')

module.exports = {
  Query: {
    async getPrepaidDeliveryPackages(_, args) {
      try {
        const packages = await PrepaidDeliveryPackage.find().populate(
          'business'
        )
        // console.log({
        //   packages: packages.length
        //     ? packages[0].remainingDeliveries
        //     : 'No packages found'
        // })
        return packages
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async createPrepaidDeliveryPackage(_, { input }) {
      try {
        const packageData = {
          business: input.business,
          totalDeliveries: input.totalDeliveries,
          usedDeliveries: input.usedDeliveries || 0,
          price: input.price,
          isActive: input.isActive,
          expiresAt: input.expiresAt,
          createdBy: input.createdBy,
          maxDeliveryAmount: input.maxDeliveryAmount
        }
        const newPackage = await PrepaidDeliveryPackage.create({
          ...packageData
        })
        console.log({ newPackage })
        return { message: 'Delivery package created successfully!' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async updatePrepaidDeliveryPackage(_, { id, input }) {
      try {
        const updatedPackage = await PrepaidDeliveryPackage.findByIdAndUpdate(
          id,
          {
            ...input,
            updatedAt: new Date()
          },
          { new: true }
        )
      } catch (err) {
        throw err
      }
    },
    async updateActivePrepaidDeliveryPackage(_, { id, input }) {
      try {
        const updatedPackage = await PrepaidDeliveryPackage.findById(id)
        if (updatedPackage.isActive) {
          updatedPackage.isActive = false
        } else {
          updatedPackage.isActive = true
        }
        await updatedPackage.save()
        return { message: 'Delivery package updated successfully!' }
      } catch (err) {
        throw err
      }
    },
    async removePrepaidDeliveryPackage(_, { id }) {
      try {
        const removedPackage = await PrepaidDeliveryPackage.findByIdAndDelete(
          id
        )
        if (!removedPackage) {
          throw new Error('Package not found')
        }
        return { message: 'Delivery package removed successfully!' }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}
