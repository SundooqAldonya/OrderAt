const Food = require('../models/food')
const Order = require('../models/order')
const BusinessCategory = require('../models/BusinessCategory')

const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'djh6rjqp0',
  api_key: '374324763112167',
  api_secret: 'psXgMn901Y_sqcB0EgqWw6Mi4O8'
})

module.exports = {
  cloudinary,
  uploadFoodImage2() {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(new Error('Upload failed'))
          } else {
            console.log({ image: result.secure_url })
            resolve(result.secure_url) // Resolve the promise with the secure URL
          }
        }
      )
      return stream
    })
  },
  async uploadFoodImage({ id, file }) {
    console.log({ file })
    try {
      const { createReadStream, filename, mimetype, encoding } = await file.file
      const stream = createReadStream()
      let result_url
      const image = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto'
        },
        async (error, result) => {
          if (error) {
            throw new Error('Upload failed')
          }
          console.log({ image: result.secure_url })
          const food = await Food.findById(id)
          food.image = result.secure_url
          console.log({ food })
          result_url = result.secure_url
          await food.save()
          return result.secure_url // Return the URL of the uploaded image
        }
      )

      stream.pipe(image)
      // console.log({ image: image })
      return { message: 'image uploaded' }
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  async uploadReceiptImage({ id, file }) {
    console.log({ file })
    try {
      const { createReadStream, filename, mimetype, encoding } = await file.file
      const stream = createReadStream()
      let result_url
      const image = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto'
        },
        async (error, result) => {
          if (error) {
            throw new Error('Upload failed')
          }
          console.log({ image: result.secure_url })
          const order = await Order.findById(id)
          order.pickedImage.url = result.secure_url
          order.pickedImage.publicId = result.public_id
          console.log({ order })
          result_url = result.secure_url
          await order.save()
          return result.secure_url // Return the URL of the uploaded image
        }
      )

      stream.pipe(image)
      // console.log({ image: image })
      return { message: 'image uploaded' }
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  },

  async uploadImage({ file }) {
    try {
      const { createReadStream } = await file.file
      const stream = createReadStream()

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(new Error('Upload failed: ' + error.message))
            } else {
              resolve(result)
            }
          }
        )

        stream.pipe(uploadStream)
      })

      console.log({
        url: result.url,
        secure_url: result.secure_url,
        public_id: result.public_id
      })

      return {
        url: result.url,
        secure_url: result.secure_url,
        public_id: result.public_id
      }
    } catch (err) {
      console.error(err)
      throw new Error(err.message || 'Unknown upload error')
    }
  }
}
