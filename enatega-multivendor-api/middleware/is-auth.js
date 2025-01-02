const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return {
      isAuth: false
    }
  }
  const token = authHeader?.split(' ')[1]
  if (!token || token === '') {
    return {
      isAuth: false
    }
  }
  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRETKEY)
  } catch (err) {
    return {
      isAuth: false
    }
  }
  if (!decodedToken) {
    return {
      isAuth: false
    }
  }
  return {
    isAuth: true,
    userId: decodedToken.userId,
    userType: decodedToken.userType ? decodedToken.userType : null,
    restaurantId: decodedToken.restaurantId
  }
}
