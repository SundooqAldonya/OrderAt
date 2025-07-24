const Address = require('../../models/address')
const User = require('../../models/user')
const Point = require('../../models/point')
const { transformUser } = require('./merge')
module.exports = {
  Mutation: {
    createAddress: async (_, { addressInput }, { req, res }) => {
      // delivery address is not passed
      // details is not passed
      console.log('createAddress', { addressInput })
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')

        await User.updateMany(
          { _id: req.userId },
          { $set: { 'addresses.$[].selected': false } }
        )
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }

        const address = new Address({
          ...addressInput,
          location: new Point({
            type: 'Point',
            coordinates: [addressInput.longitude, addressInput.latitude]
          })
        })
        user.addresses.push(address)
        const updatedUser = await user.save()
        const data = await transformUser(updatedUser)
        return data
      } catch (e) {
        throw e
      }
    },
    editAddress: async (_, { addressInput }, { req, res }) => {
      console.log('editAddress', { addressInput })
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }

        console.log(typeof addressInput.longitude, 'hello-1')
        console.log(typeof addressInput.latitude, 'hello-2')

        const location = new Point({
          type: 'Point',
          coordinates: [
            Number(addressInput.longitude),
            Number(addressInput.latitude)
          ]
        })
        user.addresses.id(addressInput._id).set({
          location,
          deliveryAddress: addressInput.deliveryAddress,
          details: addressInput.details,
          label: addressInput.label
        })

        const updatedUser = await user.save()
        return transformUser(updatedUser)
      } catch (e) {
        throw e
      }
    },
    deleteAddress: async (_, { id }, { req, res }) => {
      console.log('deleteAddress')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        user.addresses.id(id).remove()
        const updatedUser = await user.save()
        return transformUser(updatedUser)
      } catch (e) {
        throw e
      }
    },
    deleteBulkAddresses: async (_, { ids }, { req, res }) => {
      console.log('deleteBulkAddress => ', ids)
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        if (ids?.length > 0) {
          ids.forEach(id => {
            console.log('ID => ', id)
            user.addresses.id(id).remove()
          })
          const updatedUser = await user.save()
          return transformUser(updatedUser)
        }
        return transformUser(user)
      } catch (e) {
        throw e
      }
    },
    selectAddress: async (_, { id }, { req }) => {
      console.log('selectAddress')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')

        await User.update(
          { _id: req.userId },
          { $set: { 'addresses.$[].selected': false } },
          { multi: true }
        )
        const user = await User.findById(req.userId)
        user.addresses.id(id).set({
          selected: true
        })
        const updatedUser = await user.save()

        return transformUser(updatedUser)
      } catch (e) {
        throw e
      }
    },
    async bulkAddUserAddresses(_, args) {
      console.log('bulkAddUserAddresses', { args })
      console.log({ addresses: args.addresses })
      try {
        const user = await User.findById(args.userId)
        if (!user) throw new Error('User not found')

        // Push addresses
        for (const address of args.addresses) {
          user.addresses.push(address)
        }

        await user.save()
        return { message: 'addresses_saved' }
      } catch (err) {
        throw err
      }
    }
  }
}
