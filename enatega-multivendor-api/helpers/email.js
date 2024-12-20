const sgMail = require('@sendgrid/mail')
const nodemailer = require('nodemailer')
const Configuration = require('../models/configuration')

const sendEmail = async(to, subject, text, template, attachment) => {
  const configuration = await Configuration.findOne()
  if (!configuration || !configuration.enableEmail) {
    console.log('Invalid email configuration')
    return
  }

  if (configuration.sendGridEnabled) {
    // Use SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
      to,
      from: {
        name: configuration.sendGridEmailName,
        email: configuration.sendGridEmail
      },
      subject,
      html: template,
      attachments: []
    }

    try {
      await sgMail.send(msg)
      console.log(`Email sent successfully to ${to} using SendGrid`)
    } catch (error) {
      console.error('Error sending email using SendGrid:', error)
    }
  } else {
    // Use nodemailer with hardcoded credentials
    const emailer = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configuration.emailName,
        pass: configuration.password
      }
    })

    const mailOptions = {
      from: { name: configuration.emailName, email: configuration.email },
      to,
      subject,
      html: template,
      attachments: []
    }

    emailer.sendMail(mailOptions, err => {
      if (err) {
        console.error('Error sending email using nodemailer:', err)
      } else {
        console.log(`Email sent successfully to ${to} using nodemailer`)
      }
    })
  }
}

const sendTextEmail = async(to, subject, template) => {
  const configuration = await Configuration.findOne()
  if (!configuration || !configuration.enableEmail) return false

  if (configuration.sendGridEnabled) {
    // Use SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
      to,
      from: {
        name: configuration.sendGridEmailName,
        email: configuration.sendGridEmail
      },
      subject,
      html: template
    }

    try {
      await sgMail.send(msg)
      console.log('Email sent successfully using SendGrid')
      return true
    } catch (error) {
      console.error('Error sending email using SendGrid:', error)
      return false
    }
  } else {
    // Use nodemailer with hardcoded credentials
    const emailer = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configuration.emailName,
        pass: configuration.password
      }
    })

    const mailOptions = {
      from: { name: configuration.emailName, address: configuration.email },
      to,
      subject,
      html: template
    }

    emailer.sendMail(mailOptions, err => {
      if (err) {
        console.error('Error sending email using nodemailer:', err)
        return false
      } else {
        console.log('Email sent successfully using nodemailer')
        return true
      }
    })
  }
}

module.exports = { sendEmail, sendTextEmail }
