const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const User = require('../../models/user')
const Restaurant = require('../../models/restaurant')
const { sendEmail, sendTextEmail } = require('../../helpers/email')
const {
  signupTemplate,
  signupText,
  resetPasswordTemplate
} = require('../../helpers/templates')
const { checkPhoneAlreadyUsed } = require('../../helpers/utilities')
const { transformUser, transformRestaurants } = require('./merge')
const { sendOtpToPhone } = require('../../helpers/sms')
const { sendUserInfoToZapier } = require('../../helpers/api')
const Configuration = require('../../models/configuration')

module.exports = {
  Query: {
    profile: async (_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const user = await User.findById(req.userId)
        if (!user) throw new Error('User does not exist')
        return transformUser(user)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    // users: async(_, args, context) => {
    //  console.log('users')
    //   try {
    //      TODO: need pagination here
    //    const users = await User.find()
    //     return users.map(user => {
    //       return transformUser(user)
    //     })
    //   } catch (err) {
    //     console.log(err)
    //     throw err
    //   }
    // },
    search_users: async (_, args, context) => {
      try {
        let query = {}

        if (args.search) {
          const searchRegex = { $regex: args.search, $options: 'i' } // Case-insensitive search
          query = {
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { phone: searchRegex }
            ]
          }
        }

        // Fetch the users based on the query
        const users = await User.find(query) // Fetch users from DB

        // Check if any users were found
        if (!users || users.length === 0) {
          throw new Error('No users found matching the search criteria.')
        }

        // Transform the user data
        return users.map(user => {
          // Map over the user's addresses to get separate latitude and longitude
          const transformedUser = {
            ...user.toObject(), // Convert the mongoose user object to a plain JS object
            addresses: user.addresses.map(address => {
              if (address.location && address.location.coordinates) {
                // Extract longitude and latitude from the coordinates array
                const [longitude, latitude] = address.location.coordinates
                return {
                  ...address.toObject(), // Convert address to plain object
                  longitude, // Add longitude
                  latitude // Add latitude
                }
              }
              return address // If no coordinates, return the address as is
            })
          }

          return transformedUser // Return the transformed user object
        })
      } catch (err) {
        console.error('Error occurred while searching users:', err)
        throw new Error('Error occurred while searching users: ' + err.message)
      }
    },

    userFavourite: async (_, args, { res, req }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        // Fixing zones issues
        // if (!zones.length) return { restaurants: [] }
        // console.log(restaurants)
        const user = await User.findById(req.userId)
        if (!user) throw new Error('Unauthenticated')
        console.log(user)
        const restaurants = await Restaurant.find({
          _id: { $in: user.favourite }
          // zone: { $in: zones.map(z => z.id) },
          // isAvailable: true,
          // isActive: true
        })
        console.log(restaurants)
        return transformRestaurants(restaurants)
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    findOrCreateUser: async (_, { userInput }, context) => {
      console.log('findOrCreateUser', userInput)

      try {
        let existingUser = await User.findOne({
          phone: userInput.phone
        })

        if (existingUser) {
          // If user already exists, return the user data along with the addresses
          return {
            _id: existingUser._id,
            name: existingUser.name,
            phone: existingUser.phone,
            governate: existingUser.governate,
            address_free_text: existingUser.address_free_text,
            addresses: existingUser.addresses
          }
        }

        const address = userInput.addresses?.length
          ? userInput.addresses[0]
          : {}

        address['location'] = {
          type: 'Point',
          coordinates: [address.latitude, address.longitude]
        }

        delete address['latitude']
        delete address['longitude']

        console.log('address@@@@@@@@@@', address)

        // If the user doesn't exist, create a new user
        const newUser = new User({
          name: userInput.name,
          phone: userInput.phone,
          governate: userInput.governate,
          address_free_text: userInput.address_free_text,
          addresses: address || [], // Including both main and additional address
          email: userInput.email || '',
          userType: 'default', // Default user type
          emailIsVerified: userInput.email ? true : false,
          phoneIsVerified: false, // Assuming phone is not verified initially
          isActive: true // Default active status
        })

        // Save the new user to the database
        const savedUser = await newUser.save()

        // Return the newly created user with the addresses array (including additional address)
        return {
          _id: savedUser._id,
          name: savedUser.name,
          phone: savedUser.phone,
          governate: savedUser.governate,
          address_free_text: savedUser.address_free_text,
          addresses: savedUser.addresses
        }
      } catch (err) {
        console.error('Error in findOrCreateUser:', err)
        throw new Error(
          'Error occurred while creating or finding user: ' + err.message
        )
      }
    },
    sendFormSubmission: async (_, args) => {
      console.log('sendFormSubmission', args)
      try {
        const { name, email, message } = args.formSubmissionInput
        if (!name || !email || !message) {
          throw new Error('Invalid input')
        }
        const htmlTemplate = `
          <h3>Form Submission</h3>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Message: ${message}</p>
        `
        const emailResult = await sendTextEmail(
          process.env.FORM_SUBMISSION_EMAIL,
          'Form Submission',
          htmlTemplate
        )
        if (emailResult) {
          return {
            message: 'Form submission was successful',
            status: 'Success'
          }
        } else {
          return {
            message: 'Form submission was not successful',
            status: 'Failed'
          }
        }
      } catch (err) {
        console.log('Error when sending Email', err)
        throw new Error(`Error when sending Email ${err}`)
      }
    },
    emailExist: async (_, args, { res, req }) => {
      console.log('CheckingEmail')
      console.log(args)
      try {
        const emailExist = await User.findOne({
          or: [{ email: args.email }, { phone: args.email }]
        })
        if (emailExist) {
          return emailExist
        } else {
          return 'null'
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    phoneExist: async (_, args, { res, req }) => {
      console.log('CheckingPhone')
      try {
        const phoneExist = await User.findOne({ phone: args.phone })
        if (phoneExist) {
          return phoneExist
        } else {
          return 'null'
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    createUser: async (_, args, context) => {
      console.log('createUser', args.userInput)
      try {
        if (args.userInput.appleId) {
          const existingAppleId = await User.findOne({
            appleId: args.userInput.appleId
          })
          if (existingAppleId) {
            throw new Error('Apple account is already registered. Please Login')
          }
        }
        if (args.userInput.email) {
          const existingEmail = await User.findOne({
            email: args.userInput.email
          })
          if (existingEmail) {
            throw new Error('Email is already associated with another account.')
          }
        }
        if (args.userInput.phone) {
          const existingPhone = await User.findOne({
            phone: args.userInput.phone
          })
          if (existingPhone) {
            throw new Error('Phone is already associated with another account.')
          }
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
        const userDetails = {
          appleId: args.userInput.appleId,
          email: args.userInput.email,
          password: hashedPassword,
          phone: args.userInput.phone,
          name: args.userInput.name,
          notificationToken: args.userInput.notificationToken,
          isOrderNotification: !!args.userInput.notificationToken,
          isOfferNotification: !!args.userInput.notificationToken,
          userType: 'default',
          emailIsVerified: true
        }
        const user = new User(userDetails)

        sendUserInfoToZapier({
          email: args.userInput.email,
          phone: args.userInput.phone,
          name: args.userInput.name
        })

        const result = await user.save()
        const attachment = path.join(
          __dirname,
          '../../public/assets/tempImages/enatega.png'
        )
        const signupTemp = await signupTemplate(args.userInput)
        sendEmail(
          result.email,
          'Account Creation',
          signupText,
          signupTemp,
          attachment
        )
        const token = jwt.sign(
          {
            userId: result.id,
            email: result.email || result.appleId
          },
          process.env.SECRETKEY
        )
        console.log({
          ...result._doc,
          userId: result.id,
          token: token,
          tokenExpiration: 1
        })
        return {
          ...result._doc,
          userId: result.id,
          token: token,
          tokenExpiration: 1
        }
      } catch (err) {
        throw err
      }
    },
    Deactivate: async (_, args, { req, res }) => {
      const deactivateByEmail = await User.findOne({
        email: args.email
      })
      deactivateByEmail.isActive = args.isActive
      console.log(deactivateByEmail)
      await deactivateByEmail.save()
      return deactivateByEmail
    },
    updateUser: async (_, args, { req, res }) => {
      console.log('Update user: ', args.updateUserInput, req.userId)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      const user = await User.findById(req.userId)
      if (!user) throw new Error('Please logout and login again')
      // check if phone number is already associated with another account
      if (
        !(await checkPhoneAlreadyUsed(req.userId, args.updateUserInput.phone))
      ) {
        try {
          if (args.updateUserInput.phone !== user.phone) {
            user.phoneIsVerified = args.updateUserInput.phoneIsVerified
          }
          if (args.updateUserInput.phoneIsVerified) {
            user.phoneIsVerified = args.updateUserInput.phoneIsVerified
          }
          user.name = args.updateUserInput.name
          user.phone = args.updateUserInput.phone
          const result = await user.save()
          return transformUser(result)
        } catch (err) {
          console.log(err)
          throw err
        }
      } else {
        throw new Error(
          'Phone number is already associated with another account'
        )
      }
    },
    updateNotificationStatus: async (_, args, { req, res }) => {
      console.log('updateNotificationStatus')
      try {
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        user.isOfferNotification = args.offerNotification
        user.isOrderNotification = args.orderNotification
        user.save()
        return transformUser(user)
      } catch (e) {
        return false
      }
    },
    addFavourite: async (_, args, { res, req }) => {
      console.log('UpdateFavourite')
      try {
        if (!req.isAuth || !args.id) {
          throw new Error('Unauthenticated!')
        }
        const user = await User.findById(req.userId)
        const checkRestaurant = await user.favourite.findIndex(
          id => id === args.id
        )
        if (checkRestaurant < 0) user.favourite.push(args.id)
        else {
          user.favourite.splice(checkRestaurant, 1)
        }
        // update favourite array
        const result = await user.save()
        return transformUser(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    sendOtpToEmail: async (_, args, { res, req }) => {
      console.log('Send otp to email: ', args.email, args.otp)
      try {
        if (!args.email) throw new Error('Email is required')
        if (!args.otp) throw new Error('Otp is required')
        const resetPasswordTemp = await resetPasswordTemplate(args.otp)
        const attachment = path.join(
          __dirname,
          '../../public/assets/tempImages/enatega.png'
        )
        sendEmail(
          args.email,
          'OTP to confirm email',
          'OTP to confirm email address',
          resetPasswordTemp,
          attachment
        )
        return {
          result: true
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    sendOtpToPhoneNumber: async (_, args, { res, req }) => {
      console.log('Send otp to phone: ', args.phone, args.otp)
      try {
        if (!args.phone) throw new Error('Phone is required')
        if (!args.otp) throw new Error('Otp is required')
        const configuration = await Configuration.findOne()
        if (!configuration.skipMobileVerification) {
          sendOtpToPhone(
            args.phone,
            `Your Enatega phone verfication code is: ${args.otp}`
          )
        }
        return {
          result: true
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}