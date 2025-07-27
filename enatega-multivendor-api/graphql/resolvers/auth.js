const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const User = require('../../models/user')
const Owner = require('../../models/owner')
const Reset = require('../../models/reset')
const Rider = require('../../models/rider')
const { transformUser, transformOwner } = require('./merge')
const { sendEmail } = require('../../helpers/email')
const {
  resetPasswordTemplate,
  resetPasswordText,
  signupTemplate
} = require('../../helpers/templates')
const { v4 } = require('uuid')
const { OAuth2Client } = require('google-auth-library')
const {
  normalizeAndValidatePhoneNumber
} = require('../../helpers/normalizePhone')

const client = new OAuth2Client(
  '41071470725-ldfj8q61m7k9s9hpcboqmfgpi67skv0e.apps.googleusercontent.com',
  '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',
  `${
    process.env.NODE_ENV === 'production'
      ? 'https://orderat.ai'
      : 'http://localhost:3000'
  }`
)

module.exports = {
  Mutation: {
    vendorResetPassword: async (_, args, { req, res }) => {
      console.log('Change Passsword!')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const owner = await Owner.findById(req.userId)
        if (!owner) {
          throw new Error('Something went wrong. Contact Support!')
        }
        const isEqual = await bcrypt.compare(args.oldPassword, owner.password)
        if (!isEqual) {
          throw new Error('Invalid credentials!')
        }

        const hashedPassword = await bcrypt.hash(args.newPassword, 12)
        owner.password = hashedPassword
        await owner.save()
        return true
      } catch (error) {
        throw error
      }
    },
    ownerLogin: async (_, { email, phone, password }, context) => {
      console.log('ownerLogin')
      const owner = await Owner.findOne({ $or: [{ email }, { phone: email }] })
      if (!owner) {
        throw new Error('User does not exist!')
      }
      // const isEqual = await bcrypt.compare(password, owner.password)
      // if (!isEqual) {
      //   throw new Error('Invalid credentials!')
      //   // throw new Error('Password is incorrect!');
      // }
      const { user, err } = await Owner.authenticate()(owner.email, password)
      if (!user || err) throw new Error("Email and password don't match!")

      const token = jwt.sign(
        {
          userId: owner.id,
          email: owner.email,
          userType: owner.userType
        },
        process.env.SECRETKEY
      )
      const result = await transformOwner(owner)
      return {
        ...result,
        token: token
      }
    },
    async googleAuthCustomerApp(_, args) {
      try {
        const { name, email, sub } = args
        let user = await User.findOne({ email })

        if (!user) {
          user = new User({
            email,
            name,
            userType: 'google',
            emailIsVerified: true
          })
          await user.save()
        }

        const token = jwt.sign(
          { userId: user._id, name: user.name, email: user.email },
          process.env.SECRETKEY
        )

        return { token, user }
      } catch (err) {
        throw new Error(err)
      }
    },
    googleAuth: async (_, { code }) => {
      try {
        // Exchange authorization code for access token and ID token
        const { tokens } = await client.getToken(code)

        // Verify the ID token
        const ticket = await client.verifyIdToken({
          idToken: tokens.id_token,
          audience:
            '41071470725-ldfj8q61m7k9s9hpcboqmfgpi67skv0e.apps.googleusercontent.com'
        })

        const { sub, name, email } = ticket.getPayload()
        console.log({ googleAccount: { name, email, sub } })

        let user = await User.findOne({ email })

        if (!user) {
          user = new User({
            email,
            name,
            // notificationToken,
            // isOrderNotification: !!notificationToken,
            // isOfferNotification: !!notificationToken,
            userType: 'google',
            emailIsVerified: true
          })
          await user.save()
        }
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email || user.appleId
          },
          process.env.SECRETKEY
        )
        return { token, user }
      } catch (error) {
        console.error('Error verifying Google token:', error)
        throw new Error('Something went wrong for google auth')
      }
    },
    login: async (
      _,
      { appleId, email, password, type, name, notificationToken },
      context
    ) => {
      console.log('login', {
        appleId,
        email,
        password,
        type,
        notificationToken
      })
      const phone = normalizeAndValidatePhoneNumber(email)
      console.log({ phone })
      let isNewUser = false
      var user = appleId
        ? await User.findOne({ appleId })
        : await User.findOne({ $or: [{ email, phone }] })

      console.log({ user })
      if (!user && appleId) {
        isNewUser = true
        user = new User({
          appleId,
          email,
          name,
          notificationToken,
          isOrderNotification: !!notificationToken,
          isOfferNotification: !!notificationToken,
          userType: 'apple',
          emailIsVerified: true
        })
      }
      if (!user && type === 'google') {
        isNewUser = true
        user = new User({
          email,
          name,
          notificationToken,
          isOrderNotification: !!notificationToken,
          isOfferNotification: !!notificationToken,
          userType: 'google',
          emailIsVerified: true
        })
      }
      if (!user) {
        user = await User.findOne({
          $or: [{ email }, { phone }]
        })
        if (!user) throw new Error('User does not exist!')
      }
      if (type === 'default') {
        const isValid = await user.authenticate(password)
        if (!isValid.user) throw new Error('Email and password do not match!')
        // const isEqual = await bcrypt.compare(password, user.password)
        // if (!isEqual) {
        //   throw new Error('Invalid credentials!')
        //   // throw new Error('Password is incorrect!');
        // }
      }
      user.notificationToken = notificationToken
      const result = await user.save()
      const token = jwt.sign(
        {
          userId: result._id,
          email: result.email || result.appleId
        },
        process.env.SECRETKEY
      )
      console.log({ isNewUser })

      if (isNewUser) {
        const attachment = path.join(
          __dirname,
          '../../public/assets/tempImages/enatega.png'
        )
        const generateVerificationCode = () => {
          const code = Math.floor(1000 + Math.random() * 9000)
          return String(code).split('').map(Number)
        }
        const signupTemp = await signupTemplate({
          email: result.name,
          password: '',
          code: generateVerificationCode()
        })
        sendEmail(result.email, 'Account Creation', '', signupTemp, attachment)
      }
      return {
        ...result._doc,
        email: result.email || result.appleId,
        userId: result._id,
        token: token,
        tokenExpiration: 1,
        isNewUser
      }
    },
    async customerLogin(_, args) {
      console.log('customerLogin', { args })
      try {
        const phone = normalizeAndValidatePhoneNumber(args.phone)
        if (!phone) throw new Error('wrong_credentials')
        const user = await User.findOne({ phone })

        if (!user) throw new Error('user_not_found')

        const isValid = await user.authenticate(args.password)

        // 👉 Check if authentication failed due to no salt (no password set)
        if (isValid?.error?.name === 'NoSaltValueStoredError') {
          throw new Error('no_password_set')
        }

        if (!isValid.user) {
          throw new Error('phone_password_not_match')
        }

        user.isOnline = true
        user.notificationToken = args.notificationToken
        await user.save()
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            phone: user.phone
          },
          process.env.SECRETKEY
        )

        return {
          token,
          user
        }
      } catch (err) {
        throw err
      }
    },
    riderLogin: async (_, args, context) => {
      try {
        console.log('riderLogin', args.username, args.password)
        const rider = await Rider.findOne({
          username: args.username?.toLowerCase().replace(' ', '')
        })
        if (!rider) throw new Error('Username not registered!')

        if (rider.password !== args.password) {
          throw new Error('Username and password do not match!')
        }

        if (!rider.isActive) {
          throw new Error('Rider is disabled!. Please contact support')
        }
        const token = jwt.sign(
          { userId: rider._id, email: rider.username },
          process.env.SECRETKEY
        )
        rider.notificationToken = args.notificationToken
        rider.isOnline = true
        rider.token = token
        await rider.save()

        return {
          ...rider._doc,
          email: rider.username,
          password: '',
          userId: rider.id,
          token: token,
          tokenExpiration: 1
        }
      } catch (err) {
        console.log({ err })
        throw new Error(err)
      }
    },
    async riderLogout(_, args) {
      try {
        const rider = await Rider.findOne({ token: args.token })
        rider.isOnline = false
        rider.token = null
        rider.notificationToken = null
        await rider.save()
        return { message: 'Rider logged out' }
      } catch (err) {
        throw new Error(err)
      }
    },
    pushToken: async (_, args, { req }) => {
      if (!req.isAuth) throw new Error('Unauthenticated')
      try {
        console.log(args)
        const user = await User.findById(req.userId)
        user.notificationToken = args.token
        user.isOrderNotification = true
        await user.save()

        return transformUser(user)
      } catch (err) {
        throw err
      }
    },
    async disableUserPushNotification(_, args, { req }) {
      if (!req.isAuth) throw new Error('Unauthenticated')
      try {
        const user = await User.findById(req.userId)
        user.notificationToken = null
        user.isOrderNotification = false
        await user.save()
        return { message: 'Disabled user notification token' }
      } catch (err) {
        throw new Error(err)
      }
    },
    forgotPassword: async (_, { email, otp }, context) => {
      console.log('Forgot password: ', email, ' ', otp)
      const user = await User.findOne({ email: email })
      if (!user) {
        throw new Error('User does not exist!')
      }
      // generate token,
      const token = v4()
      const reset = new Reset({
        user: user.id,
        token
      })

      await reset.save()
      const resetPasswordTemp = await resetPasswordTemplate(otp)
      const resetPasswordTxt = resetPasswordText(otp)
      const attachment = path.join(
        __dirname,
        '../../public/assets/tempImages/enatega.png'
      )
      sendEmail(
        user.email,
        'Forgot Password',
        resetPasswordTxt,
        resetPasswordTemp,
        attachment
      )

      // email link for reset password
      return {
        result: true
      }
    },
    resetPassword: async (_, { password, email }, context) => {
      console.log('resetPassword')
      console.log(password, email)
      const user = await User.findOne({ email })
      const owner = await Owner.findOne({ email })
      if (!user && !owner) {
        throw new Error('User is not found!')
      }
      // const hashedPassword = await bcrypt.hash(password, 12)
      // user.password = hashedPassword
      if (user) {
        await user.setPassword(password)
        await user.save()
      }
      if (owner) {
        await owner.setPassword(password)
        await owner.save()
      }
      return {
        result: true
      }
    },
    resetPasswordCustomer: async (_, { password, phone }, context) => {
      console.log('resetPasswordCustomer')
      console.log(password, phone)
      const phoneNumber = normalizeAndValidatePhoneNumber(phone)
      const user = await User.findOne({ phone: phoneNumber })
      if (!user) {
        throw new Error('User is not found!')
      }
      if (user) {
        user.firstTimeLogin = false
        await user.setPassword(password)
        await user.save()
      }
      return {
        result: true
      }
    },
    changePassword: async (_, { oldPassword, newPassword }, { req, res }) => {
      console.log('changePassword')
      if (!req.isAuth) throw new Error('Unauthenticated')
      try {
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }

        const result = await user.authenticate(oldPassword)
        if (!result.user) {
          throw new Error('old_password_wrong')
        }
        user.firstTimeLogin = false
        // Set new password
        await user.setPassword(newPassword)
        await user.save()

        return true
      } catch (err) {
        throw err
      }
    },
    uploadToken: async (_, args, context) => {
      console.log(args.pushToken)
      const user = await Owner.findById(args.id)
      if (!user) {
        throw new Error('User not found')
      }
      user.pushToken = args.pushToken
      const result = await user.save()
      return {
        ...result._doc,
        _id: result.id
      }
    }
  }
}
