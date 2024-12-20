const Variation = require('../models/variation')
const Food = require('../models/food')
const Category = require('../models/category')

const defaultOpeningTimes = [
  {
    day: 'MON',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  },
  {
    day: 'TUE',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  },
  {
    day: 'WED',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  },
  {
    day: 'THU',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  },
  {
    day: 'FRI',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  },
  {
    day: 'SAT',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  },
  {
    day: 'SUN',
    times: [
      {
        startTime: ['00', '00'],
        endTime: ['23', '59']
      }
    ]
  }
]
const variation1 = new Variation({
  addons: ['5fda4075b651daa22b242a36'],
  title: 'Regular',
  price: 9.99
})
const variation2 = new Variation({
  addons: ['5fda4075b651daa22b242a36'],
  title: 'Medium',
  price: 14.99
})
const food1 = new Food({
  variations: [variation1, variation2],
  title: 'Default Food',
  description: 'Default Food Description',
  image: ''
})
const category1 = new Category({
  foods: [food1],
  title: 'Default Category'
})
const defaultCategoryFood = [category1]

const defaultAddons = [
  {
    options: ['5fda4067b651daa22b242a2e', '5fda406fb651daa22b242a32'],
    isActive: true,
    _id: '5fda4075b651daa22b242a36',
    title: 'Default Addon',
    description: 'Default Addon Description',
    quantityMinimum: 1,
    quantityMaximum: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
const defaultOptions = [
  {
    price: 0,
    isActive: true,
    _id: '5fda4067b651daa22b242a2e',
    title: 'Pepsi',
    description: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    price: 0,
    isActive: true,
    _id: '5fda406fb651daa22b242a32',
    title: '7up',
    description: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
module.exports.defaultOpeningTimes = defaultOpeningTimes
module.exports.defaultCategoryFood = defaultCategoryFood
module.exports.defaultAddons = defaultAddons
module.exports.defaultOptions = defaultOptions
