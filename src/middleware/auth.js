const jwt = require('express-jwt')
const jwks = require('jwks-rsa')

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_JWKS_URI
  }),
  getToken: function fromHeaderOrQueryString (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1]
    } else if (req.query && req.query.token) {
      return req.query.token
    }
    return null
  },
  audience: process.env.AUTH0_AUDIENCE_API,
  issuer: process.env.AUTH0_ISSUER_API,
  algorithms: ['RS256']
})

module.exports.jwtCheck = jwtCheck
