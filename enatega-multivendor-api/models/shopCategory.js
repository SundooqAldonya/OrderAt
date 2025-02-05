const { Schema, model } = require('mongoose')

const shopCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = model('ShopCategory', shopCategorySchema)
