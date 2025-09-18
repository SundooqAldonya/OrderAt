const mongoose = require('mongoose')
const { optionSchema } = require('../models/option')
const { addonSchema } = require('../models/addon')
const { categorySchema } = require('../models/category')
const { pointSchema } = require('./point')
const { timingsSchema } = require('./timings')
const {
  defaultOpeningTimes,
  defaultCategoryFood,
  defaultAddons,
  defaultOptions
} = require('../helpers/defaultValues')
const { polygonSchema } = require('./zone')
const { SHOP_TYPE } = require('../helpers/enum')

const { Schema } = mongoose

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    logo: {
      type: String
    },
    address: {
      type: String,
      default: 'Default Address'
    },
    // categories: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Category'
    //   }
    // ],
    // addons: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Addon'
    //   }
    // ],
    // options: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Option'
    //   }
    // ],
    orderPrefix: {
      type: String
    },
    orderId: {
      type: Number,
      default: 1
    },
    deliveryTime: {
      type: Number,
      default: 20
    },
    minimumOrder: {
      type: Number,
      default: 0
    },
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // TODO: TBD, should this be inside address property?
    location: {
      type: pointSchema,
      default: { type: 'Point', coordinates: [0, 0] }
    },
    username: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null
    },
    sections: {
      type: [String],
      default: []
    },
    notificationToken: {
      type: String
    },
    token: {
      type: String
    },
    enableNotification: {
      type: Boolean,
      default: true
    },

    slug: { type: String, default: null },
    stripeAccountId: { type: String, default: null },
    stripeDetailsSubmitted: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 25 },
    cuisines: { type: [String] },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Owner'
    },
    deliveryBounds: polygonSchema,
    tax: { type: Number, default: 10 },
    shopType: { type: String, default: SHOP_TYPE.RESTAURANT },
    reviewCount: { type: Number, default: 0 },
    reviewAverage: { type: Number, default: 0 },
    keywords: [{ type: String }],
    tags: [{ type: String }],
    restaurantUrl: { type: String },
    phone: { type: String },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City'
    },
    shopCategory: {
      type: Schema.Types.ObjectId,
      ref: 'ShopCategory'
    },
    businessCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BusinessCategory'
      }
    ],
    salesPersonName: {
      type: String
    },
    responsiblePersonName: {
      type: String
    },
    contactNumber: {
      type: String
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    },
    // last time the app sent a keep-alive ping
    lastPingAt: {
      type: Date,
      default: null
    },
    // when the business app actually went online
    lastOnlineAt: {
      type: Date,
      default: null
    },
    // track if backend detected business as online/offline
    isOnline: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    openingTimes: {
      type: [timingsSchema],
      default: defaultOpeningTimes
    }
  },

  { timestamps: true }
)

restaurantSchema.index({ deliveryBounds: '2dsphere' })
restaurantSchema.index({ location: '2dsphere' })
module.exports = mongoose.model('Restaurant', restaurantSchema)
