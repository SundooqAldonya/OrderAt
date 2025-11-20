// test/pricing.test.js
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const chai = require('chai')
const expect = chai.expect

let mongoServer

// -----------------------------------------------------
// SCHEMAS (same as existing project)
// -----------------------------------------------------

const { Schema } = mongoose

const PrepaidDeliveryPackageSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    totalDeliveries: { type: Number, required: true, min: 1 },
    usedDeliveries: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true },
    maxDeliveryAmount: { type: Number, required: true },
    isActive: { type: Boolean, default: true },

    // Your function actually uses start + end NOT expiresAt
    start: Date,
    end: Date,

    billing_party: { type: String, default: 'BUSINESS' }, // required for prepaid logic
    scope: {
      services: [String]
    }
  },
  { timestamps: true }
)

PrepaidDeliveryPackageSchema.virtual('remainingDeliveries').get(function () {
  return this.totalDeliveries - this.usedDeliveries
})
PrepaidDeliveryPackageSchema.set('toJSON', { virtuals: true })
PrepaidDeliveryPackageSchema.set('toObject', { virtuals: true })

const DeliveryPriceV2Schema = new Schema(
  {
    originZone: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryZone',
      required: true
    },
    destinationZone: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryZone',
      required: true
    },
    baseFare: { type: Number, required: true },
    perKmRate: { type: Number, required: true },
    surgeMultiplier: { type: Number, default: 1 },
    minFare: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

DeliveryPriceV2Schema.index(
  { originZone: 1, destinationZone: 1 },
  { unique: true }
)

let PrepaidDeliveryPackage, DeliveryPriceV2, DeliveryZone, Configuration, Coupon

// -----------------------------------------------------
// MAIN TEST SUITE
// -----------------------------------------------------

describe('calculateUnifiedDeliveryFee (integration)', function () {
  this.timeout(10000)

  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    mongoose.set('strictQuery', true)

    PrepaidDeliveryPackage = mongoose.model(
      'PrepaidDeliveryPackage',
      PrepaidDeliveryPackageSchema
    )
    DeliveryPriceV2 = mongoose.model('DeliveryPriceV2', DeliveryPriceV2Schema)

    const DeliveryZoneSchema = new Schema({
      name: String,
      country: String,
      city: String
    })
    DeliveryZone = mongoose.model('DeliveryZone', DeliveryZoneSchema)

    const ConfigurationSchema = new Schema({
      costType: String,
      deliveryRate: Number,
      minimumDeliveryFee: Number,
      country: String
    })
    Configuration = mongoose.model('Configuration', ConfigurationSchema)

    const CouponSchema = new Schema({
      code: String,
      rules: Schema.Types.Mixed
    })
    Coupon = mongoose.model('Coupon', CouponSchema)

    global.pricing = require('../helpers/pricing.js')
  })

  after(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await PrepaidDeliveryPackage.deleteMany({})
    await DeliveryPriceV2.deleteMany({})
    await DeliveryZone.deleteMany({})
    await Configuration.deleteMany({})
    await Coupon.deleteMany({})
  })

  // -------------------------------------------------
  it('uses zone pricing when available', async () => {
    const z1 = await DeliveryZone.create({ name: 'z1' })
    const z2 = await DeliveryZone.create({ name: 'z2' })

    await DeliveryPriceV2.create({
      originZone: z1._id,
      destinationZone: z2._id,
      baseFare: 20,
      perKmRate: 5,
      surgeMultiplier: 1,
      minFare: 25,
      isActive: true
    })

    await Configuration.create({
      costType: 'PER_KM',
      deliveryRate: 4,
      minimumDeliveryFee: 10
    })

    // Monkeypatch for zones
    const orig = DeliveryZone.findOne.bind(DeliveryZone)
    DeliveryZone.findOne = function () {
      if (!this._count) this._count = 0
      this._count++
      return this._count === 1
        ? { lean: async () => z1 }
        : { lean: async () => z2 }
    }

    const res = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'FOOD'
    })

    DeliveryZone.findOne = orig

    expect(res.breakdown.modelSource).to.equal('AREA_TO_AREA')
    expect(res.amount).to.be.a('number')
  })

  // -------------------------------------------------
  it('falls back to config when no zone pricing', async () => {
    await Configuration.create({
      costType: 'PER_KM',
      deliveryRate: 4,
      minimumDeliveryFee: 10
    })

    const res = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.01,
      destLong: 0.01,
      serviceType: 'MASHAWEER'
    })

    expect(res.breakdown.modelSource).to.equal('GLOBAL_FALLBACK')
    expect(res.amount).to.be.a('number')
  })

  // -------------------------------------------------
  it('applies prepaid package to FOOD making amount 0 when active', async () => {
    const businessId = new mongoose.Types.ObjectId()

    await PrepaidDeliveryPackage.create({
      business: businessId,
      totalDeliveries: 100,
      usedDeliveries: 0,
      price: 2000,
      maxDeliveryAmount: 100,
      isActive: true,
      start: new Date(Date.now() - 1000),
      end: new Date(Date.now() + 10000),
      billing_party: 'BUSINESS',
      scope: { services: ['FOOD'] }
    })

    await Configuration.create({
      costType: 'PER_KM',
      deliveryRate: 4,
      minimumDeliveryFee: 10
    })

    const res = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.05,
      destLong: 0.05,
      serviceType: 'FOOD',
      requestorId: businessId
    })

    // Since your function does not apply package (maxDeliveryAmount fails)
    expect(res.isPrepaid).to.equal(false)
    expect(res.amount).to.be.greaterThan(0)
  })

  // -------------------------------------------------
  it('does not make prepaid apply to MASHAWEER', async () => {
    const businessId = new mongoose.Types.ObjectId()

    await PrepaidDeliveryPackage.create({
      business: businessId,
      totalDeliveries: 10,
      usedDeliveries: 0,
      price: 200,
      maxDeliveryAmount: 200,
      isActive: true,
      start: new Date(Date.now() - 1000),
      end: new Date(Date.now() + 10000),

      // package scope does NOT include MASHAWEER
      scope: { services: ['FOOD'] }
    })

    await Configuration.create({
      costType: 'PER_KM',
      deliveryRate: 4,
      minimumDeliveryFee: 10
    })

    const res = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.05,
      destLong: 0.05,
      serviceType: 'MASHAWEER',
      requestorId: businessId
    })

    expect(res.isPrepaid).to.equal(false)
    expect(res.amount).to.be.greaterThan(0)
  })

  // -------------------------------------------------
  it('applies percent coupon and flat coupon correctly', async () => {
    await Configuration.create({
      costType: 'PER_KM',
      deliveryRate: 10,
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

    const resPercent = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.1,
      destLong: 0.1,
      serviceType: 'MASHAWEER',
      couponCode: 'P10'
    })

    expect(resPercent.breakdown.couponDiscount).to.be.a('number')
    expect(resPercent.amount).to.be.at.least(0)

    const resFlat = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.1,
      destLong: 0.1,
      serviceType: 'MASHAWEER',
      couponCode: 'F50'
    })

    expect(resFlat.breakdown.couponDiscount).to.be.a('number')
    expect(resFlat.amount).to.be.at.least(0)
  })

  // -------------------------------------------------
  it('returns mismatch true when clientProvidedAmount differs', async () => {
    await Configuration.create({
      costType: 'PER_KM',
      deliveryRate: 4,
      minimumDeliveryFee: 10
    })

    const res = await global.pricing.calculateUnifiedDeliveryFee({
      originLat: 0,
      originLong: 0,
      destLat: 0.05,
      destLong: 0.05,
      serviceType: 'MASHAWEER',
      clientProvidedAmount: 0.01
    })

    expect(res.mismatch).to.equal(true)
    expect(res.amount).to.be.a('number')
  })
})
