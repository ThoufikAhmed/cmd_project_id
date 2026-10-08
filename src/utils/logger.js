/**
 * @module utils/logger
 */

const { createLogger, format, transports, config } = require('winston')

const dateTimeZoned = () => {
  return new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
}

const logger = createLogger({
  levels: config.syslog.levels,
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: dateTimeZoned }),
    format.json()
  )
})

logger.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}

/**
 * @inner
 * @typedef {Object} metaLogger
 * @property {Function} metaLogger.error
 * @property {Function} metaLogger.info
 */
/**
 * @name logWithMetaData
 * @function
 * @memberof module:utils/logger
 * @param {String} requestId The request id
 * @param {String} originalUrl
 * @returns {metaLogger}
 */
logger.logWithMetaData = function (requestId, originalUrl) {
  return {
    error: (message) => logger.error(`${requestId} ${originalUrl} ${message}`),
    warn: (message) => logger.warn(`${requestId} ${originalUrl} ${message}`),
    info: (message) => logger.info(`${requestId} ${originalUrl} ${message}`),
    http: (message) => logger.http(`${requestId} ${originalUrl} ${message}`),
    verbose: (message) => logger.verbose(`${requestId} ${originalUrl} ${message}`),
    debug: (message) => logger.debug(`${requestId} ${originalUrl} ${message}`),
    silly: (message) => logger.silly(`${requestId} ${originalUrl} ${message}`),
    profile: (message) => logger.profile(`${requestId} {${originalUrl} ${message}`)
  }
}

//  When running on a developers local machine
if (process.env.NODE_ENV === 'local') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize({ all: true }),
      format.printf(info => {
        let message = `${info.timestamp} - ${info.level}: ${info.message}`
        if (info.durationMs) {
          message += ` ${info.durationMs}`
        }

        if (info.stack) {
          message += ` ${info.stack}`
        }
        return message
      })
    )
  }))
}

//  When running in dev or prod server
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  logger.add(new transports.Console())
}

//  When running unit tests
if (process.env.NODE_ENV === 'unit-tests') {
  logger.add(new transports.File({ filename: '/dev/null' }))
}

module.exports = logger
