const Owner = require('../../models/owner')
const Restaurant = require('../../models/restaurant')
const { transformOwner } = require('./merge')
const bcrypt = require('bcryptjs')

module.exports = {
  Query: {
    vendors: async (_, args, context) => {
      console.log('vendors')
      try {
        // TODO: might need pagination here
        const vendors = await Owner.find({
          userType: 'VENDOR',
          isActive: true
        })
        if (!vendors || !vendors.length) return []
        // return vendors.map(vendor => {
        //   return transformOwner(vendor)
        // })
        return vendors
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getVendor: async (_, args, context) => {
      console.log('getVendor')
      try {
        const vendor = await Owner.findById(args.id)
        return transformOwner(vendor)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    // TODO: need to rethink about how restaurants are being added
    createVendor: async (_, args, context) => {
      console.log('createVendor', args)
      try {
        if (args.vendorInput.email) {
          const existingEmail = await Owner.findOne({
            email: args.vendorInput.email
          })
          if (existingEmail) {
            throw new Error('Email is already associated with another account.')
          }
        }
        const owner = new Owner({
          email: args.vendorInput.email,
          name: args.vendorInput.name,
          phone: args.vendorInput.phone,
          userType: 'VENDOR'
        })
        await owner.setPassword(args.vendorInput.password)
        const result = await owner.save()
        return transformOwner(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editVendor: async (_, args, context) => {
      console.log('editVendor')
      try {
        const owner = await Owner.findOne({
          _id: args.vendorInput._id,
          isActive: true
        })
        const existingOwnerWithEmail = await Owner.find({
          email: args.vendorInput.email,
          isActive: true
        })
        if (existingOwnerWithEmail.length <= 1) {
          if (
            existingOwnerWithEmail.length === 1 &&
            existingOwnerWithEmail[0].id !== args.vendorInput._id
          ) {
            throw Error('Email is associated with another account')
          }
          owner.email = args.vendorInput.email
          owner.name = args.vendorInput.name
          owner.phone = args.vendorInput.phone
          if (args?.vendorInput?.password) {
            await owner.setPassword(args.vendorInput.password)
          }
          const result = await owner.save()
          return transformOwner(result)
        } else {
          throw Error('Email is associated with another account')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    // TODO: if vendor is deleted, shouldn't the restaurants also(isActive:false)
    deleteVendor: async (_, args, context) => {
      console.log('Delete Vendor')
      try {
        const owner = await Owner.findById(args.id)
        owner.restaurants.forEach(async element => {
          const restaurant = await Restaurant.findById(element)
          restaurant.isActive = false
          await restaurant.deleteOne()
        })
        owner.isActive = false
        await owner.deleteOne()
        return true
      } catch (error) {
        console.log(error)
      }
    }
  }
}
