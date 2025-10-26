const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bannerSchema = new Schema(
  {
    title: {
      type: String
    },
    description: {
      type: String
    },
    // Can be image, video, or gif
    // file: {
    //   type: String
    // },
    image: {
      url: String,
      publicId: String
    },
    action: {
      type: String
    },
    screen: {
      type: String
    },
    // Should be a valid JSON [{key: value}]
    parameters: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Banner', bannerSchema))
myModule.bannerSchema = bannerSchema
