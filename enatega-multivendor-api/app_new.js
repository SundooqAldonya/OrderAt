require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { useServer } = require('graphql-ws/lib/use/ws')
const { WebSocketServer } = require('ws')
const { graphqlUploadExpress } = require('graphql-upload')
const engines = require('consolidate')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const graphql = require('graphql')
const config = require('./config')
const paypal = require('./routes/paypal')
const stripe = require('./routes/stripe')
const isAuthenticated = require('./middleware/is-auth')
const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')
const User = require('./models/user')
const Owner = require('./models/owner')
const Restaurant = require('./models/restaurant')
const Rider = require('./models/rider')
const { orderCheckUnassigned } = require('./helpers/orderCheckUnassigned')
const { pubsub } = require('./helpers/pubsub')

async function startApolloServer() {
  const app = express()
  const httpServer = http.createServer(app)

  // ✅ Connect MongoDB
  mongoose
    .connect(config.CONNECTION_STRING, {
      dbName: config.DB_NAME,
      serverSelectionTimeoutMS: 30000
    })
    .then(() => console.log('Connected to DB!'))
    .catch(err => console.error(`Couldn't connect to DB!`, err))

  // ✅ GraphQL Schema
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // ✅ Create Apollo Server
  const server = new ApolloServer({
    schema,
    introspection: config.NODE_ENV !== 'production',
    formatError: (formattedError, error) => {
      console.error('GraphQL Error:', error)
      return {
        message: formattedError.message,
        extensions: formattedError.extensions
      }
    }
  })
  await server.start()

  // ✅ WebSocket Server for Subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  })
  useServer({ schema, context: () => ({ pubsub }) }, wsServer)

  // ✅ Middlewares
  app.use(cors({ origin: '*' }))
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }))
  app.use(bodyParser.json())
  app.use(express.static('public'))

  // ✅ EJS views
  app.engine('ejs', engines.ejs)
  app.set('views', './views')
  app.set('view engine', 'ejs')

  // ✅ Sessions
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

  // ✅ Passport JWT
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRETKEY
  }
  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        if (jwtPayload.restaurantId) {
          const restaurant = await Restaurant.findById(jwtPayload.restaurantId)
          if (restaurant) return done(null, restaurant)
        } else {
          const user =
            (await User.findById(jwtPayload.userId)) ||
            (await Owner.findById(jwtPayload.userId)) ||
            (await Rider.findById(jwtPayload.userId))
          if (user) return done(null, user)
        }
        return done(null, false)
      } catch (err) {
        return done(err, false)
      }
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())

  // ✅ GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        if (isAuthenticated(req).isAuth) {
          return new Promise((resolve, reject) => {
            passport.authenticate('jwt', { session: true }, (err, user) => {
              if (err) {
                console.log('Authentication error:', err)
                reject(err)
              }
              if (!user) {
                return reject(
                  new Error('Authentication failed user not found!')
                )
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
      }
    })
  )

  // ✅ Routes
  app.use('/paypal', paypal)
  app.use('/stripe', stripe)

  // ✅ Background jobs
  orderCheckUnassigned()

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: (connectionParams, webSocket, context) => {
        console.log('🔌 Client connected for subscriptions')
      },
      onDisconnect: () => {
        console.log('❌ Client disconnected')
      }
    },
    {
      server: httpServer,
      path: '/graphql'
    }
  )

  // ✅ Start Server
  const PORT = config.PORT || 4000
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
    console.log(`📡 Subscriptions ready at ws://localhost:${PORT}/graphql`)
  })
}

startApolloServer()
