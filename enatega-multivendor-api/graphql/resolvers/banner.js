const { BANNER_ACTIONS } = require('../../helpers/enum')
const Banner = require('../../models/banner')

module.exports = {
  Query: {
    banners: async() => {
      console.log('banners')
      try {
        const banners = await Banner.find({ isActive: true }).sort({
          createdAt: -1
        })
        return banners.map(banner => ({
          ...banner._doc,
          _id: banner.id
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    bannerActions: async() => {
      console.log('bannerActions')
      try {
        const actions = Object.keys(BANNER_ACTIONS).map(
          action => BANNER_ACTIONS[action]
        )
        return actions
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createBanner: async(_, args, context) => {
      console.log('createBanner')
      try {
        const count = await Banner.countDocuments({
          title: args.bannerInput.title,
          isActive: true
        })
        if (count > 0) throw new Error('Banner already exists')
        const banner = new Banner({
          title: args.bannerInput.title,
          description: args.bannerInput.description,
          file: args.bannerInput.file,
          action: args.bannerInput.action,
          screen: args.bannerInput.screen,
          parameters: args.bannerInput.parameters
        })
        const result = await banner.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editBanner: async(_, args, context) => {
      console.log('editBanner')
      try {
        const banner = await Banner.findById(args.bannerInput._id)
        if (!banner) {
          throw new Error('banner does not exist')
        }
        banner.title = args.bannerInput.title
        banner.description = args.bannerInput.description
        banner.file = args.bannerInput.file
        banner.action = args.bannerInput.action
        banner.screen = args.bannerInput.screen
        banner.parameters = args.bannerInput.parameters
        const result = await banner.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteBanner: async(_, args, context) => {
      console.log('deleteBanner')
      try {
        const banner = await Banner.findById(args.id)
        banner.isActive = false
        const result = await banner.save()
        return result.id
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    banner: async(_, args, context) => {
      console.log('banner', args)
      try {
        const getBanner = await Banner.findOne({
          isActive: true,
          title: args.banner
        })
        if (getBanner) {
          return {
            ...getBanner._doc,
            _id: getBanner.id
          }
        } else {
          throw new Error('Banner not found')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
