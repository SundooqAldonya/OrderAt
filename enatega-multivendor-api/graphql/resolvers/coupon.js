const dateScalar = require('../../helpers/dateScalar')
const Coupon = require('../../models/coupon')
const User = require('../../models/user')
const DeliveryZone = require('../../models/deliveryZone')
const {
  isInTarget,
  intersectsWithTarget,
  categoryIdsFromItems
} = require('../../helpers/couponsHelpers')

module.exports = {
  Date: dateScalar,

  Query: {
    coupons: async () => {
      console.log('coupons')
      try {
        const coupons = await Coupon.find({ isActive: true })
          .sort({
            createdAt: -1
          })
          .populate('target.businesses')
          .populate('target.categories')
          .populate('target.cities')
          .populate('target.customers')
          .populate('target.foods')
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
    },
    async getCouponDiscountTypeEnums(_, args) {
      try {
        const enums = await Coupon.schema.path('rules.discount_type').enumValues
        return enums
      } catch (err) {
        throw err
      }
    },
    async getCouponStatuses(_, args) {
      try {
        const enums = await Coupon.schema.path('status').enumValues
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
        const rules = {
          discount_type: args.couponInput.rules.discount_type,
          discount_value: args.couponInput.rules.discount_value,
          applies_to: args.couponInput.rules.applies_to,
          min_order_value: args.couponInput.rules.min_order_value,
          max_discount: args.couponInput.rules.max_discount,
          start_date: args.couponInput.rules.start_date,
          end_date: args.couponInput.rules.end_date,
          limit_total: args.couponInput.rules.limit_total,
          limit_per_user: args.couponInput.rules.limit_per_user
        }
        const coupon = new Coupon({
          code: args.couponInput.code,
          status: args.couponInput.status,
          rules
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
      console.log('editCoupon', { args })
      try {
        const count = await Coupon.countDocuments({ _id: args.id })
        if (count > 1) throw new Error('Coupon code already used')
        const coupon = await Coupon.findById(args.id)
        if (!coupon) {
          throw new Error('Coupon does not exist')
        }
        const rules = {
          discount_type: args.couponInput.rules.discount_type,
          discount_value: args.couponInput.rules.discount_value,
          applies_to: args.couponInput.rules.applies_to,
          min_order_value: args.couponInput.rules.min_order_value,
          max_discount: args.couponInput.rules.max_discount,
          start_date: args.couponInput.rules.start_date,
          end_date: args.couponInput.rules.end_date,
          limit_total: args.couponInput.rules.limit_total,
          limit_per_user: args.couponInput.rules.limit_per_user
        }
        coupon.code = args.couponInput.code
        coupon.status = args.couponInput.status
        coupon.rules = { ...rules }
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
        return { message: 'coupon_updated' }
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
    },
    async applyCoupon(_, args, { req }) {
      console.log('applyCoupon', { args })
      const { code, orderSubtotal, orderMeta } = args.applyCouponInput
      console.log({ orderMeta })
      const { item_ids, business_id, location } = orderMeta
      console.log({ location })
      if (!req.isAuth) throw new Error('Unauthenticated!')
      try {
        const now = new Date()

        const coupon = await Coupon.findOne({ code: code.replace(' ', '') })
        console.log({ coupon })

        const categories = await categoryIdsFromItems(orderMeta.item_ids)

        const deliveryZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
              }
            }
          }
        })

        console.log({ categories })
        console.log({ deliveryZone })

        if (!coupon) {
          throw new Error('Coupon not found.')
        }

        // 1. Status check
        if (coupon.status !== 'active') {
          throw new Error('Coupon is not active.')
        }

        // 2. Date range check
        const { start_date, end_date } = coupon.rules
        if (start_date && now < new Date(start_date)) {
          throw new Error('Coupon is not yet valid.')
        }
        if (end_date && now > new Date(end_date)) {
          throw new Error('Coupon has expired.')
        }

        if (
          coupon.target.businesses?.length &&
          !isInTarget(coupon.target.businesses, business_id)
        ) {
          throw new Error('This coupon is not valid for this business.')
        }

        if (
          coupon.target.customers?.length &&
          !isInTarget(coupon.target.customers, req.userId)
        ) {
          throw new Error('This coupon is not available to this customer.')
        }

        if (
          coupon.target.cities?.length &&
          !isInTarget(coupon.target.cities, deliveryZone.city)
        ) {
          throw new Error('This coupon is not valid in your city.')
        }

        // if (coupon.target.categories?.length && !intersectsWithTarget(coupon.target.categories, categories)) {
        //   throw new Error('This coupon does not apply to selected categories.')
        // }

        if (
          coupon.target.foods?.length &&
          !intersectsWithTarget(coupon.target.foods, item_ids)
        ) {
          throw new Error('This coupon does not apply to selected items.')
        }

        // 3. Min order value
        if (
          coupon.rules.min_order_value &&
          orderSubtotal < coupon.rules.min_order_value
        ) {
          throw new Error(
            `Order must be at least ${coupon.rules.min_order_value} to use this coupon.`
          )
        }

        // 4. Total limit of usage overall for all users
        if (
          coupon.rules.limit_total &&
          coupon.tracking.usage_count >= coupon.rules.limit_total
        ) {
          throw new Error('Coupon usage limit reached.')
        }

        // 5. Total Limit per user
        const userUsageCount = coupon.tracking.user_usage?.get(req.userId) || 0
        console.log({
          userUsageCount,
          limit_user: coupon?.rules?.limit_per_user
        })
        if (
          coupon.rules.limit_per_user &&
          userUsageCount >= coupon.rules.limit_per_user
        ) {
          throw new Error('You have reached the usage limit for this coupon.')
        }

        // 6. Calculate discount
        let discountAmount = 0
        const { discount_type, discount_value, max_discount } = coupon.rules

        // if (discount_type === 'percent') {
        //   discountAmount = (orderSubtotal * discount_value) / 100 // 100 * 100 / 100 = 100
        //   if (max_discount && discountAmount > max_discount) {
        //     discountAmount = max_discount
        //   }
        // } else if (discount_type === 'flat') {
        //   discountAmount = discount_value
        // }

        console.log({ appliesTo: coupon?.rules?.applies_to })

        return {
          code: coupon.code,
          valid: true,
          // discount: discountAmount,
          discount: discount_value,
          appliesTo: coupon.rules.applies_to[0],
          discountType: coupon.rules.discount_type,
          maxDiscount: coupon.rules.max_discount,
          message: `Coupon applied successfully. Discount: ${discount_value}`,
          foods: coupon.target.foods
        }
      } catch (err) {
        throw err
      }
    },

    async applyCouponMandoob(_, args, { req }) {
      console.log('applyCouponMandoob', { args })
      const { applyCouponMandoobInput } = args
      const { code, deliveryFee, location } = applyCouponMandoobInput
      try {
        const coupon = await Coupon.findOne({ code })
        console.log({ coupon })

        const deliveryZone = await DeliveryZone.findOne({
          location: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
              }
            }
          }
        })

        const now = new Date()

        if (!coupon) {
          throw new Error('Coupon not found.')
        }

        // 1. Status check
        if (coupon.status !== 'active') {
          throw new Error('Coupon is not active.')
        }

        // 2. Date range check
        const { start_date, end_date } = coupon.rules
        if (start_date && now < new Date(start_date)) {
          throw new Error('Coupon is not yet valid.')
        }
        if (end_date && now > new Date(end_date)) {
          throw new Error('Coupon has expired.')
        }

        if (
          coupon.target.cities?.length &&
          !isInTarget(coupon.target.cities, deliveryZone.city)
        ) {
          throw new Error('This coupon is not valid in your city.')
        }

        if (
          coupon.target.customers?.length &&
          !isInTarget(coupon.target.customers, req.userId)
        ) {
          throw new Error('This coupon is not available to this customer.')
        }

        if (
          coupon.rules.min_order_value &&
          deliveryFee < coupon.rules.min_order_value
        ) {
          throw new Error(
            `Order must be at least ${coupon.rules.min_order_value} to use this coupon.`
          )
        }

        if (
          coupon.rules.limit_total &&
          coupon.tracking.usage_count >= coupon.rules.limit_total
        ) {
          throw new Error('Coupon usage limit reached.')
        }

        // 5. Total Limit per user
        const userUsageCount = coupon.tracking.user_usage?.get(req.userId) || 0
        console.log({
          userUsageCount,
          limit_user: coupon?.rules?.limit_per_user
        })
        if (
          coupon.rules.limit_per_user &&
          userUsageCount >= coupon.rules.limit_per_user
        ) {
          throw new Error('You have reached the usage limit for this coupon.')
        }
        const { discount_type, discount_value, max_discount } = coupon.rules

        return {
          code: coupon.code,
          valid: true,
          discount: discount_value,
          appliesTo: coupon.rules.applies_to[0],
          discountType: discount_type,
          maxDiscount: max_discount,
          message: `Coupon applied successfully. Discount: ${discount_value}`
        }
      } catch (err) {
        throw err
      }
    }
  }
}
