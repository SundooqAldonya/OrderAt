const jwt = require('jsonwebtoken')
var randomstring = require('randomstring')
const mongoose = require('mongoose')
const Restaurant = require('../../models/restaurant')
const Owner = require('../../models/owner')
const Offer = require('../../models/offer')
const Order = require('../../models/order')
const Point = require('../../models/point')
const Sections = require('../../models/section')
const Zone = require('../../models/zone')
const User = require('../../models/user')
const Food = require('../../models/food')
const Category = require('../../models/category')

const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const {
  transformRestaurant,
  transformOwner,
  transformRestaurants,
  transformOrder,
  transformMinimalRestaurantData,
  transformMinimalRestaurants
} = require('./merge')
const {
  order_status,
  SHOP_TYPE,
  getThirtyDaysAgo
} = require('../../helpers/enum')
const {
  publishToZoneRiders,
  publishOrder,
  publishToUser
} = require('../../helpers/pubsub')
const { sendNotificationToZoneRiders } = require('../../helpers/notifications')
const {
  sendNotificationToUser,
  sendNotificationToRider
} = require('../../helpers/notifications')
const { GraphqlUpload } = require('graphql-upload')
const { cloudinary } = require('../../helpers/cloudinary')
const Addon = require('../../models/addon')
const Variation = require('../../models/variation')
const Option = require('../../models/option')
const { sendPushNotification } = require('../../helpers/findRiders')

module.exports = {
  Upload: GraphqlUpload,

  Query: {
    nearByRestaurants: async (_, args) => {
      console.log('nearByRestaurants', args)

      try {
        const { shopType, longitude, latitude } = args
        const query = {
          isActive: true,
          isAvailable: true,
          deliveryBounds: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)]
              }
            }
          }
        }

        if (shopType) {
          query.shopType = shopType
        }

        const restaurants = await Restaurant.find(query)

        if (!restaurants.length) {
          return {
            restaurants: [],
            sections: [],
            offers: []
          }
        }

        // Fetch Offers
        const offers = await Offer.find({ isActive: true, enabled: true })

        // Fetch Sections
        const sectionArray = [
          ...new Set(restaurants.flatMap(res => res.sections))
        ]
        const sections = await Sections.find({
          _id: { $in: sectionArray },
          enabled: true
        })

        // Fetch categories and foods in a single step
        const restaurantsWithCategories = await Promise.all(
          restaurants.map(async restaurant => {
            const foundCategories = await Category.find({ restaurant })

            const modifiedCategories = await Promise.all(
              foundCategories.map(async category => {
                const food = await Food.find({ category })
                return { ...category.toObject(), foods: food }
              })
            )

            return { ...restaurant.toObject(), categories: modifiedCategories }
          })
        )

        const result = {
          restaurants: restaurantsWithCategories,
          sections: sections.map(sec => ({
            _id: sec.id,
            name: sec.name,
            restaurants: sec.restaurants
          })),
          offers: offers.map(o => ({
            ...o._doc,
            _id: o.id
          }))
        }

        return result
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    nearByRestaurantsPreview: async (_, args) => {
      console.log('nearByRestaurantsPreview', args)
      try {
        const { shopType } = args
        const query = {
          isActive: true,
          isAvailable: true,
          deliveryBounds: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [Number(args.longitude), Number(args.latitude)]
              }
            }
          }
        }
        if (shopType) {
          query.shopType = shopType
        }
        const restaurants = await Restaurant.find(query)
        console.log({ restaurants })
        if (!restaurants.length) {
          return {
            restaurants: [],
            sections: [],
            offers: []
          }
        }
        // TODO: do something about offers too w.r.t zones
        const offers = await Offer.find({ isActive: true, enabled: true })

        // Find restaurants containing sections / offers
        const sectionArray = [
          ...new Set([...restaurants.map(res => res.sections)].flat())
        ]
        const sections = await Sections.find({
          _id: { $in: sectionArray },
          enabled: true
        })

        const result = {
          restaurants: await restaurants.map(transformMinimalRestaurantData),
          sections: sections.map(sec => ({
            _id: sec.id,
            name: sec.name,
            restaurants: sec.restaurants
          })),
          offers: offers.map(o => ({
            ...o._doc,
            _id: o.id
          }))
        }
        return result
      } catch (err) {
        throw err
      }
    },
    async restaurantCustomerAppDetail(_, args) {
      console.log({ restaurantCustomerAppDetailArgs: args })
      try {
        const restaurant = await Restaurant.findById(args.id)
        const categories = await Category.find({ restaurant: args.id })
        const addons = await Addon.find({ restaurant: args.id }).populate(
          'options'
        )
        const options = await Option.find({ restaurant: args.id })
        const modifiedCategories = await Promise.all(
          categories.map(async category => {
            const food = await Food.find({ category, restaurant: args.id })
              .populate('variations')
              .lean()
            // console.log({ variations: food[0].variations })
            category.foods = food
            return category
          })
        )

        return {
          ...restaurant,
          categories: [...modifiedCategories],
          ...addons,
          ...options
        }
      } catch (err) {
        throw err
      }
    },
    restaurantList: async _ => {
      console.log('restaurantList')
      try {
        const allRestaurants = await Restaurant.find({ address: { $ne: null } })
        return transformRestaurants(allRestaurants)
      } catch (error) {
        throw error
      }
    },
    restaurantListPreview: async _ => {
      console.log('restaurantListPreview')
      try {
        const allRestaurants = await Restaurant.find({ address: { $ne: null } })
        return transformMinimalRestaurants(allRestaurants)
      } catch (error) {
        throw error
      }
    },
    restaurantByOwner: async (_, args, { req }) => {
      console.log('restaurantByOwner')
      try {
        const id = args.id || req.userId
        const restaurants = await Restaurant.find({ owner: id })
        return restaurants
        // const owner = await Owner.findById(id)
        // return transformOwner(owner)
      } catch (e) {
        throw e
      }
    },
    restaurants: async _ => {
      console.log('restaurants')
      try {
        const restaurants = await Restaurant.find().populate('owner')
        // return transformRestaurants(restaurants)
        return restaurants
      } catch (e) {
        throw e
      }
    },
    restaurantsPreview: async _ => {
      console.log('restaurantsPreview')
      try {
        const restaurants = await Restaurant.find()
        return transformMinimalRestaurants(restaurants)
      } catch (e) {
        throw e
      }
    },
    restaurant: async (_, args, { req }) => {
      console.log('restaurant.args', args)
      try {
        const filters = {}
        if (args.slug) {
          filters.slug = args.slug
        } else if (args.id) {
          filters._id = args.id
        } else if (req.restaurantId) {
          filters._id = req.restaurantId
        } else {
          throw new Error('Invalid request, restaurant id not provided')
        }
        const restaurant = await Restaurant.findOne(filters)
        if (!restaurant) throw Error('Restaurant not found')
        const result = await restaurant.populate(['city', 'shopCategory'])
        console.log({ result })

        return transformRestaurant(result)
      } catch (e) {
        throw e
      }
    },
    restaurantCustomer: async (_, args, { req }) => {
      console.log('restaurantCustomer.args', args)
      try {
        const filters = {}
        if (args.slug) {
          filters.slug = args.slug
        } else if (args.id) {
          filters._id = args.id
        } else if (req.restaurantId) {
          filters._id = req.restaurantId
        } else {
          throw new Error('Invalid request, restaurant id not provided')
        }

        let restaurant = await Restaurant.findOne(filters).lean()
        if (!restaurant) throw new Error('Restaurant not found')

        // Fetch related data
        const addons = await Addon.find({ restaurant })
        const categories = await Category.find({ restaurant })
        const options = await Option.find({ restaurant })

        const modifiedCategories = await Promise.all(
          categories.map(async category => {
            const food = await Food.find({ category })
              .populate('variations')
              .lean()
            category.foods = food
            return category
          })
        )
        // console.log({
        //   modifiedCategoriesFoodVariations:
        //     modifiedCategories[0].foods[0].variations
        // })
        return {
          ...restaurant,
          categories: modifiedCategories,
          addons,
          options
        }
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    restaurantPreview: async (_, args, { req }) => {
      console.log('restaurantPreview', args)
      try {
        const filters = {}
        if (args.slug) {
          filters.slug = args.slug
        } else if (args.id) {
          filters._id = args.id
        } else if (req.restaurantId) {
          filters._id = req.restaurantId
        } else {
          throw new Error('Invalid request, restaurant id not provided')
        }
        const restaurant = await Restaurant.findOne(filters)
        if (!restaurant) throw Error('Restaurant not found')
        return transformMinimalRestaurantData(restaurant)
      } catch (e) {
        throw e
      }
    },
    restaurantOrders: async (_, args, { req }) => {
      console.log('restaurantOrders', req.restaurantId)
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const orders = await Order.find({
        restaurant: req.restaurantId,
        createdAt: {
          $gte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        }
      }).sort({ createdAt: 'descending' }) // today and yesterday instead of limit 50
      return orders.map(transformOrder)
    },
    recentOrderRestaurants: async (_, args, { req }) => {
      console.log('recentOrderRestaurants', args, req.userId)
      const { longitude, latitude } = args
      if (!req.isAuth) throw new Error('Unauthenticated')
      // selects recent orders
      const recentRestaurantIds = await Order.find({ user: req.userId })
        .select('restaurant')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
      // if no orders, no restaurant, returns empty
      if (!recentRestaurantIds.length) return []
      const restaurantIds = recentRestaurantIds.map(r =>
        r.restaurant.toString()
      )
      // finds restaurants by id, also make sures restaurants delivers in the area.
      const restaurants = await Restaurant.find({
        $and: [
          {
            id: {
              $in: restaurantIds
            }
          },
          {
            isActive: true,
            isAvailable: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [Number(longitude), Number(latitude)]
                }
              }
            }
          }
        ]
      })
      return restaurants.map(transformRestaurant)
    },
    recentOrderRestaurantsPreview: async (_, args, { req }) => {
      console.log('recentOrderRestaurantsPreview', args, req.userId)
      const { longitude, latitude } = args
      if (!req.isAuth) throw new Error('Unauthenticated')
      // selects recent orders
      const recentRestaurantIds = await Order.find({ user: req.userId })
        .select('restaurant')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
      // if no orders, no restaurant, returns empty
      if (!recentRestaurantIds.length) return []
      const restaurantIds = recentRestaurantIds.map(order => {
        console.log({ orderRestaurant: order?.restaurant })
        return order?.restaurant?.toString()
      })
      // finds restaurants by id, also make sures restaurants delivers in the area.
      const restaurants = await Restaurant.find({
        $and: [
          {
            id: {
              $in: restaurantIds
            }
          },
          {
            isActive: true,
            isAvailable: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [Number(longitude), Number(latitude)]
                }
              }
            }
          }
        ]
      })
      return restaurants.map(transformMinimalRestaurantData)
    },
    mostOrderedRestaurants: async (_, args, { req }) => {
      console.log('mostOrderedRestaurants', args, req.userId)
      const { longitude, latitude } = args
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            isActive: true,
            isAvailable: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [Number(longitude), Number(latitude)]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'restaurant',
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: getThirtyDaysAgo() }
                }
              }
            ],
            as: 'orders'
          }
        },
        {
          $addFields: {
            orderCount: { $size: '$orders' }
          }
        },
        {
          $sort: { orderCount: -1 }
        },
        {
          $limit: 20
        }
      ]).exec()

      return restaurants.map(r => transformRestaurant(new Restaurant(r)))
    },
    mostOrderedRestaurantsPreview: async (_, args, { req }) => {
      console.log('mostOrderedRestaurantsPreview', args)
      const { longitude, latitude } = args
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            isActive: true,
            isAvailable: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [Number(longitude), Number(latitude)]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'restaurant',
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: getThirtyDaysAgo() }
                }
              }
            ],
            as: 'orders'
          }
        },
        {
          $addFields: {
            orderCount: { $size: '$orders' }
          }
        },
        {
          $sort: { orderCount: -1 }
        },
        {
          $limit: 20
        }
      ]).exec()

      return restaurants.map(r =>
        transformMinimalRestaurantData(new Restaurant(r))
      )
    },
    relatedItems: async (_, args, { req }) => {
      console.log('relatedItems', args, req.userId)
      try {
        const { itemId, restaurantId } = args
        const items = await Order.aggregate([
          {
            $match: {
              $and: [
                { 'items.food': itemId },
                { restaurant: mongoose.Types.ObjectId(restaurantId) },
                { createdAt: { $gte: getThirtyDaysAgo() } }
              ]
            }
          },
          {
            $unwind: '$items'
          },
          {
            $match: {
              'items.food': { $ne: itemId }
            }
          },
          {
            $group: {
              _id: '$items.food',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10
          }
        ]).exec()

        return items.map(item => item._id)
      } catch (error) {
        console.log('relatedItems', error)
        throw error
      }
    },
    popularItems: async (_, args) => {
      console.log('popularItems', args)
      try {
        const { restaurantId } = args
        const result = await Order.aggregate([
          {
            $match: {
              $and: [
                { restaurant: mongoose.Types.ObjectId(restaurantId) },
                { createdAt: { $gte: getThirtyDaysAgo() } }
              ]
            }
          },
          { $unwind: '$items' },
          { $group: { _id: { id: '$items.food' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
          // {
          //   $lookup: {
          //     from: 'foods', // Name of the Food collection
          //     localField: '_id.id',
          //     foreignField: '_id',
          //     as: 'foodDetails'
          //   }
          // },
          // { $unwind: '$foodDetails' }, // Unwind the populated food
          // {
          //   $lookup: {
          //     from: 'variations', // Name of the Variation collection
          //     localField: 'foodDetails._id',
          //     foreignField: 'food',
          //     as: 'foodDetails.variations'
          //   }
          // },
          // {
          //   $project: {
          //     _id: 0,
          //     foodId: '$foodDetails._id',
          //     foodName: '$foodDetails.name',
          //     count: 1,
          //     variations: '$foodDetails.variations'
          //   }
          // }
        ]).exec()
        const foods = result.map(async item => {
          console.log({ item })
          const food = await Food.findById(item._id.id).populate('variations')
          return food
        })
        console.log({ foods })
        console.log({ result: result[0]._id })
        // return result.map(({ _id: { id }, count }) => ({ id, count }))
        return foods
      } catch (error) {
        console.log('popularItems errored', error)
      }
    },
    topRatedVendors: async (_, args, { req }) => {
      console.log('topRatedVendors', args)
      try {
        const { longitude, latitude } = args
        const restaurants = await Restaurant.aggregate([
          {
            $match: {
              isActive: true,
              isAvailable: true,
              deliveryBounds: {
                $geoIntersects: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [Number(longitude), Number(latitude)]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'reviews',
              localField: '_id',
              foreignField: 'restaurant',
              pipeline: [
                {
                  $match: {
                    createdAt: { $gte: getThirtyDaysAgo() }
                  }
                }
              ],
              as: 'reviews'
            }
          },
          {
            $addFields: {
              averageRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] } // Calculate the average of the 'rating' property
            }
          },
          {
            $sort: { averageRating: -1 }
          },
          {
            $limit: 20
          }
        ]).exec()
        return restaurants.map(restaurant =>
          transformRestaurant(new Restaurant(restaurant))
        )
      } catch (error) {
        console.log('topRatedVendors error', error)
      }
    },
    topRatedVendorsPreview: async (_, args, { req }) => {
      console.log('topRatedVendorsPreview', args)
      try {
        const { longitude, latitude } = args
        const restaurants = await Restaurant.aggregate([
          {
            $match: {
              isActive: true,
              isAvailable: true,
              deliveryBounds: {
                $geoIntersects: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [Number(longitude), Number(latitude)]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'reviews',
              localField: '_id',
              foreignField: 'restaurant',
              pipeline: [
                {
                  $match: {
                    createdAt: { $gte: getThirtyDaysAgo() }
                  }
                }
              ],
              as: 'reviews'
            }
          },
          {
            $addFields: {
              averageRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] } // Calculate the average of the 'rating' property
            }
          },
          {
            $sort: { averageRating: -1 }
          },
          {
            $limit: 20
          }
        ]).exec()
        return restaurants.map(restaurant =>
          transformMinimalRestaurantData(new Restaurant(restaurant))
        )
      } catch (error) {
        console.log('topRatedVendors error', error)
      }
    }
  },
  Mutation: {
    createRestaurant: async (_, args, { req }) => {
      console.log('createRestaurant', args)
      try {
        // console.log({ authenticatedCreate: req.isAuth })
        if (!req.isAuth) throw new Error('Unauthenticated')
        const restaurantExists = await Restaurant.exists({
          name: { $regex: new RegExp('^' + args.restaurant.name + '$', 'i') }
        })
        if (restaurantExists) {
          throw Error('Restaurant by this name already exists')
        }
        const owner = await Owner.findById(args.owner)
        if (!owner) throw new Error('Owner does not exist')
        const orderPrefix = randomstring.generate({
          length: 5,
          capitalization: 'uppercase'
        })

        let restaurant = new Restaurant({
          name: args.restaurant.name,
          address: args.restaurant.address,
          image: args.restaurant.image,
          logo: args.restaurant.logo,
          orderPrefix: orderPrefix,
          slug: args.restaurant.name.toLowerCase().split(' ').join('-'),
          username: args.restaurant.username,
          password: args.restaurant.password,
          owner: args.owner,
          tax: args.restaurant.salesTax,
          cuisines: args.restaurant.cuisines ?? [],
          shopCategory: args.restaurant.shopType,
          restaurantUrl: args.restaurant.restaurantUrl,
          phone: args.restaurant.phone,
          city: args.restaurant.city
        })
        console.log('New Restaurant: ', restaurant)

        await restaurant.save()
        console.log({ restaurant })
        owner.restaurants.push(restaurant.id)
        await owner.save()
        // return transformRestaurant(restaurant)
        restaurant = await restaurant.populate('owner')
        return restaurant
      } catch (err) {
        throw err
      }
    },
    editRestaurant: async (_, args, { req }) => {
      console.log('editRestaurant')
      console.log({ args })
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const restaurantByNameExists = await Restaurant.findOne({
          name: { $regex: new RegExp('^' + args.restaurant.name + '$', 'i') },
          // name: { $text: { $search: args.restaurant.name } },
          _id: { $ne: args.restaurant._id }
        })
          .select({ _id: 1 })
          .lean()

        if (restaurantByNameExists) {
          throw new Error('Restaurant by this name already exists')
        }
        if (args.restaurant.username) {
          const restaurantExists = await Restaurant.findOne({
            username: args.restaurant.username
          })

          if (restaurantExists && restaurantExists.id !== args.restaurant._id) {
            throw new Error('Username already taken')
          }
        }
        if (args.restaurant.orderPrefix) {
          const restaurantExists = await Restaurant.find({
            orderPrefix: args.restaurant.orderPrefix
          })
          if (restaurantExists.length > 0) {
            if (restaurantExists.length > 1) {
              throw new Error('Order Prefix already taken')
            } else if (restaurantExists[0].id !== args.restaurant._id) {
              throw new Error('Order Prefix already taken')
            }
          }
        }

        const restaurant = await Restaurant.findOne({
          _id: args.restaurant._id
        })
        restaurant.name = args.restaurant.name
        restaurant.address = args.restaurant.address
        restaurant.orderPrefix = args.restaurant.orderPrefix
        restaurant.isActive = true
        restaurant.username = args.restaurant.username
        restaurant.deliveryTime = args.restaurant.deliveryTime
        restaurant.minimumOrder = args.restaurant.minimumOrder
        restaurant.password = args.restaurant.password
        restaurant.slug = args.restaurant.name
          .toLowerCase()
          .split(' ')
          .join('-')
        restaurant.tax = args.restaurant.salesTax
        restaurant.shopCategory = args.restaurant.shopType
        restaurant.cuisines = args.restaurant.cuisines
        restaurant.restaurantUrl = args.restaurant.restaurantUrl
        restaurant.phone = args.restaurant.phone
        restaurant.city = args.restaurant.city
        await restaurant.save()
        const result = await restaurant.populate('city')
        console.log({ result })
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    async uploadFile(_, { id, file }) {
      console.log({ file })
      try {
        const {
          createReadStream,
          filename,
          mimetype,
          encoding
        } = await file.file
        const stream = createReadStream()

        const image = await cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto'
          },
          async (error, result) => {
            if (error) {
              throw new Error('Upload failed')
            }
            console.log({ image: result.secure_url })
            const restaurant = await Restaurant.findById(id)
            console.log({ restaurant })
            restaurant.image = result.secure_url
            await restaurant.save()
            return result.secure_url // Return the URL of the uploaded image
          }
        )

        stream.pipe(image)
        // console.log({ image: image })
        return { message: 'uploaded' }
      } catch (err) {
        throw err
      }
    },
    async uploadRestaurantLogo(_, { id, file }) {
      console.log({ file })
      try {
        const { createReadStream } = await file.file
        const stream = createReadStream()

        const image = await cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto'
          },
          async (error, result) => {
            if (error) {
              throw new Error('Upload failed')
            }
            console.log({ image: result.secure_url })
            const restaurant = await Restaurant.findById(id)
            console.log({ restaurant })
            restaurant.logo = result.secure_url
            await restaurant.save()
            return result.secure_url
          }
        )

        stream.pipe(image)
        // console.log({ image: image })
        return { message: 'uploaded' }
      } catch (err) {
        throw err
      }
    },
    deleteRestaurant: async (_, { id }, { req }) => {
      console.log('deleteRestaurant', req.userId)
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const owner = await Owner.findOne({
          restaurants: mongoose.Types.ObjectId(id)
        })
        // if (!owner) throw new Error('Owner does not exist')
        // if (!owner.isActive) throw new Error('Owner was deleted')
        const restaurant = await Restaurant.findById(id)
        restaurant.isActive = !restaurant.isActive
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    restaurantLogin: async (_, args) => {
      console.log('restaurantLogin', args)
      try {
        const restaurant = await Restaurant.findOne({
          username: args.username,
          password: args.password
        })
        if (!restaurant) throw new Error('Invalid credentials')
        const token = jwt.sign(
          { restaurantId: restaurant._id },
          process.env.SECRETKEY
        )
        // await Restaurant.findByIdAndUpdate(
        //   restaurant._id,
        //   { $set: { notificationToken: args.notificationToken } },
        //   { new: true } // Returns the updated document
        // )
        return { token, restaurantId: restaurant._id, city: restaurant.city }
      } catch (err) {
        console.log({ err })
        throw new Error(err)
      }
    },
    restaurantLogout: async (_, args) => {
      console.log('restaurantLogout', args)
      try {
        const restaurant = await Restaurant.findById(args.id)
        console.log({ restaurant })
        if (!restaurant) throw new Error('Invalid Business ID')
        restaurant.token = null
        restaurant.notificationToken = null
        await restaurant.save()
        return { message: 'Business logged out successfully!' }
      } catch (err) {
        console.log({ err })
        throw new Error(err)
      }
    },
    acceptOrder: async (_, args, { req }) => {
      var newDateObj = new Date(Date.now() + (parseInt(args.time) || 0) * 60000)
      console.log('preparation', newDateObj)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id).populate('restaurant')
        const status = order_status[1] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        const restaurant = await Restaurant.findById(req.restaurantId)
        order.preparationTime = newDateObj
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        )
        order.acceptedAt = new Date()
        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)

        console.log({ transformedOrder })
        if (!transformedOrder.isPickedUp) {
          publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
          // sendNotificationToZoneRiders(order.zone.toString(), transformedOrder)
          // await sendPushNotification(order.zone.toString(), transformedOrder)
          await sendPushNotification(order.zone.toString(), order)
        }
        console.log('restaurant accepted order')
        publishToUser(result.user.toString(), transformedOrder, 'update')
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user.toString(), transformedOrder)
        return transformedOrder
      } catch (err) {
        console.log('acceptOrder', err)
        throw err
      }
    },
    acceptOrderAdmin: async (_, args, { req }) => {
      var newDateObj = new Date(Date.now() + (parseInt(args.time) || 0) * 60000)
      console.log('preparation', newDateObj)
      console.log({ acceptOrderAdminArgs: args })
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id).populate('restaurant')
        const status = order_status[1] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        const restaurant = await Restaurant.findById(args.restaurantId)
        order.preparationTime = newDateObj
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        )
        order.acceptedAt = new Date()
        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)

        console.log({ transformedOrder })
        if (!transformedOrder.isPickedUp) {
          publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
          // sendNotificationToZoneRiders(order.zone.toString(), transformedOrder)
          await sendPushNotification(order.zone.toString(), order)
        }
        publishToUser(result.user.toString(), transformedOrder, 'update')
        // sendNotificationToCustomerWeb(
        //   user.notificationTokenWeb,
        //   `Order status: ${result.orderStatus}`,
        //   `Order ID ${result.orderId}`
        // )
        publishOrder(transformedOrder)
        // sendNotificationToUser(result.user.toString(), transformedOrder)
        return transformedOrder
      } catch (err) {
        console.log('acceptOrder', err)
        throw err
      }
    },
    cancelOrder: async (_, args, { req }) => {
      console.log('cancelOrder')
      if (!req.restaurantId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id)
        const status = order_status[4] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        order.reason = args.reason
        order.cancelledAt = new Date()
        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)

        if (result.rider) {
          sendNotificationToRider(result.rider.toString(), transformedOrder)
        }

        sendNotificationToUser(result.user, transformedOrder)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    saveRestaurantToken: async (_, args, { req }) => {
      console.log('saveRestaurantToken', req.restaurantId, args)
      try {
        const restaurant = await Restaurant.findById(req.restaurantId)
        if (!restaurant) throw new Error('Restaurant does not exist')
        restaurant.notificationToken = args.token
        restaurant.enableNotification = args.isEnabled
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (error) {
        console.log('error', error)
      }
    },
    updateTimings: async (_, args) => {
      console.log('updateTimings', args)
      try {
        const restaurant = await Restaurant.findById(args.id)
        restaurant.openingTimes = args.openingTimes
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    toggleAvailability: async (_, args, { req }) => {
      console.log('toggleAvailablity')
      try {
        if (!req.restaurantId) {
          throw new Error('Unauthenticated!')
        }
        const restaurant = await Restaurant.findById(req.restaurantId)
        restaurant.isAvailable = !restaurant.isAvailable
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    updateCommission: async (_, args) => {
      console.log('updateCommission')
      try {
        const { id, commissionRate } = args
        const result = await Restaurant.updateOne(
          { _id: id },
          { commissionRate }
        )
        if (result.modifiedCount > 0) {
          const restaurant = await Restaurant.findOne({ _id: id })
          return transformRestaurant(restaurant)
        } else {
          throw Error("Couldn't update the restaurant")
        }
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    orderPickedUp: async (_, args, { req }) => {
      console.log('orderPickedUp')
      if (!req.restaurantId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id)
        const status = order.isPickedUp ? order_status[3] : order_status[2] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        const restaurant = await Restaurant.findById(req.restaurantId)
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        )

        order[order.isPickedUp ? 'deliveredAt' : 'pickedAt'] = new Date()

        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)

        if (!transformedOrder.isPickedUp) {
          publishToUser(result.rider.toString(), transformedOrder, 'update')
        }
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user.toString(), transformedOrder)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    updateDeliveryBoundsAndLocation: async (_, args) => {
      console.log('updateDeliveryBoundsAndLocation', { args })
      const { id, bounds: newBounds, location: newLocation } = args
      try {
        const restaurant = await Restaurant.findById(id)
        if (!restaurant) throw new Error('Restaurant does not exists')
        const location = new Point({
          type: 'Point',
          coordinates: [newLocation.longitude, newLocation.latitude]
        })
        console.log('Location: ', location)
        const zone = await Zone.findOne({
          location: { $geoIntersects: { $geometry: location } },
          isActive: true
        })
        console.log('Zone: ', zone)
        if (!zone) {
          throw new Error(
            "Restaurant's location doesn't lie in any delivery zone"
          )
        }
        const updated = await Restaurant.findByIdAndUpdate(
          id,
          {
            deliveryBounds: { type: 'Polygon', coordinates: newBounds },
            location
          },
          { new: true }
        )

        return {
          success: true,
          data: transformRestaurant(updated)
        }
      } catch (error) {
        console.log('updateDeliveryBoundsAndLocation', error)
        throw new Error(error)
      }
    }
  }
}
