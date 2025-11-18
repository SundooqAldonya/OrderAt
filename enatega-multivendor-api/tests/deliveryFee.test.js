const { expect } = require('chai')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const DeliveryZone = require('../models/deliveryZone')
const DeliveryPriceV2 = require('../models/deliveryPriceV2')
const Configuration = require('../models/configuration')
const Restaurant = require('../models/restaurant')
const PrepaidDeliveryPackage = require('../models/prepaidDeliveryPackage')

const { calculateDeliveryFeeV3 } = require('../helpers/calculateDeliveryFee')

describe('Delivery Fee Calculation', () => {
  let mongoServer

  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    mongoose.set('strictQuery', false)
  })

  after(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase()
  })

  it('should apply zone pricing when origin/destination zones match a rule', async () => {
    // 1️⃣ Seed Configuration
    await Configuration.create({
      minimumDeliveryFee: 25,
      deliveryRate: 2,
      costType: 'distance'
    })

    // 2️⃣ Create origin zone
    const origin = await DeliveryZone.create({
      title: 'Zone A',
      description: 'Test origin zone',
      location: {
        type: 'Polygon',
        coordinates: [
          [
            [31, 30],
            [31, 31],
            [32, 31],
            [31, 30]
          ]
        ]
      }
    })

    // 3️⃣ Create destination zone
    const dest = await DeliveryZone.create({
      title: 'Zone B',
      description: 'Test dest zone',
      location: {
        type: 'Polygon',
        coordinates: [
          [
            [30, 29],
            [30, 31],
            [32, 31],
            [30, 29]
          ]
        ]
      }
    })

    // 4️⃣ Create Zone Pricing Rule
    await DeliveryPriceV2.create({
      originZone: origin._id,
      destinationZone: dest._id,
      baseFare: 20,
      perKmRate: 5,
      minFare: 40,
      surgeMultiplier: 1
    })

    // 5️⃣ Call your calculation logic
    const result = await calculateDeliveryFeeV3({
      originLat: 30.1,
      originLong: 31.1,
      destLat: 29.9,
      destLong: 30.1,
      code: null,
      restaurantId: null
    })

    // 6️⃣ Expect zone pricing to apply
    expect(result.amount).to.equal(40)
    expect(result.isPrepaid).to.equal(false)
  })

  it('should fallback to distance-based pricing when no zone pricing exists', async () => {
    await Configuration.create({
      minimumDeliveryFee: 20,
      deliveryRate: 5,
      costType: 'distance'
    })

    const result = await calculateDeliveryFeeV3({
      originLat: 30.1,
      originLong: 31.1,
      destLat: 30.2,
      destLong: 31.3,
      code: null,
      restaurantId: null
    })

    expect(result.amount).to.be.above(20)
  })

  it('should apply minimumDeliveryFee for short distances', async () => {
    await Configuration.create({
      minimumDeliveryFee: 30,
      deliveryRate: 5,
      costType: 'distance'
    })

    const result = await calculateDeliveryFeeV3({
      originLat: 30.1001,
      originLong: 31.1001,
      destLat: 30.1002,
      destLong: 31.1002,
      code: null,
      restaurantId: null
    })

    expect(result.amount).to.equal(30)
  })

  it('should apply prepaid package and return zero cost', async () => {
    await Configuration.create({
      minimumDeliveryFee: 25,
      deliveryRate: 2,
      costType: 'distance'
    })

    const restaurant = await Restaurant.create({
      name: 'Test Restaurant',
      orderPrefix: 'RS',
      orderId: 1,
      address: 'Test Address',
      tax: 14,
      location: {
        type: 'Point',
        coordinates: [31.2, 30.3]
      }
    })

    await PrepaidDeliveryPackage.create({
      business: restaurant._id,
      totalDeliveries: 10,
      usedDeliveries: 2,
      price: 100,
      maxDeliveryAmount: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000)
    })

    const result = await calculateDeliveryFeeV3({
      originLat: 30.1,
      originLong: 31.1,
      destLat: 30.2,
      destLong: 31.3,
      code: null,
      restaurantId: restaurant._id
    })

    expect(result.amount).to.equal(0)
    expect(result.isPrepaid).to.equal(true)
  })
})
