const dotenv = require('dotenv')
const path = require('path')
dotenv.config({
  path: path.join(__dirname, '.env')
})
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  SERVER_URL: process.env.SERVER_URL,
  PORT: process.env.PORT,
  CONNECTION_STRING: process.env.CONNECTION_STRING,
  RESET_PASSWORD_LINK: process.env.RESET_PASSWORD_LINK,
  STRIPE_WEBHOOK_ENDPOINT_SECRET: process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET,
  DASHBOARD_URL: process.env.DASHBOARD_URL,
  WEB_URL: process.env.WEB_URL,
  ORDER_DETAIL_WEB_URL: process.env.ORDER_DETAIL_WEB_URL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  ZAPIER_WEBHOOK_URL: process.env.ZAPIER_WEBHOOK_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_PORT: process.env.REDIS_PORT,
  DB_NAME: process.env.DB_NAME
}
