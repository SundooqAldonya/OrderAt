// test/unifiedDeliveryFee.test.js
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
  const uri = mongoServer.getUri()

  mongoose.models = {}
  mongoose.modelSchemas = {}
  if (mongoose.connection) mongoose.connection.models = {}

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

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

  DeliveryZone.findOne = function () {
    call++
    if (call === 1) return { lean: async () => originZoneDoc }
    return { lean: async () => destZoneDoc }
  }

  return () => (DeliveryZone.findOne = original)
}

const City = mongoose.model(
  'City',
  new mongoose.Schema({
    title: String
  })
)

const Country = mongoose.model(
  'Country',
  new mongoose.Schema({
    id: Number,
    name: String,
    iso2: String
  })
)

async function createValidZone({ title, description, cityId, countryId }) {
  const DeliveryZone = mongoose.model('DeliveryZone')

  return await DeliveryZone.create({
    title,
    description,
    isActive: true,
    city: cityId,
    country: countryId, // IMPORTANT: ensures CountryPricing fires
    location: {
      type: 'Polygon',
      coordinates: [
        [
          [30.0, 30.0],
          [30.1, 30.0],
          [30.1, 30.1],
          [30.0, 30.1],
          [30.0, 30.0]
        ]
      ]
    }
  })
}

// ---------------------------------------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------------------------------------
describe('calculateUnifiedDeliveryFee - FULL TEST SUITE', function () {
  this.timeout(20000)

  // 1. RequestorOverride
  it('1. RequestorOverride applies correctly', async () => {
    const city = await City.create({ title: 'C1' })

    const z1 = await createValidZone({
      title: 'Zone 1',
      description: 'Origin',
      cityId: city._id
    })

    const z2 = await createValidZone({
      title: 'Zone 2',
      description: 'Destination',
      cityId: city._id
    })

    const RequestorOverride = mongoose.model('RequestorOverride')
    const requestorId = new mongoose.Types.ObjectId()

    await RequestorOverride.create({
      requestor_id: requestorId,
      requestor_type: 'Business',
      service: 'MASHAWEER',
      model: 'FIXED',
      params: { fixed: 77 },
      status: 'ACTIVE'
    })

    const restore = stubZones(z1, z2)

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER',
      requestorId
    })

    restore()

    expect(result.amount).to.equal(77)
    expect(result.breakdown.modelSource).to.equal('REQUESTOR_OVERRIDE')
  })

  // 2. Prepaid (FOOD)
  it('2. Prepaid package applies to FOOD', async () => {
    const city = await City.create({ title: 'C2' })

    const z1 = await createValidZone({
      title: 'Zone 1',
      description: 'test',
      cityId: city._id
    })

    const z2 = await createValidZone({
      title: 'Zone 2',
      description: 'test',
      cityId: city._id
    })

    const PrepaidDeliveryPackage = mongoose.model('PrepaidDeliveryPackage')
    const requestorId = new mongoose.Types.ObjectId()

    await PrepaidDeliveryPackage.create({
      business: requestorId,
      totalDeliveries: 5,
      usedDeliveries: 0,
      price: 200,
      maxDeliveryAmount: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 10000000)
    })

    const restore = stubZones(z1, z2)

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'FOOD',
      requestorId
    })

    restore()

    expect(result.amount).to.equal(0)
    expect(result.isPrepaid).to.equal(true)
    expect(result.breakdown.modelSource).to.equal('PREPAID_PACKAGE')
  })

  // 3. Zone→Zone cost
  it('3. Zone → Zone old pricing applies', async () => {
    const city = await City.create({ title: 'C3' })

    const z1 = await createValidZone({
      title: 'Zone 1',
      description: 'test',
      cityId: city._id
    })

    const z2 = await createValidZone({
      title: 'Zone 2',
      description: 'test',
      cityId: city._id
    })

    const DeliveryPrice = mongoose.model('DeliveryPrice')
    await DeliveryPrice.create({
      originZone: z1._id,
      destinationZone: z2._id,
      cost: 33
    })

    const restore = stubZones(z1, z2)

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    restore()

    expect(result.amount).to.equal(33)
    expect(result.breakdown.modelSource).to.equal('AREA_TO_AREA')
  })

  // 4. City Pricing
  it('4. City pricing fallback works', async () => {
    const city = await City.create({ title: 'C4' })

    const z1 = await createValidZone({
      title: 'Zone 1',
      description: 'test',
      cityId: city._id
    })

    const z2 = await createValidZone({
      title: 'Zone 2',
      description: 'test',
      cityId: city._id
    })

    const CityPricing = mongoose.model('CityPricing')

    await CityPricing.create({
      city: city._id,
      service: 'MASHAWEER',
      model: 'PER_KM',
      params: { per_km: 9, min_fee: 7 },
      status: 'ACTIVE'
    })

    const restore = stubZones(z1, z2)

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.001,
      destLong: 0.001,
      serviceType: 'MASHAWEER'
    })

    restore()

    expect(result.breakdown.modelSource).to.equal('CITY_DEFAULT')
    expect(result.amount).to.be.at.least(7)
  })

  // 5. Country Pricing (FIXED)
  it('5. Country pricing fallback works', async () => {
    const city = await City.create({ title: 'C5' })

    const country = await Country.create({
      id: 1,
      name: 'Egypt',
      iso2: 'EG'
    })

    const z1 = await createValidZone({
      title: 'Zone 1',
      description: 'test',
      cityId: city._id,
      countryId: country._id
    })

    const z2 = await createValidZone({
      title: 'Zone 2',
      description: 'test',
      cityId: city._id,
      countryId: country._id
    })

    const CountryPricing = mongoose.model('CountryPricing')

    await CountryPricing.create({
      country: country._id,
      service: 'MASHAWEER',
      model: 'FIXED',
      params: { fixed: 55 }, // EXPECTED VALUE
      status: 'ACTIVE'
    })

    const restore = stubZones(z1, z2)

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    restore()

    expect(result.amount).to.equal(55)
    expect(result.breakdown.modelSource).to.equal('COUNTRY_DEFAULT')
  })

  // 6. GlobalPricing PER_KM
  it('6. Global pricing fallback works (PER_KM)', async () => {
    const GlobalPricing = mongoose.model('GlobalDeliveryPricing')

    await GlobalPricing.create({
      model: 'PER_KM',
      params: { per_km: 2, min_fee: 1 },
      minimumDeliveryFee: 10
    })

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    expect(result.breakdown.modelSource).to.equal('GLOBAL_DELIVERY_PRICING')
    expect(result.amount).to.be.at.least(10)
  })

  // 7. Global FIXED ignores minimum fee
  it('7. Global using FIXED PRICE -- ignores minimum fee', async () => {
    const GlobalPricing = mongoose.model('GlobalDeliveryPricing')

    await GlobalPricing.deleteMany({})
    await GlobalPricing.create({
      model: 'FIXED',
      params: { fixed: 44 },
      minimumDeliveryFee: 10
    })

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.001,
      destLong: 0.001,
      serviceType: 'MASHAWEER'
    })

    expect(result.amount).to.equal(44)
  })

  // 8. Coupon Logic (fixed)
  it('8. Coupon logic works (percent & flat)', async () => {
    it('8. Coupon logic works (percent & flat)', async () => {
      const Coupon = mongoose.model('Coupon')
      const GlobalPricing = mongoose.model('GlobalDeliveryPricing')

      await Coupon.deleteMany({})
      await GlobalPricing.deleteMany({})

      await GlobalPricing.create({
        model: 'PER_KM',
        params: { per_km: 12 },
        minimumDeliveryFee: 5
      })

      await Coupon.create({
        code: 'P10',
        rules: {
          applies_to: ['delivery'],
          discount_type: 'percent',
          discount_value: 10,
          max_discount: 100
        }
      })

      await Coupon.create({
        code: 'F50',
        rules: {
          applies_to: ['delivery'],
          discount_type: 'flat',
          discount_value: 50,
          max_discount: 50
        }
      })

      const resPercent = await pricing.calculateUnifiedDeliveryFee({
        originLat: 0,
        originLong: 0,
        destLat: 0.2,
        destLong: 0.2,
        serviceType: 'MASHAWEER',
        couponCode: 'P10'
      })

      expect(resPercent.breakdown.couponDiscount).to.be.a('number')
      expect(resPercent.breakdown.couponDiscount).to.be.above(0)

      const resFlat = await pricing.calculateUnifiedDeliveryFee({
        originLat: 0,
        originLong: 0,
        destLat: 0.2,
        destLong: 0.2,
        serviceType: 'MASHAWEER',
        couponCode: 'F50'
      })

      expect(resFlat.breakdown.couponDiscount).to.be.a('number')
      expect(resFlat.breakdown.couponDiscount).to.be.above(0)
    })
  })

  // 9. mismatch protection
  it('9. mismatch true when clientProvidedAmount differs', async () => {
    const GlobalPricing = mongoose.model('GlobalDeliveryPricing')

    await GlobalPricing.create({
      model: 'PER_KM',
      params: { per_km: 4, min_fee: 5 },
      minimumDeliveryFee: 10
    })

    const result = await pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.05,
      destLong: 0.05,
      serviceType: 'MASHAWEER',
      clientProvidedAmount: 0.01
    })

    expect(result.mismatch).to.equal(true)
  })
})
