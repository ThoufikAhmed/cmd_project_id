const logger = require('../utils/logger')

module.exports = function (req, res, next) {
  const { locals: { requestId } } = res
  const version = res.locals.apiVersion || req.headers.version || '8.0'
  logger.info(`${requestId} version: ${version} ${req.method} ${req.originalUrl}`)
  next()
}
