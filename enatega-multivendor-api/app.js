require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const engines = require('consolidate')
// const path = require('path')
// const { loadFilesSync } = require('@graphql-tools/load-files')
// const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge')
// const { makeExecutableSchema } = require('@graphql-tools/schema')
const typeDefs = require('./graphql/schema/index')
const resolvers = require('./graphql/resolvers/index')
const paypal = require('./routes/paypal')
const stripe = require('./routes/stripe')
const isAuthenticated = require('./middleware/is-auth')
const graphql = require('graphql')
const morgan = require('morgan')
const cors = require('cors')
const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const session = require('express-session')
const User = require('./models/user.js')
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
const MongoStore = require('connect-mongo')
const Owner = require('./models/owner.js')
const Restaurant = require('./models/restaurant.js')
const Rider = require('./models/rider.js')
const EventEmitter = require('events')
const { pubsub } = require('./helpers/pubsub.js')
const {
  orderCheckUnassigned,
  checkRidersAvailability
} = require('./helpers/orderCheckUnassigned.js')

const emitter = new EventEmitter()

emitter.setMaxListeners(50)

async function startApolloServer() {
  const httpServer = http.createServer(app)
  mongoose
    .connect(config.CONNECTION_STRING, {
      dbName: config.DB_NAME,
      serverSelectionTimeoutMS: 30000
    })
    .then(() => {
      console.log('Connected to DB!')
    })
    .catch(err => {
      console.log(`Couldn't connect to DB!\n`, err)
    })
  // mongoose.set('strictPopulate', false)

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

  // 1) Load all .graphql files (or .js if your typedefs are JS strings)
  // const typeDefsArray = loadFilesSync(
  //   path.join(__dirname, './graphql/schema/**/*.{js,graphql}')
  // )
  // const typeDefs = mergeTypeDefs(typeDefsArray)

  // // 2) Load all resolvers
  // const resolversArray = loadFilesSync(
  //   path.join(__dirname, './graphql/resolvers/**/*.js'),
  //   {
  //     ignoreIndex: true // skip index.js inside resolvers
  //   }
  // )
  // const resolvers = mergeResolvers(resolversArray)

  // const schema = makeExecutableSchema({
  //   typeDefs,
  //   resolvers
  // })
  const schema = graphqlTools.makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const server = new ApolloServer({
    schema,
    uploads: {
      maxFileSize: 10000000, // 10 MB
      maxFieldSize: 10000000 // 10 MB
    },
    debug: true,
    introspection: config.NODE_ENV !== 'production',
    context: ({ req, res }) => {
      if (isAuthenticated(req).isAuth) {
        return new Promise((resolve, reject) => {
          passport.authenticate('jwt', { session: true }, (err, user) => {
            if (err) {
              console.log('Authentication error:', err)
              reject(err)
            }
            if (!user) {
              return reject(new Error('Authentication failed user not found!'))
            }
            const { userType, restaurantId } = isAuthenticated(req)

            req.user = user
            req.userId = user._id
            req.userType = userType
            req.restaurantId = restaurantId
            req.isAuth = true
            resolve({ req, res, user })
          })(req, res)
        })
      }
      // if (!req) return {}
      // const { isAuth, userId, userType, restaurantId } = isAuthenticated(req)
      // req.isAuth = isAuth
      // req.userId = userId
      // req.userType = userType
      // req.restaurantId = restaurantId
      // const user = req.user
      // return { req, res, user }
    },
    // plugins: [SentryConfig],
    formatError: (formattedError, error) => {
      console.log({ error })
      console.log({ formattedError })
      console.log({ errorLocation: formattedError.extensions.exception })
      return {
        message: formattedError.extensions.exception.stacktrace[0],
        extensions: formattedError.extensions
        // code: error.extensions.code,
        // path: error.path
      }
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
          // return { pubsub }
        }
      },
      {
        server: httpServer,
        path: server.graphqlPath
      }
    )
  }

  await server.start()
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
  // app.use(morgan('dev'))
  app.use(
    cors({
      origin: '*'
    })
  )
  app.engine('ejs', engines.ejs)
  app.set('views', './views')
  app.set('view engine', 'ejs')
  server.applyMiddleware({ app })

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
  app.use(
    session({
      secret: 'awesome work',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.CONNECTION_STRING,
        collectionName: 'sessions'
      })
    })
  )
  app.use('/paypal', paypal)
  app.use('/stripe', stripe)
  app.use(passport.initialize())
  app.use(passport.session())

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRETKEY
  }

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      console.log({ jwtPayload })
      try {
        if (jwtPayload.restaurantId) {
          const restaurant = await Restaurant.findById(jwtPayload.restaurantId)
          if (restaurant) {
            return done(null, restaurant)
          }
        } else {
          const user = await User.findById(jwtPayload.userId)
          const owner = await Owner.findById(jwtPayload.userId)
          const rider = await Rider.findById(jwtPayload.userId)
          if (user) {
            return done(null, user)
          }
          if (owner) {
            return done(null, owner)
          }
          if (rider) {
            return done(null, rider)
          }
        }
        // console.log('inside passportjwt', { user, owner })

        return done(null, false)
      } catch (err) {
        return done(err, false)
      }
    })
  )

  orderCheckUnassigned()
  // checkRidersAvailability()
  // populate countries data.
  // await populateCountries()
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
