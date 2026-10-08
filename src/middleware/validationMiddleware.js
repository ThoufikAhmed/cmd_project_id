/**
 * @module validationMiddleware
 */

const Joi = require('@hapi/joi')
const logger = require('../utils/logger')

/**
 * Custom middleware that will be used to validate the parameters passed in for each request
 * It will combine all the parameters it can find from body, query and params on the req object
 * Validation will be done against this combined object using the provided schema
 * @function
 * @memberof module:validationMiddleware
 * @param {Object} schema
 * @returns {Function}
 */
module.exports = function validationMiddleware (schema) {
  return function (req, res, next) {
    const { body, query, params, originalUrl } = req
    const { locals: { requestId } } = res
    const combinedObject = Object.assign({}, body, query, params)
    try {
      Joi.validate(combinedObject, schema)
    } catch (err) {
      logger.error(err)
    }
    const { error } = Joi.validate(combinedObject, schema)
    if (error !== null) {
      const errorMessage = error.details[0].message.replace(/[^a-zA-Z0-9. ]/g, '')
      logger.error(`${requestId} ${originalUrl} ${errorMessage}`)
      return res.status(400).json({ message: errorMessage })
    }
    next()
  }
}
