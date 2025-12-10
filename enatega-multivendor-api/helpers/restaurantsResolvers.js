const { transformMinimalRestaurantData } = require('../graphql/resolvers/merge')
const Offer = require('../models/offer')
const Restaurant = require('../models/restaurant')
const Section = require('../models/section')
const { getThirtyDaysAgo } = require('./enum')

module.exports = {
  nearByRestaurantsPreview: async ({ longitude, latitude, ip, shopType }) => {
    console.log('nearByRestaurantsPreview', {
      longitude,
      latitude,
      ip,
      shopType
    })
    try {
      const query = {
        isActive: true,
        isAvailable: true,
        isVisible: true,
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
      const restaurants = await Restaurant.find(query).limit(20)
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
      const sections = await Section.find({
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
  async getRestaurantsWithOffers({ latitude, longitude }) {
    console.log('restaurantsWithOffers', { latitude, longitude })
    try {
      const discountedRestaurantIds = await Restaurant.aggregate([
        {
          $match: {
            isVisible: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude]
                }
              }
            }
          }
        },
        // business categories
        {
          $lookup: {
            from: 'businesscategories',
            localField: 'businessCategories',
            foreignField: '_id',
            as: 'businessCategories'
          }
        },
        // Bring in categories for the restaurant
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: 'restaurant',
            as: 'categories'
          }
        },
        // Bring in foods for all categories
        {
          $lookup: {
            from: 'foods',
            localField: 'categories._id',
            foreignField: 'category',
            as: 'foods'
          }
        },
        // Bring in all variations referenced by foods
        {
          $lookup: {
            from: 'variations',
            localField: 'foods.variations',
            foreignField: '_id',
            as: 'variations'
          }
        },
        {
          $addFields: {
            categories: {
              $map: {
                input: '$categories',
                as: 'cat',
                in: {
                  $mergeObjects: [
                    '$$cat',
                    {
                      foods: {
                        $map: {
                          input: {
                            $filter: {
                              input: '$foods',
                              as: 'food',
                              cond: { $eq: ['$$food.category', '$$cat._id'] }
                            }
                          },
                          as: 'food',
                          in: {
                            $mergeObjects: [
                              '$$food',
                              {
                                variations: {
                                  $filter: {
                                    input: '$variations',
                                    as: 'var',
                                    cond: {
                                      $and: [
                                        {
                                          $in: [
                                            '$$var._id',
                                            '$$food.variations'
                                          ]
                                        },
                                        { $gt: ['$$var.discounted', 0] }
                                      ]
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        // Remove categories that have no foods with discounted variations
        {
          $addFields: {
            categories: {
              $filter: {
                input: '$categories',
                as: 'cat',
                cond: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$$cat.foods',
                          as: 'f',
                          cond: { $gt: [{ $size: '$$f.variations' }, 0] }
                        }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        },
        // Only keep restaurants that have at least one category left
        {
          $match: {
            'categories.0': { $exists: true }
          }
        }
      ])

      // console.log({
      //   discountedRestaurantIds: discountedRestaurantIds[0].businessCategories
      // })

      return discountedRestaurantIds
    } catch (err) {
      throw new Error(err)
    }
  },

  async getHighestRatedRestaurants({ longitude, latitude }) {
    console.log('highestRatingRestaurant', { longitude, latitude })
    try {
      const restaurants = await Restaurant.find({
        isVisible: true,
        reviewCount: { $gt: 0 },
        deliveryBounds: {
          $geoIntersects: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] }
            // $maxDistance: 5000
          }
        }
      })
        .populate('businessCategories')
        .sort({ reviewAverage: -1 })
      return restaurants
    } catch (err) {
      throw new Error(err)
    }
  },

  async getFeaturedRestaurants({ longitude, latitude }) {
    console.log('featuredRestaurants', { longitude, latitude })
    try {
      const restaurants = await Restaurant.find({
        isVisible: true,
        featured: true,
        deliveryBounds: {
          $geoIntersects: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] }
          }
        }
      }).populate('businessCategories')
      console.log({ featuredRestaurants: restaurants })
      return restaurants
    } catch (err) {
      throw new Error(err)
    }
  },

  getMostOrderedRestaurants: async ({ longitude, latitude }) => {
    console.log('getMostOrderedRestaurants', { longitude, latitude })
    try {
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            isActive: true,
            isAvailable: true,
            isVisible: true,
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
        },
        {
          $lookup: {
            from: 'businesscategories', // must match actual collection name (usually lowercase plural)
            localField: 'businessCategories', // assumed to be an array of ObjectIds in Restaurant
            foreignField: '_id',
            as: 'businessCategories'
          }
        }
      ]).exec()
      return restaurants
    } catch (err) {
      throw err
    }
  }
}
