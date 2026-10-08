const { v4: uuidv4 } = require('uuid')

/**
 * This middleware is used to generate a UUID for each request
 * that is used when logging for that request
 */
module.exports = function (req, res, next) {
  res.locals.requestId = uuidv4()
  next()
}
