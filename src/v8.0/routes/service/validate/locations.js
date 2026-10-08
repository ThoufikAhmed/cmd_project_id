/**
 * Express router for routes related to location validations
 * @module routers/v8/service/validate/locations
 */

const express = require('express')
const router = express.Router()

const asyncMiddleware = require('../../../../middleware/async')
const validationMiddleware = require('../../../../middleware/validationMiddleware')
const validation = require('../../../validation/validate.service.validate.locations.js')
const { locationValidationController } = require('../../../controllers/service')

/**
 * Route for validating the location of a client
 * @name get/service/validate/locations
 * @function
 * @memberof module:routers/v8/service/validate/locations
 * @param {Number} req.query.latitude The latitude coordinate
 * @param {Number} req.query.longitude The longitude coordinate
 * @return {String[]}
 */
router.get('/', validationMiddleware(validation.getLocationValidate), asyncMiddleware(async (req, res) => {
  return await locationValidationController.execute(req, res)
}))

module.exports = router
