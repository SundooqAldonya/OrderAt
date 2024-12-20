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

module.exports = {
  Mutation: {
    vendorResetPassword: async(_, args, { req, res }) => {
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
    ownerLogin: async(_, { email, password }, context) => {
      console.log('ownerLogin')
      const owner = await Owner.findOne({ email: email })
      if (!owner) {
        throw new Error('User does not exist!')
      }
      const isEqual = await bcrypt.compare(password, owner.password)
      if (!isEqual) {
        throw new Error('Invalid credentials!')
        // throw new Error('Password is incorrect!');
      }
      const token = jwt.sign(
        {
          userId: owner.id,
          email: owner.email,
          userType: owner.userType
        },
        'somesupersecretkey' // TODO: move this key to .env and use that everywhere
      )
      const result = await transformOwner(owner)
      return {
        ...result,
        token: token
      }
    },
    login: async(
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
      let isNewUser = false
      var user = appleId
        ? await User.findOne({ appleId })
        : await User.findOne({ email })
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
        user = await User.findOne({ phone: email })
        if (!user) throw new Error('User does not exist!')
      }
      if (type === 'default') {
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
          throw new Error('Invalid credentials!')
          // throw new Error('Password is incorrect!');
        }
      }
      user.notificationToken = notificationToken
      const result = await user.save()

      const token = jwt.sign(
        {
          userId: result.id,
          email: result.email || result.appleId
        },
        'somesupersecretkey'
      )
      if (isNewUser) {
        const attachment = path.join(
          __dirname,
          '../../public/assets/tempImages/enatega.png'
        )
        const signupTemp = await signupTemplate({
          email: result.name,
          password: ''
        })
        sendEmail(result.email, 'Account Creation', '', signupTemp, attachment)
      }
      return {
        ...result._doc,
        email: result.email || result.appleId,
        userId: result.id,
        token: token,
        tokenExpiration: 1,
        isNewUser
      }
    },
    riderLogin: async(_, args, context) => {
      console.log('riderLogin', args.username, args.password)
      const rider = await Rider.findOne({ username: args.username })
      if (!rider) throw new Error('Invalid credentials')

      if (rider.password !== args.password) {
        throw new Error('Invalid credentials')
      }
      rider.notificationToken = args.notificationToken
      await rider.save()

      const token = jwt.sign(
        { userId: rider.id, email: rider.username },
        'somesupersecretkey'
      )
      return {
        ...rider._doc,
        email: rider.username,
        password: '',
        userId: rider.id,
        token: token,
        tokenExpiration: 1
      }
    },
    pushToken: async(_, args, { req, res }) => {
      if (!req.isAuth) throw new Error('Unauthenticated')
      try {
        console.log(args.token)
        const user = await User.findById(req.userId)
        user.notificationToken = args.token
        await user.save()

        return transformUser(user)
      } catch (err) {
        throw err
      }
    },
    forgotPassword: async(_, { email, otp }, context) => {
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
    resetPassword: async(_, { password, email }, context) => {
      console.log(password, email)
      const user = await User.findOne({ email: email })
      if (!user) {
        throw new Error('Something went wrong. Please try again later!')
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      user.password = hashedPassword
      await user.save()
      // validate token against time- not done yet
      // find user from reset object
      // generate hash of password
      // update user
      // remove token from reset collection
      // return result true
      return {
        result: true
      }
    },
    changePassword: async(_, { oldPassword, newPassword }, { req, res }) => {
      console.log('changePassword')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        const isEqual = await bcrypt.compare(oldPassword, user.password)
        if (!isEqual) {
          throw new Error('Invalid credentials!')
          // throw new Error('Password is incorrect!');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        return true
      } catch (e) {
        return false
      }
    },
    uploadToken: async(_, args, context) => {
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
