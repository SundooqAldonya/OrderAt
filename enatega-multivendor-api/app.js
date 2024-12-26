require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const engines = require('consolidate')
const typeDefs = require('./graphql/schema/index')
const resolvers = require('./graphql/resolvers/index')
const paypal = require('./routes/paypal')
const stripe = require('./routes/stripe')
const isAuthenticated = require('./middleware/is-auth')
const graphql = require('graphql')
const morgan = require('morgan')
const cors = require('cors')
const passport = require('passport')
const User = require('./models/user.js')
// const FacebookStrategy = require('passport-facebook').Strategy
const subscriptionTransportWs = require('subscriptions-transport-ws')
const config = require('./config.js')
const graphqlTools = require('@graphql-tools/schema')
const http = require('http')
const populateCountries = require('./helpers/populate-countries-data.js')
const {
  graphqlUploadExpress // A Koa implementation is also exported.
} = require('graphql-upload')
const app = express()

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const { SentryConfig } = require('./helpers/sentry.config.js')

async function startApolloServer() {
  const httpServer = http.createServer(app)
  mongoose
    .connect(config.CONNECTION_STRING, {
      dbName: config.DB_NAME
    })
    .then(() => {
      console.log('Connected to DB!')
    })
    .catch(err => {
      console.log(`Couldn't connect to DB!\n`, err)
    })
  // Ensure to call this before requiring any other modules!
  // initializing bug reporting platform i.e Sentry
  // Sentry.init({
  //   dsn:
  //     'https://7a8412e2828843d77b72312ac60b0f02@o4508511447941120.ingest.de.sentry.io/4508511450169424',
  //   debug: true,
  //   integrations: [
  //     new Sentry.Integrations.Http({ tracing: true }),
  //     new Tracing.Integrations.Express({ app, methods: ['get', 'post'] })
  //   ],
  //   tracesSampleRate: 1.0,
  //   profilesSampleRate: 1.0,
  //   environment: config.NODE_ENV
  // })
  // app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))

  const schema = graphqlTools.makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const server = new ApolloServer({
    schema,
    introspection: config.NODE_ENV !== 'production',
    context: ({ req, res }) => {
      if (!req) return {}
      const { isAuth, userId, userType, restaurantId } = isAuthenticated(req)
      req.isAuth = isAuth
      req.userId = userId
      req.userType = userType
      req.restaurantId = restaurantId
      const user = req.user
      return { req, res, user }
    },
    // plugins: [SentryConfig],
    formatError: (formattedError, error) => {
      console.log({ formattedError })
      console.log({ errorLocation: formattedError.locations[0] })
      // console.log({ formattedError: formattedError.locations });
      // console.log({ formattedError: formattedError.extensions.exception });
    }
  })
  const subscriptionServer = httpServer => {
    return subscriptionTransportWs.SubscriptionServer.create(
      {
        schema,
        execute: graphql.execute,
        subscribe: graphql.subscribe,
        onConnect() {
          console.log('Connected to subscription server.')
        }
      },
      {
        server: httpServer,
        path: server.graphqlPath
      }
    )
  }

  await server.start()
  app.use(graphqlUploadExpress())

  server.applyMiddleware({ app })

  app.engine('ejs', engines.ejs)
  app.set('views', './views')
  app.set('view engine', 'ejs')
  app.use(morgan('dev'))
  app.use(cors())
  // Use JSON parser for all non-webhook routes
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
  app.use(Sentry.Handlers.errorHandler())
  app.use((req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
      next()
    } else {
      bodyParser.json()(req, res, next)
    }
  })
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })
  app.use(express.static('public'))
  app.use('/sentry-crash', (req, res) => {
    throw new Error('Backend Crashed')
  })

  // app.use(passport.initialize())
  // app.use(passport.session())
  // passport.use(
  //   new FacebookStrategy(
  //     {
  //       clientID: '3511551789148450',
  //       clientSecret: '70dd1566ad3201dfd4d6df7ef0855577',
  //       callbackURL: '/auth/facebook/callback',
  //       profileFields: ['id', 'displayName', 'photos', 'email']
  //     },
  //     (accessToken, refreshToken, profile, done) => {
  //       // Here you would typically save the user to your database
  //       return done(null, profile)
  //     }
  //   )
  // )

  // Serialize user into the session
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  // Deserialize user from the session
  passport.deserializeUser((obj, done) => {
    done(null, obj)
  })

  app.use('/paypal', paypal)
  app.use('/stripe', stripe)

  // Make sure to call listen on httpServer, NOT on app.

  // populate countries data.
  await populateCountries()
  //
  await new Promise(resolve => httpServer.listen(config.PORT, resolve))
  // start subscription server
  subscriptionServer(httpServer)

  console.log(
    `🚀 Server ready at http://localhost:${config.PORT}${server.graphqlPath}`
  )
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${config.PORT}${server.graphqlPath}`
  )

  return { server, app, httpServer }
}
startApolloServer()
