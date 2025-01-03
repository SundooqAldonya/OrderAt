const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addonSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    // TODO: can this be changed to { type: [String], default:[] }
    // or look into other ways ho we can give it default value.
    options: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option'
      }
    ],
    quantityMinimum: {
      type: Number,
      required: true
    },
    quantityMaximum: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    variation: {
      type: Schema.Types.ObjectId,
      ref: 'Variation'
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Addon', addonSchema))
myModule.addonSchema = addonSchema
