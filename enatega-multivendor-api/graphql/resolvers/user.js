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
const Area = require('../../models/area')
const {
  normalizeAndValidatePhoneNumber
} = require('../../helpers/normalizePhone')
const axios = require('axios')
const { generatePhoneOTP } = require('../../helpers/otp')

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
    users: async (_, args, context) => {
      console.log('users')
      try {
        //  TODO: need pagination here
        const users = await User.find()
        return users.map(user => {
          return transformUser(user)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    search_users: async (_, args, context) => {
      console.log({ argsSearchUser: { args } })
      // here
      try {
        let query = {}

        if (args.search) {
          const searchRegex = args.search.includes('+2')
            ? args.search
            : `+2${args.search}`
          // if (args.search.length < 11) {
          //   throw new Error('digits_error')
          // }
          query = {
            $or: [{ phone: searchRegex }]
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
        }).lean()
        // restaurants.map(async restaurant => {
        //   const category = await category.find({restaurant});
        // })
        console.log({ restaurants })
        return restaurants
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    async searchUsers(_, args) {
      try {
        const regex = new RegExp(args.search, 'i')
        const users = await User.find({
          $or: [{ name: regex }, { phone: regex }]
        })
        return users
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    searchUsersByBusiness: async (_, args, context) => {
      console.log({ argsSearchUser: { args } })
      try {
        // let query = {}
        const searchRegex = args.searchText.includes('+2')
          ? args.searchText
          : `+2${args.searchText}`
        if (args.searchText.length < 11) {
          throw new Error('digits_error')
        }
        // if (args.searchText) {
        //   // const searchRegex = { $regex: args.search, $options: 'i' } // Case-insensitive search

        //   query = {
        //     $or: [
        //       { name: searchRegex },
        //       { email: searchRegex },
        //       { phone: searchRegex }
        //     ]
        //   }
        // }
        // Fetch the user based on the query
        // const user = await User.findOne(query) // Fetch user from DB
        const user = await User.findOne({ phone: searchRegex }) // Fetch user from DB
        // Check if any user were found
        if (!user) {
          throw new Error('no_user_found')
        }

        // Transform the user data
        // return user.map(user => {
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
        // })
      } catch (err) {
        console.error('Error occurred while searching users:', err)
        throw new Error('Error occurred while searching users: ' + err.message)
      }
    },
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
        let address = {}
        if (userInput?.addresses?.length) {
          address = userInput?.addresses[0]
          address['details'] = userInput?.address_free_text
          address['location'] = {
            type: 'Point',
            coordinates: [address.longitude, address.latitude]
          }

          delete address['latitude']
          delete address['longitude']

          console.log('address@@@@@@@@@@', address)
        }

        if (userInput?.area) {
          const area = await Area.findById(userInput.area).populate('location')
          console.log({ area })
          address['deliveryAddress'] = area?.address
          address['label'] = area?.title
          address['details'] = userInput?.address_free_text
          address['location'] = {
            type: 'Point',
            coordinates: [
              // wrong
              area.location.location.coordinates[0],
              area.location.location.coordinates[1]
            ]
          }
        }
        // If the user doesn't exist, create a new user
        const phone = userInput?.phone?.replace('+2', '')
        const newUser = new User({
          name: userInput.name,
          phone: `+2${phone}`,
          governate: userInput.governate,
          address_free_text: userInput.address_free_text,
          addresses: address || [],
          email: userInput.email || '',
          userType: 'default',
          emailIsVerified: false,
          phoneIsVerified: false,
          isActive: true,
          area: userInput.area || null
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

    async updateUserAddress(_, { userInput }) {
      console.log({ updateUserAddress: { userInput } })
      try {
        const user = await User.findById(userInput.userId)
        console.log({ user })
        let addresses = [...userInput.addresses]
        let address = {}

        if (userInput?.addresses?.length) {
          addresses = addresses?.map(singleAddress => {
            singleAddress['location'] = {
              type: 'Point',
              coordinates: [singleAddress.longitude, singleAddress.latitude]
            }
            delete singleAddress['latitude']
            delete singleAddress['longitude']
            console.log('singleAddress@@@@@@@@@@', singleAddress)
            return singleAddress
          })
        }

        if (userInput?.area) {
          const area = await Area.findById(userInput.area).populate('location')
          console.log({ area })
          address['deliveryAddress'] = area?.address
          address['label'] = area?.title
          address['details'] = userInput?.address_free_text
            ? userInput?.address_free_text
            : userInput?.details
          address['location'] = {
            type: 'Point',
            coordinates: [
              area.location.location.coordinates[0],
              area.location.location.coordinates[1]
            ]
          }
        }
        if (userInput.addresses?.length) {
          user.addresses = [...user.addresses, ...addresses]
          console.log({ userAddresses: user?.addresses })
        }
        if (userInput.area) {
          user.addresses = [...user.addresses, address]
        }

        await user.save()
        return {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          governate: user.governate,
          address_free_text: user.address_free_text,
          addresses: user.addresses
        }
      } catch (err) {
        throw new Error(err)
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
        const phone = normalizeAndValidatePhoneNumber(args.email)
        console.log({ phone })
        const emailExists = await User.findOne({
          $or: [{ email: args.email }, { phone }]
        })
        console.log({ emailExists })
        if (emailExists) {
          return emailExists
        } else {
          return 'null'
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    phoneExist: async (_, args, { res, req }) => {
      console.log('CheckingPhone', { args })
      try {
        const phone = normalizeAndValidatePhoneNumber(args.phone)
        console.log({ phone })
        if (!phone) throw new Error('wrong_credentials')
        const phoneExist = await User.findOne({ phone })
        console.log({ phoneExist })

        if (phoneExist && !phoneExist.firstTimeLogin) {
          return phoneExist
        } else if (phoneExist && phoneExist.firstTimeLogin) {
          throw new Error('user_first_time_login')
        } else {
          throw new Error('phone_doesnt_exist')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    createUser: async (_, args, context) => {
      console.log('createUser', args.userInput)
      try {
        let phone

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
          phone = normalizeAndValidatePhoneNumber(args.userInput.phone)
          console.log({ phone })
          const existingPhone = await User.findOne({
            phone
          })
          if (existingPhone) {
            throw new Error('Phone is already associated with another account.')
          }
        }
        // const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
        const generateVerificationCode = () => {
          const code = Math.floor(1000 + Math.random() * 9000)
          return String(code).split('').map(Number)
        }
        const code = generateVerificationCode()
        console.log({ code })
        const userDetails = {
          appleId: args.userInput.appleId,
          email: args.userInput.email,
          // password: hashedPassword,
          phone,
          name: args.userInput.name,
          notificationToken: args.userInput.notificationToken,
          isOrderNotification: !!args.userInput.notificationToken,
          isOfferNotification: !!args.userInput.notificationToken,
          userType: 'default',
          emailIsVerified: false,
          emailVerficationCode: code
        }

        const user = new User(userDetails)
        console.log({ emailVerficationCode: user.emailVerficationCode })
        // sendUserInfoToZapier({
        //   email: args.userInput.email,
        //   phone: args.userInput.phone,
        //   name: args.userInput.name
        // })
        await user.setPassword(args.userInput.password)
        const result = await user.save()
        const attachment = path.join(
          __dirname,
          '../../public/assets/tempImages/enatega.png'
        )

        const signupTemp = await signupTemplate({
          ...args.userInput,
          code: user.emailVerficationCode
        })
        if (args.userInput.email?.length) {
          sendEmail(
            result.email,
            'Account Creation',
            signupText,
            signupTemp,
            attachment
          )
        }
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

      try {
        if (args.updateUserInput.phone !== user.phone) {
          user.phoneIsVerified = args.updateUserInput.phoneIsVerified
        }

        user.name = args.updateUserInput.name

        const result = await user.save()
        return transformUser(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    async updatePhone(_, args, { req }) {
      console.log('updatePhone', { args })
      try {
        const user = await User.findById(req.userId)
        if (!user) throw new Error('User does not exist')
        user.phone = normalizeAndValidatePhoneNumber(args.phone)
        await user.save()
        return { message: 'phone_updated' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async updateEmail(_, args, { req }) {
      console.log('updateEmail', { args })
      try {
        const user = await User.findById(req.userId)
        if (!user) throw new Error('User does not exist')
        // if (user.email !== args.email) {
        user.email = args.email
        // }
        await user.save()
        return { message: 'email_updated' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async validatePhone(_, args, { req }) {
      console.log('validatePhone', { args })
      if (!req.userId) throw new Error('unauthenticated')
      try {
        axios.defaults.headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Language': 'en-US'
        }
        const user = await User.findById(req.userId)
        const phoneNumber = normalizeAndValidatePhoneNumber(
          args.phone
        )?.replace('+', '')
        if (!phoneNumber) throw new Error('wrong_credentials')

        const otp = generatePhoneOTP()

        console.log({ phoneNumber, otp })

        const body = {
          username: 'w8pRT869',
          password: 'Oqo48lklp',
          // sendername: 'Sms plus',
          sendername: 'Kayan',
          mobiles: phoneNumber,
          message: `أوردرات: رمز التحقق الخاص بك هو: ${otp}`
        }
        console.log({ body })

        const url = `https://smssmartegypt.com/sms/api/?username=${body.username}&password=${body.password}&sendername=${body.sendername}&mobiles=${body.mobiles}&message=${body.message}`

        const res = await axios.post(url)
        if (res.data.type === 'error') {
          throw new Error(res.data.error.msg)
        }
        user.phoneOTP = otp
        user.phoneOtpExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
        await user.save()
        console.log({ res: res?.data })

        // console.log({ res: res?.data[0].data })
        return { message: 'otp_message_sent' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async validatePhoneUnauth(_, args) {
      console.log('validatePhoneUnauth', { args })
      try {
        axios.defaults.headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Language': 'en-US'
        }
        const phoneNumber = normalizeAndValidatePhoneNumber(args.phone)
        console.log({ phoneNumber })
        if (!phoneNumber) throw new Error('wrong_credentials')
        const user = await User.findOne({ phone: phoneNumber })
        if (!user) throw new Error('user_doesnt_exist')
        const otp = generatePhoneOTP()

        console.log({ phoneNumber, otp })

        const body = {
          username: 'w8pRT869',
          password: 'Oqo48lklp',
          // sendername: 'Sms plus',
          sendername: 'Kayan',
          mobiles: phoneNumber?.replace('+', ''),
          message: `أوردرات: رمز التحقق الخاص بك هو: ${otp}`
        }
        console.log({ body })

        const url = `https://smssmartegypt.com/sms/api/?username=${body.username}&password=${body.password}&sendername=${body.sendername}&mobiles=${body.mobiles}&message=${body.message}`

        const res = await axios.post(url).catch(err => {
          console.log({ err })
          throw new Error('SMS integration went wrong!')
        })
        user.phoneOTP = otp
        user.phoneOtpExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
        await user.save()
        console.log({ res: res.data })
        // console.log({ res: res.data[0].data })
        return { message: 'otp_message_sent' }
      } catch (err) {
        throw new Error(err)
      }
    },

    async verifyPhoneOTP(_, args, { req }) {
      console.log('verifyPhoneOTP', { args })
      try {
        // const user = await User.findById(req.userId)
        const phone = normalizeAndValidatePhoneNumber(args.phone)
        console.log({ phone })
        const localPart = phone.replace(/[^\d]/g, '').slice(-10)

        // Match any phone ending with this local part
        const regex = new RegExp(`${localPart}$`) // e.g., /1001111111$/
        console.log({ regex })
        const user = await User.findOne({ phone: { $regex: regex } })
        console.log({ user })
        console.log({ userOTP: user.phoneOTP, otp: args.otp })
        // if (user.otpExpiresAt < new Date()) {
        //   throw new Error('otp_expired')
        // }
        if (user.phoneOTP === args.otp) {
          user.phoneIsVerified = true
          user.phoneOTP = null
          user.otpExpiresAt = null
        } else {
          throw new Error('otp_not_match')
        }
        await user.save()
        return { message: 'phone_verified' }
      } catch (err) {
        throw err
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
        const user = await User.findOne({ email: args.email })
        const otp = args.otp.split()
        user.emailVerficationCode = [...otp]
        await user.save()
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
        throw new Error(err)
      }
    },
    async submitEmailOTP(_, args) {
      console.log({ args })
      try {
        const { email, otp } = args
        const user = await User.findOne({ email })
        const code = user.emailVerficationCode.join('')
        if (otp === code) {
          user.emailIsVerified = true
          await user.save()
        } else {
          throw new Error('otp_not_correct')
        }
        return { message: 'Email is confirmed' }
      } catch (err) {
        throw new Error(err)
      }
    },
    async phoneIsVerified(_, args, { req }) {
      try {
        const user = await User.findById(req.userId)
        if (user.phoneIsVerified) {
          return true
        }
        return false
      } catch (err) {
        throw err
      }
    },
    async updateUserName(_, args) {
      console.log('updateUserName', { args })
      try {
        const user = await User.findById(args.id)
        user.name = args.name
        await user.save()
        return { message: 'name_updated' }
      } catch (err) {
        throw err
      }
    }
  }
}
