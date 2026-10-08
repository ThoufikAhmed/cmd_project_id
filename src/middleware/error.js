const logger = require('../utils/logger')

module.exports = function (err, req, res, next) {
  const { locals: { requestId } } = res

  // Log the error stack
  logger.error(`${requestId} ${req.originalUrl} ${err.stack}`)

  //  Check if the error already has a status or statusCode attached to it
  //  This signifies a default internal server error because no error code was found

  const errorMessageFormat = err.message
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({ message: errorMessageFormat })
  }
  return res.status(500).json({ message: 'Internal Server Error' })
}

//  Catch these exceptions and log them only if in production mode
//  Dev mode should log to console as usual
if (process.env.NODE_ENV === 'production') {
  // uncaught exceptions apart from process pipeline// using emitters
  process.on('uncaughtException', (err, origin) => {
    logger.error(`uncaughtException : ${err.message}`)
    process.exit(1)
  })

  // unhandled promise rejections apart from process pipeline// using emitters
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`unhandledRejection at: ${promise} for the following reason: ${reason}`)
  })
}
