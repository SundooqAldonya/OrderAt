const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { expect } = require('chai')

let mongoServer
let pricing

// ---------------------------------------------------------------------------------------
// BOOTSTRAP
// ---------------------------------------------------------------------------------------
before(async function () {
  this.timeout(30000)

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  pricing = require('../helpers/pricing.js')
})

after(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

// ---------------------------------------------------------------------------------------
// UTILS
// ---------------------------------------------------------------------------------------
function stubZones(originZoneDoc, destZoneDoc) {
  const DeliveryZone = mongoose.model('DeliveryZone')
  const original = DeliveryZone.findOne.bind(DeliveryZone)
  let call = 0

  DeliveryZone.findOne = () => ({
    lean: async () => (call++ === 0 ? originZoneDoc : destZoneDoc)
  })

  return () => (DeliveryZone.findOne = original)
}

function stubCity(cityDoc) {
  const CityModel = mongoose.model('City')
  const original = CityModel.findOne.bind(CityModel)
  CityModel.findOne = () => ({ lean: async () => cityDoc })
  return () => (CityModel.findOne = original)
}

// ---------------------------------------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------------------------------------
describe('calculateUnifiedDeliveryFee - FULL TEST SUITE', function () {
  this.timeout(20000)

  /**
   * 1️⃣ Requestor Override
   */
  it('1. RequestorOverride applies correctly', async () => {
    const RequestorOverride = mongoose.models.RequestorOverride
    const requestorId = new mongoose.Types.ObjectId()

    await RequestorOverride.create({
      requestor_id: requestorId,
      requestor_type: 'Business', // REQUIRED
      service: 'MASHAWEER',
      model: 'FIXED',
      params: { fixed: 77 },
      status: 'ACTIVE'
    })

    const restoreZones = stubZones(null, null)
    const restoreCity = stubCity(null)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER',
      requestorId
    })

    restoreZones()
    restoreCity()

    expect(res.amount).to.equal(77)
    expect(res.breakdown.modelSource).to.equal('REQUESTOR_OVERRIDE')
  })

  /**
   * 2️⃣ Prepaid Package (FOOD)
   */
  it('2. Prepaid package applies for FOOD', async () => {
    const Restaurant = mongoose.models.Restaurant
    const PrepaidDeliveryPackage = mongoose.models.PrepaidDeliveryPackage

    const restaurant = await Restaurant.create({
      name: 'Food Biz',
      country: new mongoose.Types.ObjectId()
    })

    await PrepaidDeliveryPackage.create({
      business: restaurant._id,
      totalDeliveries: 10,
      usedDeliveries: 2,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
      price: 200, // REQUIRED
      maxDeliveryAmount: 50
    })

    const restoreZones = stubZones(null, null)
    const restoreCity = stubCity(null)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.02,
      destLong: 0.02,
      serviceType: 'FOOD',
      requestorId: restaurant._id
    })

    restoreZones()
    restoreCity()

    expect(res.amount).to.equal(0)
    expect(res.isPrepaid).to.equal(true)
    expect(res.breakdown.modelSource).to.equal('PREPAID_PACKAGE')
  })

  /**
   * 3️⃣ Zone → Zone
   */
  it('3. Zone → Zone pricing applies', async () => {
    const DeliveryZone = mongoose.models.DeliveryZone
    const DeliveryPrice = mongoose.models.DeliveryPrice

    const z1 = await DeliveryZone.create({
      title: 'Z1',
      description: 'Z1',
      location: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
          ]
        ]
      }
    })
    const z2 = await DeliveryZone.create({
      title: 'Z2',
      description: 'Z2',
      location: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
          ]
        ]
      }
    })

    await DeliveryPrice.create({
      service: 'MASHAWEER',
      originZone: z1._id,
      destinationZone: z2._id,
      cost: 33
    })

    const restoreZones = stubZones(z1, z2)
    const restoreCity = stubCity(null)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    restoreZones()
    restoreCity()

    expect(res.amount).to.equal(33)
    expect(res.breakdown.modelSource).to.equal('AREA_TO_AREA')
  })

  /**
   * 4️⃣ City Pricing
   */
  it('4. City pricing applies when no zone or override exists', async () => {
    const City = mongoose.models.City
    const CityPricing = mongoose.models.CityPricing

    const city = await City.create({ title: 'City A' })

    await CityPricing.create({
      city: city._id,
      service: 'MASHAWEER',
      model: 'PER_KM',
      params: { per_km: 6, min_fee: 20 },
      status: 'ACTIVE'
    })

    const restoreZones = stubZones(null, null)
    const restoreCity = stubCity(city)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    restoreZones()
    restoreCity()

    expect(res.breakdown.modelSource).to.equal('CITY_DEFAULT')
    expect(res.amount).to.be.at.least(20)
  })

  /**
   * 5️⃣ Country Pricing
   */
  it('5. Country pricing applies when restaurant country exists', async () => {
    const Restaurant = mongoose.models.Restaurant
    const CountryPricing = mongoose.models.CountryPricing

    const countryId = new mongoose.Types.ObjectId()

    const restaurant = await Restaurant.create({
      name: 'Biz',
      country: countryId
    })

    await CountryPricing.create({
      country: countryId,
      service: 'MASHAWEER',
      model: 'FIXED',
      params: { fixed: 55 },
      status: 'ACTIVE'
    })

    const restoreZones = stubZones(null, null)
    const restoreCity = stubCity(null)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER',
      requestorId: restaurant._id
    })

    restoreZones()
    restoreCity()

    expect(res.amount).to.equal(55)
    expect(res.breakdown.modelSource).to.equal('COUNTRY_DEFAULT')
  })

  /**
   * 6️⃣ Global Pricing
   */
  it('6. Global pricing applies as final fallback', async () => {
    const GlobalPricing = mongoose.models.GlobalDeliveryPricing

    await GlobalPricing.create({
      model: 'PER_KM',
      params: { per_km: 5 },
      minimumDeliveryFee: 12
    })

    const restoreZones = stubZones(null, null)
    const restoreCity = stubCity(null)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    restoreZones()
    restoreCity()

    expect(res.breakdown.modelSource).to.equal('GLOBAL_DELIVERY_PRICING')
    expect(res.amount).to.equal(12)
  })

  /**
   * 7️⃣ Coupon
   */
  it('7. Coupon discount applies to delivery', async () => {
    const GlobalPricing = mongoose.models.GlobalDeliveryPricing
    const Coupon = mongoose.models.Coupon

    await GlobalPricing.create({
      model: 'FIXED',
      params: { fixed: 40 }
    })

    await Coupon.create({
      code: 'P10',
      rules: {
        applies_to: ['delivery'],
        discount_type: 'percent',
        discount_value: 10,
        max_discount: 10
      }
    })

    const restoreZones = stubZones(null, null)
    const restoreCity = stubCity(null)

    const res = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.02,
      destLong: 0.02,
      serviceType: 'MASHAWEER',
      couponCode: 'P10'
    })

    restoreZones()
    restoreCity()

    expect(res.breakdown.couponDiscount).to.equal(4)
    expect(res.amount).to.equal(36)
  })
})
