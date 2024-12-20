const ejs = require('ejs')
const path = require('path')
/* eslint-disable quotes */
module.exports = {
  async signupTemplate(params) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../views/Emails/signup.ejs'),
      {
        params: params
      }
    )
    return template
  },
  signupText() {
    return `Congratulations
    You have success created an account for Enatega`
  },
  async placeOrderTemplate(params) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../views/Emails/orderDetail.ejs'),
      {
        params: params
      }
    )

    return template
  },
  placeOrderText(params) {
    return `Hello from Enatega `
  },
  pickupPlaceOrderText(params) {
    return `Order
            You placed an order on Enatega
            Order Id: ${params[0]}
            Items: ${params[1]}
            Addons: ${params[5]}
            PickUp Address: ${params[2]}
            Cost: ${params[3]}
            Total: ${params[4]} `
  },
  pickupPlaceOrderTemplate(params) {
    return `<h1>Order</h1>
    <p>You placed an order on Enatega</p>
    <p>Order Id : ${params[0]}</p>
    <p>Items : ${params[1]}</p>
    <p>Addons : ${params[5]}</p>
    <p> PickUp Address: ${params[2]}</p>
    <p>Cost : ${params[3]}</p>
    <p>Total : ${params[4]}</p>
    `
  },
  orderTemplate(params) {
    return `<h1> Order Status</h1>
    <p>Your order ${params[0]} is ${params[1]}</p>`
  },
  orderText(params) {
    return `Order status
Your orders ${params[0]} is ${params[1]} `
  },
  async resetPasswordTemplate(params) {
    console.log('params: ', params)
    const template = await ejs.renderFile(
      path.join(__dirname, '../views/Emails/verifyAccount.ejs'),
      {
        params: params
      }
    )
    return template
  },
  resetPasswordText(params) {
    return `Hello From Enatega`
  }
}
