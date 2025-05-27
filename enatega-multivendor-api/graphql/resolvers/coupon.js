const dateScalar = require('../../helpers/dateScalar')
const Coupon = require('../../models/coupon')

module.exports = {
  Date: dateScalar,

  Query: {
    coupons: async () => {
      console.log('coupons')
      try {
        const coupons = await Coupon.find({ isActive: true }).sort({
          createdAt: -1
        })
        return coupons.map(coupon => ({
          ...coupon._doc,
          _id: coupon.id
        }))
      } catch (err) {
        throw err
      }
    },
    async getCouponEnums(_, args) {
      try {
        const enums = await Coupon.schema.path('rules.applies_to').caster
          .enumValues
        return enums
      } catch (err) {
        throw err
      }
    }
  },

  Mutation: {
    createCoupon: async (_, args, context) => {
      console.log('createCoupon', { args, target: args.couponInput.target })
      try {
        const existingCoupon = await Coupon.findOne({
          code: args.couponInput.code
        })
        if (existingCoupon) throw new Error('Coupon Code already exists')
        const coupon = new Coupon({
          code: args.couponInput.code
          // discount: args.couponInput.discount,
          // enabled: args.couponInput.enabled
          // target: {
          //   categories:
          // }
        })
        if (args.couponInput?.target?.categories?.length) {
          coupon.target.categories = [...args.couponInput.target?.categories]
        }
        if (args.couponInput?.target?.cities?.length) {
          coupon.target.cities = [...args.couponInput.target?.cities]
        }
        if (args.couponInput?.target?.businesses?.length) {
          coupon.target.businesses = [...args.couponInput.target?.businesses]
        }
        if (args.couponInput?.target?.items?.length) {
          coupon.target.items = [...args.couponInput.target?.items]
        }
        if (args.couponInput?.target?.customers?.length) {
          coupon.target.customers = [...args.couponInput.target?.customers]
        }
        if (args.couponInput?.target?.foods?.length) {
          coupon.target.foods = [...args.couponInput.target?.foods]
        }
        await coupon.save()
        return {
          message: 'created_coupon'
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editCoupon: async (_, args, context) => {
      console.log('editCoupon')
      try {
        const count = await Coupon.countDocuments({ _id: args.couponInput._id })
        if (count > 1) throw new Error('Coupon code already used')
        const coupon = await Coupon.findById(args.couponInput._id)
        if (!coupon) {
          throw new Error('Coupon does not exist')
        }
        coupon.title = args.couponInput.title
        coupon.discount = args.couponInput.discount
        coupon.enabled = args.couponInput.enabled
        const result = await coupon.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteCoupon: async (_, args, context) => {
      console.log('deleteCoupon')
      try {
        const coupon = await Coupon.findById(args.id)
        await coupon.deleteOne()
        return { message: 'removed_coupon_successfully' }
        // coupon.isActive = false
        // const result = await coupon.save()
        // return result.id
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    coupon: async (_, args, context) => {
      console.log('coupon', args)
      try {
        const coupon = await Coupon.findOne({
          isActive: true,
          title: args.coupon
        })
        if (coupon) {
          return {
            ...coupon._doc,
            _id: coupon.id
          }
        } else {
          throw new Error('Coupon code not found')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
