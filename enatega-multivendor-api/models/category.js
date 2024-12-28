const mongoose = require('mongoose')
const { foodSchema } = require('./food')

const Schema = mongoose.Schema

const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
    // foods: {
    //   type: [foodSchema]
    // }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Category', categorySchema))
myModule.categorySchema = categorySchema
